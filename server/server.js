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
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

console.log("OPENAI KEY LOADED:", !!process.env.OPENAI_API_KEY);
console.log("ACTUAL OPENAI KEY VALUE:", process.env.OPENAI_API_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.resolve("public")));
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

console.log("RAW OUTPUT:", output);
console.log("TYPE:", typeof output);
console.log("HAS arrayBuffer:", typeof output?.arrayBuffer);
console.log("HAS pipe:", typeof output?.pipe);

   const videoUrl = output;
   
   return res.json({
     ok: true,
     videoUrl
   });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Video generation failed" });
  }
});


// helper: save buffer/stream to disk and return web path
async function saveBufferToPublic(bufferOrStream) {
  const filename = `video-${Date.now()}.mp4`;
  const publicDir = path.join(__dirname, "..", "public", "videos");
  const outPath = path.join(publicDir, filename);
  await fs.promises.mkdir(publicDir, { recursive: true });

  // Node-style readable stream (output.pipe)
if (bufferOrStream && bufferOrStream.getReader) {
  const reader = bufferOrStream.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  await fs.promises.writeFile(outPath, buffer);

  return `/videos/${filename}`;
}
// Web ReadableStream (Replicate)
if (bufferOrStream && typeof bufferOrStream.getReader === "function") {
  const reader = bufferOrStream.getReader();
  const chunks = [];
  let done = false;

  while (!done) {
    const result = await reader.read();
    done = result.done;
    if (result.value) chunks.push(result.value);
  }

  const buffer = Buffer.concat(chunks);
  await fs.promises.writeFile(outPath, buffer);

  return `/videos/${filename}`;
}
  // If it has arrayBuffer() (Response-like / Web stream)
  if (bufferOrStream && typeof bufferOrStream.arrayBuffer === "function") {
    const ab = await bufferOrStream.arrayBuffer();
    await fs.promises.writeFile(outPath, Buffer.from(ab));
    return `/videos/${filename}`;
  }

  // If it's an async iterable (for-await-of)
  try {
    const chunks = [];
    for await (const chunk of bufferOrStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    if (chunks.length) {
      await fs.promises.writeFile(outPath, Buffer.concat(chunks));
      return `/videos/${filename}`;
    }
  } catch (e) {
    // fall through to fallback below
  }

  // If output already contains a URL
  if (typeof bufferOrStream === "string") {
    return bufferOrStream;
  }
  if (bufferOrStream && (bufferOrStream.url || bufferOrStream.url?.())) {
    return bufferOrStream.url || (typeof bufferOrStream.url === "function" ? bufferOrStream.url() : bufferOrStream.url);
  }

  // fallback: try JSON -> string
  return "";
}

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