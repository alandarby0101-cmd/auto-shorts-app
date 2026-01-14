require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   BASIC MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   STRIPE SETUP (TEST MODE)
========================= */
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing");
}
if (!process.env.STRIPE_PRICE_ID) {
  console.error("❌ STRIPE_PRICE_ID missing");
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   SERVE FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

/* =========================
   STRIPE CHECKOUT (FIXED)
========================= */
app.post("/create-checkout-session", async (req, res) => {
  try {
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
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
