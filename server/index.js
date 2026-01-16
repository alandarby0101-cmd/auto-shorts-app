import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import OpenAI from "openai";

dotenv.config();

// =========================
// APP SETUP
// =========================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =========================
// SERVICES
// =========================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================
// HEALTH CHECK (IMPORTANT)
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
- No advice, no meta commentary
- No teaching about content creation
- No headings or labels
- Short, punchy spoken sentences
- Natural human cadence
- 45–60 seconds total
- Strong hook in the first 2 seconds
- Maintain curiosity throughout
- Clear payoff at the end
`;

    const userPrompt = `
Topic: ${prompt}

Write a viral YouTube Shorts script.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const script = completion.choices[0].message.content;

    res.json({
      hook: script.split(".")[0] + ".",
      script,
      captions: [
        `This changes how you think about ${prompt}`,
        `Nobody talks about this with ${prompt}`,
        `Watch this before you scroll`,
        `${prompt} explained in 60 seconds`,
        `This surprised me about ${prompt}`,
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

// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
