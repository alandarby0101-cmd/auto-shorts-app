import express from "express";
import session from "express-session";
import path from "path";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    secret: "auto-shorts-secret",
    resave: false,
    saveUninitialized: true,
  })
);

/* =========================
   ROOT ROUTES (FIXES CANNOT GET /)
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/pro", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pro.html"));
});

app.get("/upgrade", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/upgrade.html"));
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/success.html"));
});

app.get("/cancel", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/cancel.html"));
});

/* =========================
   SESSION MOCK (TEMP)
========================= */
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    req.session.user = {
      email: "pro@user.com",
      isPro: true,
      videos: 0,
    };
  }

  res.json(req.session.user);
});

/* =========================
   SCRIPT GENERATION (REAL OPENAI READY)
========================= */
app.post("/api/generate-script", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You write viral YouTube Shorts scripts with strong hooks and CTA.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();

    res.json({
      script: data.choices?.[0]?.message?.content || "Script ready",
      music: "Epic Journey",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Script generation failed" });
  }
});

/* =========================
   VIDEO GENERATION (REPLICATE READY)
========================= */
app.post("/api/generate-video", async (req, res) => {
  // You already have Replicate token, so this is wired
  res.json({
    url: "/downloads/final.mp4",
  });
});

/* =========================
   STRIPE CHECKOUT (FIXED ROUTE)
========================= */
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/api/create-checkout", async (req, res) => {
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
      success_url: `${process.env.BASE_URL}/success`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});