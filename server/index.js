require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// ================== MIDDLEWARE ==================
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ================== OPENAI CLIENT ==================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ================== ROUTES ==================

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ---------- TEST ENDPOINT ----------
app.post("/api/test", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Say hello in one sentence." }
      ],
    });

    res.json({
      success: true,
      message: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI failed" });
  }
});

// ---------- GENERATE CAPTIONS ----------
app.post("/generate-captions", async (req, res) => {
  console.log("➡️ /generate-captions HIT", req.body);
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate 5 short viral YouTube Shorts captions about: ${topic}`,
        },
      ],
    });

    res.json({
      captions: response.choices[0].message.content,
    });
  } catch (err) {
  console.error("OPENAI ERROR 👉", err?.response?.data || err);
  res.status(500).json({ error: "Server error" });
}
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
