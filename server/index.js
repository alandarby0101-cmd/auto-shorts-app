require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

// ===================== MIDDLEWARE =====================
app.use(express.json());

/* ---------- STRIPE INIT ---------- */
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===================== OPENAI CLIENT ==================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===================== ROUTES =========================

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
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
  console.log(`Server running on port ${PORT}`);
});
