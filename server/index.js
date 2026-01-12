require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// ===================== MIDDLEWARE =====================
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ===================== OPENAI CLIENT ==================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===================== ROUTES =========================

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Test endpoint (confirms OpenAI works)
app.post("/api/test", async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello in one sentence." }],
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

// ===================== START SERVER ===================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});