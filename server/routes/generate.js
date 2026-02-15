import express from "express";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/generate", async (req, res) => {
  try {
    const { prompt, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // SYSTEM PROMPT — THIS IS THE IMPORTANT PART
    const systemPrompt = `
You are an AI that ONLY responds in valid JSON.
Do NOT include explanations.
Do NOT include markdown.
Do NOT include labels outside JSON.

Return this exact structure:

{
  "hook": "",
  "script": "",
  "captions": ""
}
`;

    const userPrompt = `
Topic: ${prompt}

Create content suitable for a YouTube Short.
Hook must be punchy (1 line).
Script should be ~30 seconds.
Captions should be hashtags only.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;

    // Parse AI JSON safely
    const parsed = JSON.parse(raw);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, "../output/script.txt");
    res.json(parsed);

  } catch (err) {
    console.error("GENERATE ERROR:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

export default router;