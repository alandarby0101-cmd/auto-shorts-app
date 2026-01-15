import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Needed for ES modules (__dirname replacement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Root route (FIXES Cannot GET /)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Generate endpoint
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are AutoShorts AI.

Generate VIRAL short-form content.

Return STRICT JSON ONLY with:
- hook: array of 2–3 strong hooks
- script: 45–60 second detailed script with narration + scene cues
- captions: array of 8–12 TikTok-style captions

Rules:
- Do NOT repeat content
- Do NOT shorten
- Do NOT include markdown
- JSON only
`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9
    });

    const raw = completion.choices[0].message.content;

    const parsed = JSON.parse(raw);

    res.json(parsed);

  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});
    
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});