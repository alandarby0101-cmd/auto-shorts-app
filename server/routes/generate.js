import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/generate-script", async (req, res) => {
  try {
    const { prompt, type } = req.body;

    const systemPrompts = {
      script: "Write a full YouTube Shorts script with hook, body, and CTA. 60–90 words.",
      hook: "Write 3 viral hooks for a YouTube Shorts video.",
      caption: "Write 3 short viral captions for TikTok / YouTube Shorts."
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompts[type] },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;