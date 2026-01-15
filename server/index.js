import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea) {
      return res.status(400).json({ error: "No idea provided" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You generate viral hooks, short-form scripts, and captions for social media.",
          },
          {
            role: "user",
            content: `Create a hook, a short script, and 3 captions about: ${idea}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    const [hook, script, captions] = text.split("\n\n");

    res.json({
      hook: hook || "",
      script: script || "",
      captions: captions || "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});