require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* =========================
   BASIC TEST ROUTE
========================= */
app.post("/api/test", (req, res) => {
  res.json({ success: true, message: "Hello! How can I assist you today?" });
});

/* =========================
   GENERATE CAPTIONS
========================= */
app.post("/generate-captions", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    // TEMP AI RESPONSE (works without OpenAI)
    const captions = `
1. "Did you know? One fact can change everything! 😲 #${topic.replace(" ", "")}"
2. "Think you know it all? Think again 🔥 #MindBlown"
3. "This shocking fact will leave you speechless 🤯"
4. "Prepare to be amazed 💥 This changes everything"
5. "You won’t believe this fact… but it’s real 😳"
`;

    res.json({
      captions,
      hook: "This fact will blow your mind in 3 seconds…",
      script: `Here’s something wild about ${topic} that nobody talks about…`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   STRIPE CHECKOUT (PRO)
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
      success_url: `${process.env.BASE_URL}?success=true`,
      cancel_url: `${process.env.BASE_URL}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

/* =========================
   FALLBACK
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
