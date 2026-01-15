import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Needed for ES modules (__dirname replacement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Root route (FIXES Cannot GET /)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Generate endpoint
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    // TEMP placeholder response (stable & working)
    const result = `
### Hook:
Ever wondered why "${prompt}" grabs attention instantly?

### Script (30–45 sec):
Opening shot: bold visual related to "${prompt}".
Narrator: "Most people miss this simple truth about ${prompt}..."
Build curiosity, deliver value, end with a punchline.

### Captions:
• This changed how I see ${prompt}
• You’re doing ${prompt} wrong
• Watch till the end 👀
`;

    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});