console.log("pro.js loaded");

/* ======================
   DOM
====================== */
const promptInput = document.querySelector("textarea");
const outputBox = document.querySelector(".output-box");
const generateBtn = document.querySelector("button.generate");
const copyBtn = document.querySelector("button.copy");

const tabButtons = document.querySelectorAll("[data-tab]");
const previewBtn = document.querySelector(".preview-btn");
const videoPreview = document.querySelector(".video-preview");
const musicBox = document.querySelector(".music-box");

/* ======================
   STATE
====================== */
const state = {
  activeTab: "script",
  script: "",
  hook: "",
  caption: ""
};

/* ======================
   TABS (FIXED)
====================== */
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    state.activeTab = btn.dataset.tab;
    renderOutput();
  });
});

/* ======================
   RENDER
====================== */
function renderOutput() {
  outputBox.textContent =
    state[state.activeTab] || "Generated text appears here";
}

/* ======================
   AI GENERATE (FIXED ENDPOINT)
====================== */
generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    outputBox.textContent = "❌ Enter a prompt";
    return;
  }

  outputBox.textContent = "⏳ Generating...";
  musicBox.textContent = "🎵 Selecting music...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) throw new Error("AI request failed");

    const data = await res.json();

    state.script = data.script || "";
    state.hook = data.hook || "";
    state.caption = data.caption || "";

    musicBox.textContent = "🎵 Auto-selected based on script";
    renderOutput();

  } catch (err) {
    console.error(err);
    outputBox.textContent = "❌ Generation failed";
  }
});

/* ======================
   COPY
====================== */
copyBtn.addEventListener("click", () => {
  const text = state[state.activeTab];
  if (!text) return;
  navigator.clipboard.writeText(text);
});

/* ======================
   VIDEO PREVIEW
====================== */
previewBtn.addEventListener("click", () => {
  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%;border-radius:12px">
      <source src="/videos/sample.mp4" type="video/mp4">
    </video>
  `;
});