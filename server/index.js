require("dotenv").config();

const express = require("express");
const path = require("path");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let usageMap = {};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID,
      quantity: 1
    }],
    success_url: "https://auto-shorts-app.onrender.com",
    cancel_url: "https://auto-shorts-app.onrender.com"
  });

  res.json({ url: session.url });
});

app.post("/generate-captions", async (req, res) => {
  const ip = req.ip;

  if (!usageMap[ip]) usageMap[ip] = 0;
  if (usageMap[ip] >= 2) {
    return res.status(403).json({ error: "Free limit reached. Upgrade to Pro." });
  }

  usageMap[ip]++;

  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Missing topic" });

  const prompt = `
Create short-form viral content for: "${topic}"

Return EXACTLY this format:

CAPTIONS:
- caption
- caption
- caption

HOOK:
single hook sentence

SCRIPT:
short engaging script
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0].message.content;

  const captions = text.split("CAPTIONS:")[1]?.split("HOOK:")[0]?.trim();
  const hook = text.split("HOOK:")[1]?.split("SCRIPT:")[0]?.trim();
  const script = text.split("SCRIPT:")[1]?.trim();

  res.json({ captions, hook, script });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});