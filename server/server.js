import 'dotenv/config'
import express from "express"
import cors from "cors"
import path from "path"
import session from "express-session"
import { fileURLToPath } from "url"
import billingRoute from "./routes/billing.js";



const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve public folder (RENDER SAFE)
app.use(express.static(path.resolve(__dirname, "../public")));
app.use(cors())
app.use(express.json())

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false
}))

/* ============================
   AUTH MIDDLEWARE
============================ */
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/");
  }
  next();
}

function requirePro(req, res, next) {
  if (!req.session.user?.isPro) {
    return res.redirect("/upgrade.html");
  }
  next();
}
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  // TEMP user (replace with DB later)
  req.session.user = {
    email,
    isPro: true
  };

  res.json({ ok: true });
});
app.post("/login", (req, res) => {
  const { email } = req.body;

  // TEMP user (replace with DB later)
  req.session.user = {
    email,
    isPro: true // toggle false to test lock
  };

  res.json({ ok: true });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

/* ROUTES */
import scriptsRoute from "./routes/scripts.js"
import scenesRoute from "./routes/scenes.js"
import imagesRoute from "./routes/images.js"
import voiceRoute from "./routes/voice.js"
import videoRoute from "./routes/video.js"

/* DEV PRO UNLOCK (TEMP) */
app.get("/dev/pro", (req, res) => {
  req.session.user = { isPro: true };
  res.json({ pro: true });
});
/* DEV PRO UNLOCK (TEMP) */
app.get("/dev/pro", (req, res) => {
  req.session.user = { isPro: true };
  res.json({ pro: true });
});

app.use("/api/billing", billingRoute);
app.use("/api/scripts", scriptsRoute)
app.use("/api/scenes", scenesRoute)
app.use("/api/images", imagesRoute)
app.use("/api/voice", voiceRoute)
app.use("/api/video", videoRoute)

/* PRO PAGE */
app.get("/pro", requireLogin, requirePro, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pro.html"));
});

app.get("/stripe/success-login", (req, res) => {
  req.session.user = {
    email: "stripe-user@temp.com",
    isPro: true,
    needsAccount: true
  };

  res.redirect("/create-account.html");
});
// CREATE ACCOUNT (after Stripe success)
app.post("/api/create-account", (req, res) => {
  const { email, password } = req.body;

  // TEMP user creation (DB later)
  req.session.user = {
    email,
    isPro: true
  };

  res.json({ success: true });
});
// GENERATE SCRIPT (mock AI)
app.post("/api/generate-script", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  // MOCK AI RESPONSE (for now)
  const script = `
HOOK: You won't believe this…
STORY: ${prompt}
CTA: Follow for more insane facts.
`;

  res.json({
    script,
    music: "Epic Journey",
    voice: "Ryan (US Male)",
    previewReady: true
  });
});
// GENERATE SCRIPT (mock AI – working)
app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  const script = `
HOOK:
Did you know this will change how you see ${prompt} forever?

SCRIPT:
Here are 5 insane facts about ${prompt} that most people don’t know.

1. It’s way more powerful than you think
2. It’s been misunderstood for years
3. One mistake can change everything
4. Experts still argue about it
5. Once you know this, you can’t unsee it

CAPTION:
You won’t believe #3 🤯
`;

  res.json({
    script,
    voice: "Ryan (US Male)",
    music: "Epic Journey",
    preview: true
  });
});
// server.js (ADD BELOW YOUR OTHER ROUTES)
app.get("/api/me", (req, res) => {
  res.json({
    name: req.session.user?.email || "Pro User",
    videos: 1
  });
});

app.post("/api/generate-script", (req, res) => {
  res.json({
    script: `HOOK: Stop scrolling.\n\nSTORY: ${req.body.prompt}\n\nCTA: Follow for more.`
  });
});

app.post("/api/generate-video", (req, res) => {
  res.json({ url: "/downloads/final.mp4" });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})