import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// --------------------
// Setup
// --------------------
const app = express();
const PORT = process.env.PORT || 10000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// Middleware
// --------------------
app.use(express.json());

// ✅ Serve frontend files
app.use(express.static(path.join(__dirname, "../public")));

// --------------------
// Homepage route
// --------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// --------------------
// Generate content endpoint
// --------------------
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Create:
1) A viral hook
2) A short video script
3) 5 engaging captions

Topic: ${prompt}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "AI response failed" });
    }

    const output = data.choices[0].message.content;

    res.json({ output });
  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});