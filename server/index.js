import express from "express";
const response = await fetch("http://api.openai.com/..."):;
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Auto Shorts AI backend running");
});

app.post("/generate", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "No topic provided" });
    }

    const prompt = `
Create viral short-form video content about: "${topic}"

Return:
HOOK:
SCRIPT:
CAPTIONS:
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    res.json({
      hook: text.split("SCRIPT:")[0].replace("HOOK:", "").trim(),
      script: text.split("SCRIPT:")[1].split("CAPTIONS:")[0].trim(),
      captions: text.split("CAPTIONS:")[1].trim(),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});