const express = require("express");
const router  = express.Router();
const SiteContent = require("../models/SiteContent");
const { requireAuth } = require("../middleware/auth");

// GET /api/content — public (all content keys)
router.get("/", async (_req, res) => {
  try {
    const items = await SiteContent.find();
    // Return as plain { key: value } map
    const map = {};
    items.forEach(item => { map[item.key] = item.value; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/content/:key — public (single key)
router.get("/:key", async (req, res) => {
  try {
    const item = await SiteContent.findOne({ key: req.params.key });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ key: item.key, value: item.value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/content/:key — admin only (upsert)
router.put("/:key", requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    const item = await SiteContent.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedAt: new Date() },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/content — admin only (bulk upsert)
router.put("/", requireAuth, async (req, res) => {
  try {
    const updates = req.body; // { key: value, ... }
    const ops = Object.entries(updates).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value, updatedAt: new Date() } },
        upsert: true,
      },
    }));
    await SiteContent.bulkWrite(ops);
    res.json({ ok: true, updated: ops.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
