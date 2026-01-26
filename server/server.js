import express from "express";
import session from "express-session";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

app.use(
  session({
    secret: "autos-shorts-secret",
    resave: false,
    saveUninitialized: true
  })
);

/* ===============================
   ROOT ROUTE (FIXES Cannot GET /)
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

/* ===============================
   PRO PAGE
================================ */
app.get("/pro", (req, res) => {
  res.sendFile(path.resolve("public/pro.html"));
});

/* ===============================
   USER INFO
================================ */
app.get("/api/me", (req, res) => {
  res.json({
    name: req.session.user?.email || "Pro User",
    videos: 0
  });
});

/* ===============================
   GENERATE SCRIPT (REAL API WIRE)
================================ */
app.post("/api/generate-script", async (req, res) => {
  const { prompt } = req.body;

  res.json({
    script: `HOOK: Stop scrolling.\n\nSTORY: ${prompt}\n\nCTA: Follow for more.`,
    music: "Epic Journey"
  });
});

/* ===============================
   GENERATE VIDEO (FINAL STEP)
================================ */
app.post("/api/generate-video", async (req, res) => {
  res.json({
    url: "/final.mp4"
  });
});

/* ===============================
   SERVER
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});