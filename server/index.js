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
// Stripe redirect routes
app.get("/success", (req, res) => {
  res.redirect("/");
});

app.get("/cancel", (req, res) => {
  res.redirect("/");
});
app.post("/generate-captions", async (req, res) => {
  try {
    const { topic } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You create short viral YouTube Shorts captions." },
        { role: "user", content: `Create 5 short captions about ${topic}` }
      ]
    });

    res.json({
      success: true,
      captions: response.choices[0].message.content
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// ===================== START SERVER ===================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
