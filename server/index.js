require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;
const usageMap = new Map();
/* ---------- BASIC SETUP ---------- */
app.use(cors());
app.use(express.json());

/* ---------- STRIPE INIT ---------- */
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------- OPENAI INIT ---------- */
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY missing");
}
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

/* ---------- GENERATE CONTENT (AI) ---------- */
app.post("/generate-captions", async (req, res) => {
  try {
    const { topic } = req.body;
const userId = req.ip;

const used = usageMap.get(userId) || 0;

if (!req.body.isPro && used >= 2) {
  return res.status(403).json({
    error: "Free limit reached. Please upgrade to Pro."
  });
}

usageMap.set(userId, used + 1);
    if (!topic) {
      return res.status(400).json({ error: "Missing topic" });
    }

    const prompt = `
You are a professional viral short-form content creator.

Create content for the topic: "${topic}"

Return the response in EXACTLY this format:

CAPTIONS:
- Caption 1 (max 12 words, curiosity-driven)
- Caption 2
- Caption 3
- Caption 4
- Caption 5

HOOK:
Write a powerful 2–3 line hook.
Use short dramatic lines.
Make the viewer feel curiosity or urgency.

SCRIPT:
Write a short-form video script (30–45 seconds).
Rules:
- Short sentences
- Line breaks every 1–2 sentences
- Conversational, spoken tone
- Build curiosity and tension
- No emojis in the script
- End naturally (no call to action)
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const text = completion.choices[0].message.content;

    // Simple parsing (safe + flexible)
    const captionsMatch = text.match(/CAPTIONS:[\s\S]*?HOOK:/);
    const hookMatch = text.match(/HOOK:[\s\S]*?SCRIPT:/);
    const scriptMatch = text.match(/SCRIPT:[\s\S]*/);

    res.json({
      captions: captionsMatch
        ? captionsMatch[0]
            .replace("CAPTIONS:", "")
            .replace("HOOK:", "")
            .trim()
        : text,
      hook: hookMatch
        ? hookMatch[0]
            .replace("HOOK:", "")
            .replace("SCRIPT:", "")
            .trim()
        : "",
      script: scriptMatch
        ? scriptMatch[0].replace("SCRIPT:", "").trim()
        : "",
    });
  } catch (err) {
    console.error("❌ Generate error:", err.message);
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
