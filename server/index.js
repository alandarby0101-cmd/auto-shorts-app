import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ REQUIRED MIDDLEWARE (THIS WAS MISSING)
app.use(cors());
app.use(express.json()); // <-- THIS FIXES GENERATE
app.use(express.urlencoded({ extended: true }));

// ✅ SERVE ROOT (FIXES "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Auto Shorts API is running");
});

// ✅ GENERATE ENDPOINT
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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You generate viral short-form video content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI bad response:", data);
      return res.status(500).json({ error: "OpenAI error" });
    }

    const output = data.choices[0].message.content;
    res.json({ output });

  } catch (error) {
    console.error("Generate error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});