import express from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", async (req, res) => {

  try {

    // 🔥 Create prediction using correct model version
    const prediction = await replicate.predictions.create({
      version: "78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd327a",
      input: {
        prompt: req.body.prompt,
        num_frames: 24
      }
    });

    // ⏳ Wait for prediction to complete
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updated = await replicate.predictions.get(prediction.id);
      prediction.status = updated.status;
      prediction.output = updated.output;
    }

    if (prediction.status !== "succeeded") {
      return res.status(400).json({ error: "Replicate prediction failed" });
    }

    if (!prediction.output || prediction.output.length === 0) {
      return res.status(400).json({ error: "No frames returned from Replicate" });
    }

    const frames = prediction.output;

    const out = path.join(__dirname, "../output");
    const framesDir = path.join(out, "frames");
    const voicePath = path.join(out, "voice.mp3");
    const framesTxt = path.join(out, "frames.txt");

    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    if (!fs.existsSync(voicePath)) {
      return res.status(400).json({ error: "voice.mp3 not found" });
    }

    // 🔥 GET VOICE DURATION
    const duration = parseFloat(
      execSync(
        `ffprobe -i "${voicePath}" -show_entries format=duration -v quiet -of csv="p=0"`
      ).toString()
    );

    const secondsPerFrame = duration / frames.length;

    // 🔥 BUILD frames.txt from Replicate URLs
    let txt = "";

    for (let i = 0; i < frames.length; i++) {
      const frameUrl = frames[i];
      const framePath = path.join(framesDir, `frame_${i}.jpg`);

      const response = await fetch(frameUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(framePath, Buffer.from(buffer));

      txt += `file '${framePath.replace(/\\/g, "/")}'\n`;
      txt += `duration ${secondsPerFrame}\n`;
    }

    // repeat last frame (ffmpeg requirement)
    txt += `file '${path.join(framesDir, `frame_${frames.length - 1}.jpg`).replace(/\\/g, "/")}'\n`;

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
      videoUrl: "/output/final.mp4"
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
