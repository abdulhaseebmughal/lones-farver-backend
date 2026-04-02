const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort("productId");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:productId", requireAuth, async (req, res) => {
  try {
    const { desc, price, priceNum } = req.body;
    const product = await Product.findOneAndUpdate(
      { productId: req.params.productId },
      { desc, price, priceNum },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/seed", requireAuth, async (req, res) => {
  try {
    const { products } = req.body;
    for (const p of products) {
      await Product.findOneAndUpdate({ productId: p.productId }, p, { upsert: true, new: true });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
