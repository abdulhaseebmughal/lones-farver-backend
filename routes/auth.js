const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const AdminSettings = require("../models/AdminSettings");
const { requireAuth } = require("../middleware/auth");

// Returns the current admin password hash from DB, or hashes the env var on first use
async function getPasswordHash() {
  const setting = await AdminSettings.findOne({ key: "adminPasswordHash" });
  if (setting) return setting.value;
  // First boot: hash the env var password and store it
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "changeme", 10);
  await AdminSettings.create({ key: "adminPasswordHash", value: hash });
  return hash;
}

router.post("/login", async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(401).json({ error: "Forkert adgangskode" });
  try {
    const hash = await getPasswordHash();
    const valid = await bcrypt.compare(password, hash);
    if (!valid) return res.status(401).json({ error: "Forkert adgangskode" });
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both currentPassword and newPassword are required" });
  }
  try {
    const hash = await getPasswordHash();
    const valid = await bcrypt.compare(currentPassword, hash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
    const newHash = await bcrypt.hash(newPassword, 10);
    await AdminSettings.findOneAndUpdate(
      { key: "adminPasswordHash" },
      { value: newHash },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
