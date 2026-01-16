import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// =========================
// PATH SETUP (RENDER SAFE)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// APP SETUP
// =========================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =========================
// SERVE FRONTEND
// =========================
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// =========================
// SERVICES
// =========================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================
// HEALTH CHECK
// =========================
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// =========================
// GENERATE SHORTS SCRIPT
// =========================
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const systemPrompt = `
You are a professional viral YouTube Shorts scriptwriter.

ABSOLUTE RULES:
- Output must be READY TO READ ALOUD
- No advice or meta commentary
- No teaching about content creation
- No headings or labels
- Short punchy spoken sentences
- Natural human cadence
- 45–60 seconds total
- Strong hook in the first 2 seconds
- Curiosity throughout
- Clear payoff at the end
`;

    const userPrompt = `Topic: ${prompt}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const script = completion.choices[0].message.content.trim();
    const hook = script.split(".")[0] + ".";

    res.json({
      hook,
      script,
      captions: [
        `This changes how you see ${prompt}`,
        `Nobody talks about this`,
        `Watch before you scroll`,
        `${prompt} in 60 seconds`,
        `This surprised me`,
      ],
    });
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

// =========================
// STRIPE CHECKOUT (PRO)
// =========================
app.get("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/?pro=true`,
      cancel_url: `${process.env.BASE_URL}/`,
    });

    res.redirect(session.url);
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).send("Stripe error");
  }
});
// ===== FREE USAGE + PRO LOCK LOGIC (STEP 2) =====

const FREE_LIMIT = 2;

function getUsageCount() {
  return Number(localStorage.getItem("freeGenerations") || 0);
}

function incrementUsage() {
  const count = getUsageCount() + 1;
  localStorage.setItem("freeGenerations", count);
  return count;
}

function applyProLock() {
  const scriptBox = document.getElementById("scriptOutput")?.closest(".result-box");
  const captionsBox = document.getElementById("captionsOutput")?.closest(".result-box");

  if (scriptBox) scriptBox.classList.add("locked");
  if (captionsBox) captionsBox.classList.add("locked");
}

function handleGenerationLimit() {
  const usage = incrementUsage();

  if (usage > FREE_LIMIT) {
    applyProLock();
    alert("You’ve used your 2 free generations. Upgrade to Pro to unlock unlimited scripts 🚀");
    return false;
  }

  return true;
}

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
