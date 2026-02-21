import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Replicate from "replicate";
import fetch from "node-fetch";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", async (req, res) => {
  try {
    const prediction = await replicate.predictions.create({
      version: "78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd327a",
      input: {
        prompt: req.body.prompt,
        num_frames: 24
      }
    });

    // Wait until finished
    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updated = await replicate.predictions.get(prediction.id);
      prediction.status = updated.status;
      prediction.output = updated.output;
    }

    if (prediction.status !== "succeeded") {
      return res.status(400).json({ error: "Replicate prediction failed" });
    }

    if (!prediction.output) {
      return res.status(400).json({ error: "No video returned from Replicate" });
    }

    // 🔥 Hotshot returns a VIDEO URL (not frames)
    const videoUrl = prediction.output[0];

    const out = path.join(__dirname, "../output");
    if (!fs.existsSync(out)) {
      fs.mkdirSync(out, { recursive: true });
    }

    const finalVideoPath = path.join(out, "final.mp4");

    const response = await fetch(videoUrl);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(finalVideoPath, Buffer.from(buffer));

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
