import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" });

import * as fs from "fs";            
import generateRoute from "./routes/generate.js";
import express from "express";
import session from "express-session";
import path from "path";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import videoRoute from "./routes/video.js";
import Replicate from "replicate";
import { buffer } from "stream/consumers";
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

console.log("OPENAI KEY LOADED:", !!process.env.OPENAI_API_KEY);
console.log("ACTUAL OPENAI KEY VALUE:", process.env.OPENAI_API_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(session({
  secret: "autoshorst_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(bodyParser.json());
app.use("/output", express.static(path.join(__dirname, "output")));
app.use("/api", generateRoute);
app.use(
  session({
    secret: "auto-shorts-secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/api/video", videoRoute);
app.use(express.static(path.join(__dirname, "../public")));
app.use("/output", express.static("server/output"));

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

  // if NOT logged in → send to login
  if (!req.session.user) {
    return res.redirect("/login.html");
  }

  // if logged in → allow access
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

 async function saveBufferToPublic(buffer) {
  const filename = `video-${Date.now()}.gif`;
  const publicDir = path.join(__dirname, "..", "public", "videos");
  const outputPath = path.join(publicDir, filename);

  await fs.promises.mkdir(publicDir, { recursive: true });
  await fs.promises.writeFile(outputPath, buffer);

  return `/videos/${filename}`;
}
/* =========================
   VIDEO GENERATION
========================= */
app.post("/api/generate-video", async (req, res) => {
  try {
    const output = await replicate.run(
      "lucataco/hotshot-xl:78b3a6257e16e4b241245d65c8b2b81ea2e1ff7ed4c55306b511509ddbfd327a",
      {
        input: {
          prompt: req.body.prompt,
        },
      }
    );

    if (!output || typeof output.getReader !== "function") {
      throw new Error("Expected ReadableStream from Replicate.");
    }

    res.setHeader("Content-Type", "video/mp4");

    const reader = output.getReader();

    async function push() {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(Buffer.from(value));
      push();
    }

    push();

  } catch (err) {
    console.error("VIDEO GENERATION ERROR:", err);
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
      success_url: `${process.env.BASE_URL}/success.html`,
      cancel_url: `${process.env.BASE_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
});
app.post("/api/create-account", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Creating account for:", email);
// log user in immediately after account creation
req.session.user = { email };
    // temporary success response
    res.json({ success: true });

  } catch (err) {
    console.error("Create account error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // TEMP simple login check (we will improve later)
  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // save user into session
  req.session.user = { email };

  res.json({ success: true });
});
/* =========================
   SERVER START
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});