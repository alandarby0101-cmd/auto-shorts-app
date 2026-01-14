require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- BASIC SETUP ---------- */
app.use(cors());
app.use(express.json());

/* ---------- STRIPE INIT ---------- */
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------- SERVE FRONTEND ---------- */
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* ---------- STRIPE CHECKOUT ---------- */
app.post("/create-checkout-session", async (req, res) => {
  try {
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error("Missing STRIPE_PRICE_ID");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/?success=true`,
      cancel_url: `${process.env.BASE_URL}/?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe error:", err.message);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});
app.post("/generate-captions", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Missing topic" });
    }

    res.json({
      captions: `🔥 ${topic} that will blow your mind`,
      hook: `You won’t believe this about ${topic}`,
      script: `Here are some crazy facts about ${topic} that most people don’t know...`
    });
  } catch (err) {
    console.error("Generate error:", err.message);
    res.status(500).json({ error: "Generation failed" });
  }
});
/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
