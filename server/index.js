require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();

/* =========================
   CORE SETUP
========================= */
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* =========================
   SERVE FRONTEND (FIX)
========================= */
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* =========================
   GENERATE CONTENT
========================= */
app.post("/generate-captions", async (req, res) => {
  try {
    const { topic } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Generate:
- 5 YouTube Shorts captions
- 1 strong hook
- 1 short script
Topic: ${topic}`
        }
      ]
    });

    res.json({ text: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

/* =========================
   STRIPE CHECKOUT
========================= */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: `${process.env.BASE_URL}?success=true`,
      cancel_url: `${process.env.BASE_URL}?canceled=true`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

/* =========================
   FALLBACK (LAST)
========================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
