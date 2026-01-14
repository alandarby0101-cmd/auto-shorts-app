require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

/* ===================== MIDDLEWARE ===================== */
app.use(express.json());

// ✅ FIX: define public folder correctly
const PUBLIC_DIR = path.join(__dirname, "../public");
app.use(express.static(PUBLIC_DIR));

/* ===================== OPENAI ===================== */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ===================== FREE LIMIT ===================== */
const usageMap = {};
const FREE_LIMIT = 2;

/* ===================== ROUTES ===================== */

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Health check (Render uses this)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Generate captions
app.post("/generate-captions", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    usageMap[ip] = usageMap[ip] || 0;

    if (usageMap[ip] >= FREE_LIMIT) {
      return res
        .status(403)
        .json({ error: "Free limit reached. Upgrade to Pro." });
    }

    usageMap[ip]++;

    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Missing topic" });
    }

    const prompt = `
Create short-form viral content for: "${topic}"

Return EXACTLY this format:

CAPTIONS:
- Caption 1 (max 12 words, curiosity-driven)
- Caption 2
- Caption 3

HOOK:
Single hook sentence

SCRIPT:
Short engaging script (4–6 lines)
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message.content;

    const captions =
      text.split("CAPTIONS:")[1]?.split("HOOK:")[0]
        ?.split("-")
        .map(c => c.trim())
        .filter(Boolean) || [];

    const hook =
      text.split("HOOK:")[1]?.split("SCRIPT:")[0]?.trim() || "";

    const script =
      text.split("SCRIPT:")[1]?.trim() || "";

    res.json({ captions, hook, script });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "Generation failed" });
  }
});

/* ===================== START SERVER ===================== */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
