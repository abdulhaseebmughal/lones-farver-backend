const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { requireAuth } = require("../middleware/auth");
const { sendContactNotification } = require("../email");

// POST /api/contacts — public (from contact form)
router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    // Notify Lone — fire-and-forget, don't fail the request if email fails
    sendContactNotification(contact).catch(() => {});
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contacts — admin only
router.get("/", requireAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/contacts/:id/read — admin marks as read
router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/contacts/:id — admin only
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
