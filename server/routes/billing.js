import express from "express";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/*
|--------------------------------------------------------------------------
| CHECKOUT
|--------------------------------------------------------------------------
*/
router.post("/checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/upgrade.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
|--------------------------------------------------------------------------
| WEBHOOK (FINAL)
|--------------------------------------------------------------------------
*/
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // PAYMENT SUCCESS → upgrade user
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (req.session) {
        req.session.user = {
          ...(req.session.user || {}),
          plan: "pro",
          usage: 0,
          limit: 999,
          stripeCustomerId: session.customer
        };
      }

      console.log("✅ USER UPGRADED TO PRO:", session.customer_email);
    }

    // SUBSCRIPTION CANCELED → downgrade user
    if (event.type === "customer.subscription.deleted") {
      if (req.session?.user) {
        req.session.user.plan = "free";
        req.session.user.limit = 2;
      }
      console.log("❌ USER DOWNGRADED");
    }

    res.json({ received: true });
  }
);

export default router;