import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", async (req, res) => {
  try {
    const scenesPath = path.join(__dirname, "../output/scenes.json");
    const framesDir = path.join(__dirname, "../output/frames");

    if (!fs.existsSync(scenesPath)) {
      return res.status(400).json({ error: "scenes.json not found" });
    }

    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const scenes = JSON.parse(fs.readFileSync(scenesPath, "utf-8"));

    let index = 1;

    for (const scene of scenes) {
      const prompt = `
Cinematic vertical video frame for TikTok.
Mood: ${scene.emotion}
Scene: ${scene.visual}
Style: dramatic lighting, cinematic, ultra realistic, 4k, film still
`;

      const image = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1792"
      });

      const base64 = image.data[0].b64_json;
      const buffer = Buffer.from(base64, "base64");

      const outputImage = path.join(framesDir, `frame_${index}.png`);
      fs.writeFileSync(outputImage, buffer);

      index++;
    }

    res.json({
      ok: true,
      frames: index - 1,
      folder: "output/frames",
      note: "AI-generated frames created from scenes.json"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
