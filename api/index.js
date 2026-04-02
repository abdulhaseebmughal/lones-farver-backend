require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MongoDB connection cache — reused across serverless warm invocations
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// CORS
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
}));
app.use(express.json());

// Connect DB before every request
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (e) { res.status(500).json({ error: "DB connection failed" }); }
});

// Routes
app.use("/api/auth",     require("../routes/auth"));
app.use("/api/products", require("../routes/products"));
app.use("/api/orders",   require("../routes/orders"));
app.use("/api/contacts", require("../routes/contacts"));
app.get("/api/health",   (_req, res) => res.json({ ok: true, time: new Date() }));

// Local dev: start server
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✓ API running on http://localhost:${PORT}`));
}

module.exports = app;
