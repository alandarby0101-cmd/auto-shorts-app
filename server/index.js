import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You generate viral short-form content: a hook, a 30–45 second script, and 5 short captions."
        },
        {
          role: "user",
          content: `Topic: ${prompt}`
        }
      ],
    });

    const text = completion.choices[0].message.content;

    // Simple structured split
    const hook = text.split("Script")[0].trim();
    const script = text.split("Script")[1]?.split("Captions")[0]?.trim() || "";
    const captions = text.split("Captions")[1]?.trim() || "";

    res.json({ hook, script, captions });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});