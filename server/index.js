require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 3000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------- MIDDLEWARE ----------
app.use(cors());
app.use(express.json());

// IMPORTANT: serve public folder
app.use(express.static(path.join(__dirname, "../public")));

// ---------- ROOT (THIS FIXES YOUR ISSUE) ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ---------- HEALTH CHECK ----------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------- GENERATE CONTENT ----------
app.post("/generate-captions", (req, res) => {
  const { topic } = req.body;

  res.json({
    captions: [
      `😲 Did you know this about ${topic}?`,
      `🤯 This ${topic} fact will blow your mind`,
      `🔥 Everyone is talking about ${topic}`,
      `🚨 You won’t believe this ${topic} fact`,
      `👀 Watch before they delete this about ${topic}`
    ],
    hook: `Wait until you hear this about ${topic}...`,
    script: `Most people don't know this, but ${topic} has a secret that changes everything. Stay till the end.`
  });
});

// ---------- STRIPE CHECKOUT ----------
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
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

// ---------- FALLBACK (KEEP LAST) ----------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
