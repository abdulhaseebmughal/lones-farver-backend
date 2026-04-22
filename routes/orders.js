const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { requireAuth } = require("../middleware/auth");
const { sendConfirmationEmail } = require("../email");

// POST /api/orders — public (customer places order)
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({ orderNumber: order.orderNumber, id: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — admin only
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — admin only
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id/status — admin only (update status)
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/confirm — admin confirms order + sends email
router.post("/:id/confirm", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });

    // Update status
    order.status = "confirmed";

    // Send confirmation email
    const emailResult = await sendConfirmationEmail(order);
    order.emailSent = emailResult.success;

    await order.save();
    res.json({ order, emailSent: emailResult.success, emailError: emailResult.error || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id — admin only
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
