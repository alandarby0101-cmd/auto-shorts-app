import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import path from "path";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../public")))
/* =========================
   MIDDLEWARE
========================= */
app.use(bodyParser.json());

app.use(
  session({
    secret: "auto-shorts-secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, "../public")));

/* =========================
   STRIPE SUCCESS LOGIN
========================= */
app.get("/stripe/success-login", (req, res) => {
  req.session.user = {
    email: "pro@user.com",
    isPro: true,
    videos: 0,
  };
  res.redirect("/pro");
});


/* =========================
   ROOT ROUTES
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
   SESSION API
========================= */
app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.json({ isPro: false, videos: 0 });
  }
  res.json(req.session.user);
});

/* =========================
   SCRIPT GENERATION
========================= */
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    let music = "Neutral cinematic background";
    const p = prompt.toLowerCase();

    if (p.includes("crime") || p.includes("dark")) {
      music = "Dark suspense cinematic";
    } else if (p.includes("sad") || p.includes("depression")) {
      music = "Slow emotional piano";
    } else if (p.includes("motivation")) {
      music = "Uplifting epic cinematic";
    } else if (p.includes("facts") || p.includes("history")) {
      music = "Subtle documentary background";
    }

    res.json({
      script: "SCRIPT GOES HERE (stub)",
      hook: "HOOK GOES HERE (stub)",
      captions: "CAPTIONS GO HERE (stub)",
      music
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
});

 
/* =========================
   VIDEO GENERATION
========================= */
app.post("/api/generate-video", async (req, res) => {
  try {
    // this is where Replicate will plug in later
    // for now it returns a real downloadable file path

    const videoUrl = "/videos/sample.mp4";

    res.json({ url: videoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Video generation failed" });
  }
});

/* =========================
   STRIPE CHECKOUT
========================= */
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
      success_url: `${process.env.BASE_URL}/stripe/success-login`,
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
  console.log(`🚀 Server running on port ${PORT}`);
});