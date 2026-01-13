import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ===============================
   GENERATE CAPTIONS / HOOK / SCRIPT
================================ */
app.post("/generate-captions", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const prompt = `
You are a viral YouTube Shorts content engine.

Topic: "${topic}"

Create the following:

HOOK:
- Max 12 words
- Extremely attention grabbing
- Spoken language

SCRIPT:
- 20 to 40 seconds
- Fast paced
- Built for retention
- No emojis

CAPTIONS:
- 5 short viral captions

SCENES:
- Scene 1: visual idea
- Scene 2: visual idea
- Scene 3: visual idea

Format EXACTLY like this:

HOOK:
<text>

SCRIPT:
<text>

CAPTIONS:
1. ...
2. ...
3. ...
4. ...
5. ...

SCENES:
- Scene 1: ...
- Scene 2: ...
- Scene 3: ...
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const output = completion.choices[0].message.content;

    const hook = output.match(/HOOK:\s*([\s\S]*?)SCRIPT:/)?.[1]?.trim();
    const script = output.match(/SCRIPT:\s*([\s\S]*?)CAPTIONS:/)?.[1]?.trim();
    const captions = output.match(/CAPTIONS:\s*([\s\S]*?)SCENES:/)?.[1]?.trim();
    const scenes = output.match(/SCENES:\s*([\s\S]*)/)?.[1]?.trim();

    res.json({
      hook,
      script,
      captions,
      scenes,
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
