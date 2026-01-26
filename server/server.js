import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));
app.use("/downloads", express.static("downloads"));

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);

/* ===============================
   USER
================================*/
app.get("/api/me", (req, res) => {
  res.json({
    name: req.session.user?.email || "Pro User",
    videos: 0,
  });
});

/* ===============================
   SCRIPT (OPENAI REAL)
================================*/
app.post("/api/generate-script", async (req, res) => {
  const { prompt } = req.body;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write viral short-form scripts." },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await r.json();
  const script = data.choices[0].message.content;

  fs.writeFileSync("script.txt", script);
  res.json({ script });
});

/* ===============================
   SCENES
================================*/
app.post("/api/generate-scenes", (req, res) => {
  const scenes = fs.readFileSync("script.txt", "utf8")
    .split("\n")
    .filter(Boolean)
    .slice(0, 5);

  fs.writeFileSync("scenes.txt", scenes.join("\n"));
  res.json({ scenes });
});

/* ===============================
   IMAGES (DALL·E)
================================*/
app.post("/api/generate-images", async (req, res) => {
  const scenes = fs.readFileSync("scenes.txt", "utf8").split("\n");
  if (!fs.existsSync("images")) fs.mkdirSync("images");

  for (let i = 0; i < scenes.length; i++) {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: scenes[i],
        size: "1024x1024"
      })
    });

    const img = await r.json();
    const b64 = img.data[0].b64_json;
    fs.writeFileSync(`images/${i}.png`, Buffer.from(b64, "base64"));
  }

  res.json({ success: true });
});

/* ===============================
   VIDEO (FFMPEG REAL)
================================*/
app.post("/api/render-video", (req, res) => {
  if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

  execSync(`
    ffmpeg -y -r 1 -i images/%d.png \
    -c:v libx264 -vf fps=30 -pix_fmt yuv420p \
    downloads/final.mp4
  `);

  res.json({ url: "/downloads/final.mp4" });
});

/* ===============================
   START
================================*/
app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});