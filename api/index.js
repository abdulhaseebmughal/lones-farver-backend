require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://lonesfarver.dk",
  "https://lonesfarver.dk",
  "http://www.lonesfarver.dk",
  "https://www.lonesfarver.dk",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  exposedHeaders: ["Content-Disposition"],
}));

// ── Security headers ──────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), notifications=(), push=(), interest-cohort=()");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── MongoDB connection (cached for Vercel serverless warm invocations) ─────────
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (e) { res.status(500).json({ error: "DB connection failed" }); }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       require("../routes/auth"));
app.use("/api/products",   require("../routes/products"));
app.use("/api/orders",     require("../routes/orders"));
app.use("/api/contacts",   require("../routes/contacts"));
app.use("/api/newsletter", require("../routes/newsletter"));
app.use("/api/content",    require("../routes/content"));
app.use("/api/events",     require("../routes/events"));
app.use("/api/upload",     require("../routes/upload"));

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date() }));

// ── Local dev ─────────────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`✓ API → http://localhost:${PORT}`));
  });
}

module.exports = app;
