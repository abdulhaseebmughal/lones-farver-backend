const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");
const { requireAuth } = require("../middleware/auth");
const { sendNewsletterWelcome } = require("../email");

// POST /api/newsletter — public (subscribe)
router.post("/", async (req, res) => {
  try {
    const { email, lang = "DA" } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // Upsert — ignore if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.json({ ok: true, alreadySubscribed: true });

    const subscriber = new Newsletter({ email, lang });
    await subscriber.save();

    // Send welcome email (fire-and-forget — don't fail the request if email fails)
    sendNewsletterWelcome(email, lang).catch(() => {});

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/newsletter — admin only
router.get("/", requireAuth, async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/newsletter/:id — admin only
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
