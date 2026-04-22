const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");

// GET /api/products — public
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort("productId");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:productId — admin only (update desc, price, imageKey)
router.put("/:productId", requireAuth, async (req, res) => {
  try {
    const { desc, price, priceNum, imageKey } = req.body;
    const update = { desc, price, priceNum };
    if (imageKey !== undefined) update.imageKey = imageKey;
    const product = await Product.findOneAndUpdate(
      { productId: req.params.productId },
      update,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — admin only, create a new product
router.post("/", requireAuth, async (req, res) => {
  try {
    const { productId, name, desc, price, priceNum, category, size, tag, imageKey } = req.body;
    if (!productId || !name) return res.status(400).json({ error: "productId and name are required" });
    const existing = await Product.findOne({ productId });
    if (existing) return res.status(409).json({ error: "Product ID already exists" });
    const product = await Product.create({ productId, name, desc, price, priceNum, category, size, tag, imageKey });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/seed — admin only, seeds defaults if DB is empty
router.post("/seed", requireAuth, async (req, res) => {
  try {
    const { products } = req.body;
    for (const p of products) {
      await Product.findOneAndUpdate(
        { productId: p.productId },
        p,
        { upsert: true, new: true }
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:productId — admin only
router.delete("/:productId", requireAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ productId: req.params.productId });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
