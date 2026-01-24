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
    // ===============================
    // 1. Read script (SINGLE SOURCE OF TRUTH)
    // ===============================
    const scriptPath = path.join(__dirname, "../output/script.txt");
    if (!fs.existsSync(scriptPath)) {
      return res.status(400).json({ error: "script.txt not found" });
    }

    const script = fs.readFileSync(scriptPath, "utf-8");

    // ===============================
    // 2. AI DIRECTOR (THE BRAIN)
    // ===============================
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" }, // FORCE JSON
      messages: [
        {
          role: "system",
          content: `
You are a professional documentary video director.

Break the script into 5–8 SHORT scenes for a vertical video.

Return ONLY valid JSON in this format:

{
  "scenes": [
    {
      "text": "...",
      "visual": "...",
      "type": "stock | ai_video | motion",
      "emotion": "tension | mystery | calm | shock",
      "duration": number (1.5–4)
    }
  ]
}

RULES:
- Max 3 scenes may be "ai_video"
- Use stock for most scenes
- Use motion for photos / documents
- Strong pacing
- Visual variety
- No filler scenes
          `
        },
        {
          role: "user",
          content: script
        }
      ]
    });

    // ===============================
    // 3. PARSE + VALIDATE (NO SILENT FAILS)
    // ===============================
    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
      throw new Error("AI did not return scenes array");
    }

    let aiCount = 0;
    const scenes = parsed.scenes.map(scene => {
      if (scene.type === "ai_video") {
        aiCount++;
        if (aiCount > 3) scene.type = "stock";
      }
      return scene;
    });

    // ===============================
    // 4. WRITE SCENES.JSON (CONTRACT FILE)
    // ===============================
    const outPath = path.join(__dirname, "../output/scenes.json");
    fs.writeFileSync(outPath, JSON.stringify(scenes, null, 2));

    res.json({ ok: true, scenes });

  } catch (err) {
    console.error("SCENES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
