console.log("pro.js loaded");

/* =========================
   DOM ELEMENTS
========================= */
const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

const tabScript = document.getElementById("tab-script");
const tabHook = document.getElementById("tab-hook");
const tabCaption = document.getElementById("tab-caption");

const previewBtn = document.getElementById("previewBtn");
const videoPreview = document.getElementById("videoPreview");
const musicBox = document.getElementById("musicBox");

/* =========================
   APP STATE
========================= */
const state = {
  activeTab: "script",
  script: "",
  hook: "",
  caption: ""
};

/* =========================
   TAB SWITCHING
========================= */
function setActiveTab(tab) {
  state.activeTab = tab;

  tabScript.classList.toggle("active", tab === "script");
  tabHook.classList.toggle("active", tab === "hook");
  tabCaption.classList.toggle("active", tab === "caption");

  renderOutput();
}

tabScript?.addEventListener("click", () => setActiveTab("script"));
tabHook?.addEventListener("click", () => setActiveTab("hook"));
tabCaption?.addEventListener("click", () => setActiveTab("caption"));

/* =========================
   RENDER OUTPUT
========================= */
function renderOutput() {
  const text = state[state.activeTab];
  outputBox.innerText = text || "Generated text appears here";
}

/* =========================
   GENERATE (AI)
========================= */
generateBtn?.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    outputBox.innerText = "❌ Please enter a prompt.";
    return;
  }

  outputBox.innerText = "⏳ Generating...";
  musicBox.innerText = "🎵 Selecting music...";

  try {
    const res = await fetch("/api/generate-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt
      })
    });

    if (!res.ok) throw new Error("AI request failed");

    const data = await res.json();

    state.script = data.script || "";
    state.hook = data.hook || "";
    state.caption = data.caption || "";

    musicBox.innerText = `🎵 Auto-selected based on script`;
    renderOutput();

  } catch (err) {
    console.error(err);
    outputBox.innerText = "❌ Generation failed";
  }
});

/* =========================
   COPY
========================= */
copyBtn?.addEventListener("click", () => {
  const text = state[state.activeTab];
  if (!text) return;
  navigator.clipboard.writeText(text);
});

/* =========================
   VIDEO PREVIEW
========================= */
previewBtn?.addEventListener("click", () => {
  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%; border-radius:12px;">
      <source src="/videos/sample.mp4" type="video/mp4">
    </video>
  `;
});