const express = require("express");
const multer  = require("multer");
const https   = require("https");
const path    = require("path");
const router  = express.Router();
const UploadedImage = require("../models/UploadedImage");
const { requireAuth } = require("../middleware/auth");

const ALLOWED = /jpeg|jpg|png|gif|webp/;
const MAX_MB  = 8;

// Memory storage — no disk writes, works on Vercel serverless
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const mime = (file.mimetype.split("/")[1] || "").toLowerCase();
    const ok = ALLOWED.test(ext) && ALLOWED.test(mime);
    cb(ok ? null : new Error("Only image files allowed"), ok);
  },
});

// Upload base64 image to ImgBB, returns { url, delete_url, id }
function uploadToImgBB(base64Data, name) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) return reject(new Error("IMGBB_API_KEY not configured"));

    const body = new URLSearchParams({ image: base64Data, name }).toString();
    const options = {
      hostname: "api.imgbb.com",
      path:     `/1/upload?key=${apiKey}`,
      method:   "POST",
      headers: {
        "Content-Type":   "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (!json.success) return reject(new Error(json.error?.message || "ImgBB upload failed"));
          resolve({
            url:        json.data.display_url || json.data.url,
            deleteUrl:  json.data.delete_url || "",
            id:         json.data.id || "",
          });
        } catch (e) {
          reject(new Error("Invalid ImgBB response"));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// POST /api/upload — admin only
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Build unique filename
    const ext  = path.extname(req.file.originalname).toLowerCase();
    const base = path.basename(req.file.originalname, ext)
      .replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
    const filename = `${base}-${Date.now()}${ext}`;

    // Upload to ImgBB
    const base64 = req.file.buffer.toString("base64");
    const imgbb  = await uploadToImgBB(base64, filename);

    // Save metadata to MongoDB so we can list/delete later
    await UploadedImage.create({
      filename,
      url:       imgbb.url,
      deleteUrl: imgbb.deleteUrl,
      imgbbId:   imgbb.id,
    });

    res.json({ url: imgbb.url, filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/upload — admin only (list all uploads)
router.get("/", requireAuth, async (_req, res) => {
  try {
    const images = await UploadedImage.find().sort({ createdAt: -1 });
    res.json(images.map(img => ({ filename: img.filename, url: img.url })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/upload/:filename — admin only (remove from our DB record)
router.delete("/:filename(*)", requireAuth, async (req, res) => {
  try {
    await UploadedImage.findOneAndDelete({ filename: req.params.filename });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
