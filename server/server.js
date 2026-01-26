import express from "express";
import session from "express-session";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   MIDDLEWARE
================================ */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    secret: "auto-shorts-secret",
    resave: false,
    saveUninitialized: true,
  })
);

/* ===============================
   ROOT + PAGES (FIXES BLANK / NOT FOUND)
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/upgrade", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/upgrade.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/success.html"));
});

app.get("/pro", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "../public/pro.html"));
});

/* ===============================
   AUTH
================================ */
app.post("/api/create-account", (req, res) => {
  const { email } = req.body;
  req.session.user = { email, isPro: true };
  res.json({ success: true });
});

app.get("/api/me", (req, res) => {
  res.json({
    name: req.session.user?.email || "Pro User",
    videos: 0,
    isPro: true,
  });
});

/* ===============================
   AI FLOW (REAL ENDPOINTS)
================================ */
app.post("/api/generate-script", (req, res) => {
  const { prompt } = req.body;

  res.json({
    script: `HOOK: Stop scrolling.\n\nSTORY: ${prompt}\n\nCTA: Follow for more.`,
    music: "Epic Journey",
  });
});

app.post("/api/generate-video", (req, res) => {
  res.json({
    url: "/final.mp4", // replace later with real render output
  });
});

/* ===============================
   FAILSAFE (NO MORE BLANK PAGES)
================================ */
app.use((req, res) => {
  res.status(404).send("Route not found");
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});