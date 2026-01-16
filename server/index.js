import express from "express";
import path from "path";
import Stripe from "stripe";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Generate content (FREE = still long scripts)
app.post("/generate", (req, res) => {
  const { prompt } = req.body;

  const hook = `
Did you know this about ${prompt}?
Most people get this completely wrong — and that’s why their videos flop.
`;

  const script = `
SCRIPT (70–80 seconds)

Opening shot:
Strong visual directly related to "${prompt}".
Fast movement. No talking for the first second.

Problem:
Most creators fail with ${prompt} because they explain too early instead of creating curiosity.

Explanation:
The algorithm rewards retention, not intelligence.
If viewers don’t feel tension, they swipe.
${prompt} only works when curiosity is sustained.

Solution:
Start with tension.
Delay the payoff.
Reveal the insight only after the viewer is invested.

Payoff:
Here’s what actually works with ${prompt} — and why almost nobody uses it.

CTA:
Follow for more insights like this.
`;

  const captions = `
• This changed how I think about ${prompt}
• Everyone gets ${prompt} wrong — here’s why
• Watch this before you try ${prompt}
• The mistake nobody tells you about ${prompt}
• Why most people fail at ${prompt}
`;

  res.json({ hook, script, captions });
});

// Stripe checkout
app.get("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: "/?pro=true",
    cancel_url: "/",
  });

  res.redirect(session.url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});