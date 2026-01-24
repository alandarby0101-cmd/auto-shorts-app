import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/", async (req, res) => {
  try {
    const { script } = req.body;

    if (!script) {
      return res.status(400).json({ error: "script missing" });
    }

    const outDir = path.join(__dirname, "../output");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const scriptPath = path.join(outDir, "script.txt");
    fs.writeFileSync(scriptPath, script);

    res.json({
      ok: true,
      scriptLength: script.length
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
