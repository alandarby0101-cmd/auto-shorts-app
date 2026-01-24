import express from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", async (req, res) => {
// PROFIT PROTECTION
const user = req.session.user;

if (!user) {
  return res.status(401).json({ error: "Not logged in" });
}

if (user.usage >= user.limit) {
  return res.status(403).json({
    error: "Monthly video limit reached. Upgrade to continue."
  });
}

  try {
    const out = path.join(__dirname, "../output");
    const framesDir = path.join(out, "frames");
    const voicePath = path.join(out, "voice.mp3");
    const framesTxt = path.join(out, "frames.txt");

    if (!fs.existsSync(voicePath)) {
      return res.status(400).json({ error: "voice.mp3 not found" });
    }

    const frames = fs.readdirSync(framesDir).filter(f => f.endsWith(".png"));
    if (frames.length === 0) {
      return res.status(400).json({ error: "no frames found" });
    }

    // 🔥 GET VOICE DURATION
    const duration = parseFloat(
      execSync(
        `ffprobe -i "${voicePath}" -show_entries format=duration -v quiet -of csv="p=0"`
      ).toString()
    );

    const secondsPerFrame = duration / frames.length;

    // BUILD frames.txt
    let txt = "";
    frames.forEach(f => {
      txt += `file '${path.join(framesDir, f).replace(/\\/g, "/")}'\n`;
      txt += `duration ${secondsPerFrame}\n`;
    });

    // repeat last frame (ffmpeg requirement)
    txt += `file '${path.join(framesDir, frames[frames.length - 1]).replace(/\\/g, "/")}'\n`;

    fs.writeFileSync(framesTxt, txt);

    const videoOnly = path.join(out, "video_only.mp4");
    const finalVideo = path.join(out, "final.mp4");

    // frames → video
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${framesTxt}" -vsync vfr -pix_fmt yuv420p "${videoOnly}"`,
      { stdio: "inherit" }
    );

    // video + voice
    execSync(
      `ffmpeg -y -i "${videoOnly}" -i "${voicePath}" -map 0:v:0 -map 1:a:0 -c:v libx264 -c:a aac -shortest "${finalVideo}"`,
      { stdio: "inherit" }
    );

    res.json({
      ok: true,
      frames: frames.length,
      duration,
      secondsPerFrame,
      output: "final.mp4"
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
