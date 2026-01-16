import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt required" });
    }

    const systemPrompt = `
You are a professional viral YouTube Shorts scriptwriter.

ABSOLUTE RULES:
- Output must be READY TO READ ALOUD
- No advice, no meta commentary
- No teaching about content creation
- No headings inside the script
- Short punchy spoken sentences
- Natural human cadence
- Reset curiosity every 2–4 seconds
- Works for AI voiceovers
- Adapt to ANY topic
- End with a soft follow CTA

The script must sound like a real creator speaking to camera.
`;

    const userPrompt = `
Topic: ${prompt}

Generate:
1) A 1–2 line hook
2) A 60–80 second SPOKEN YouTube Shorts script
3) 5 short viral captions

Output EXACTLY in this format:

HOOK:
<text>

SCRIPT:
<spoken script>

CAPTIONS:
- caption
- caption
- caption
- caption
- caption
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.95,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const result = completion.choices[0].message.content;

    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});