import 'dotenv/config'
import express from "express"
import cors from "cors"
import path from "path"
import session from "express-session"
import { fileURLToPath } from "url"
import billingRoute from "./routes/billing.js";



const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, "../public")));
app.use(cors())
app.use(express.json())

app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false
}))

app.use(express.static(path.join(__dirname, "../public")))
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


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})