import express from "express";
import path from "path";
import Stripe from "stripe";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
 res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  const hook = `HOOK:\nDid you know this about ${prompt}? Most people scroll past this without realising why it matters…`;

  const script = `SCRIPT (45–60 seconds):

Opening shot: Strong visual tied directly to "${prompt}"

Narrator:
Most people think they understand ${prompt}, but there’s one thing almost nobody talks about…

Here’s the truth:
[Deliver real insight, contradiction, or curiosity gap]

This is why creators who understand ${prompt} keep people watching till the end.
And once you see it, you can’t unsee it.

End with punchline or reveal.`;

  const captions = `CAPTIONS:
• This changed how I see ${prompt}
• You're doing ${prompt} wrong
• Watch till the end 👀
• Nobody talks about this
• This is why it works`;

  res.json({ hook, script, captions });
});

app.get("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{
      price: process.env.STRIPE_PRICE_ID,
      quantity: 1
    }],
    success_url: "/?pro=true",
    cancel_url: "/"
  });

  res.redirect(session.url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));