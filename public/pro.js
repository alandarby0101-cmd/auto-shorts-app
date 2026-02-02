
/* ===============================
   pro.js — CLEAN + WORKING
   =============================== */

console.log("✅ pro.js loaded");

/* ===============================
   STATE
================================ */
let currentTab = "script";

let generated = {
  script: "",
  hook: "",
  caption: "",
  music: "",
  videoUrl: ""
};

/* ===============================
   ELEMENTS
================================ */
const promptInput   = document.getElementById("promptInput");
const outputBox     = document.getElementById("outputBox");
const musicBox      = document.getElementById("musicBox");
const videoPreview  = document.getElementById("videoPreview");

const generateBtn   = document.getElementById("generateBtn");
const copyBtn       = document.getElementById("copyBtn");
const previewBtn    = document.getElementById("previewBtn");
const finalBtn      = document.getElementById("finalBtn");

/* ===============================
   TABS (SCRIPT / HOOK / CAPTION)
================================ */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    currentTab = tab.dataset.type;
    outputBox.innerText = generated[currentTab] || "Nothing generated yet…";
  });
});

/* ===============================
   GENERATE SCRIPT (REAL API)
================================ */
generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    outputBox.innerText = "❌ Please enter a prompt first.";
    return;
  }

  outputBox.innerText = "⏳ Generating…";

  try {
    const res = await fetch("/api/generate-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    // EXPECTED BACKEND RESPONSE
    // {
    //   script: "...",
    //   hook: "...",
    //   caption: "...",
    //   music: "..."
    // }

    generated.script  = data.script  || "No script returned";
    generated.hook    = data.hook    || "No hook returned";
    generated.caption = data.caption || "No caption returned";
    generated.music   = data.music   || "Auto-selected music";

    outputBox.innerText = generated[currentTab];
    musicBox.innerText  = generated.music;

  } catch (err) {
    console.error(err);
    outputBox.innerText = "❌ Error generating content.";
  }
});

/* ===============================
   COPY BUTTON
================================ */
copyBtn.addEventListener("click", () => {
  const text = generated[currentTab];
  if (!text) return;

  navigator.clipboard.writeText(text);
  copyBtn.innerText = "Copied!";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
});

/* ===============================
   PREVIEW VIDEO (WORKS)
================================ */
previewBtn.addEventListener("click", () => {
  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%; border-radius:14px;">
      <source src="/videos/sample.mp4" type="video/mp4">
    </video>
  `;
});

/* ===============================
   FINAL VIDEO GENERATION
================================ */
finalBtn.addEventListener("click", async () => {
  finalBtn.innerText = "Generating…";

  try {
    const res = await fetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(generated)
    });

    const data = await res.json();

    // EXPECTED:
    // { url: "/downloads/final.mp4" }

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Video generation failed.");
    }

  } catch (err) {
    console.error(err);
    alert("Error generating final video.");
  }

  finalBtn.innerText = "Generate Final Short";
});