import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic required" });
  }

  const script = `
In 1998, a quiet town hid a secret no one saw coming.

What began as a normal night turned into one of the most disturbing true crime stories ever recorded.

And the scariest part?
It was someone they trusted.
`;

  res.json({ script });
});

export default router;
