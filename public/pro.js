console.log("pro.js loaded");

// ============================
// APP STATE
// ============================
const state = {
  prompt: "",
  script: "",
  hook: "",
  caption: "",
  activeTab: "script"
};

// ============================
// ELEMENTS
// ============================
const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const musicBox = document.getElementById("musicBox");
const videoPreview = document.getElementById("videoPreview");

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");

const tabs = document.querySelectorAll("[data-tab]");

// ============================
// RENDER OUTPUT
// ============================
function renderOutput() {
  const value = state[state.activeTab];
  outputBox.innerText = value || "Generated text will appear here...";
}

// ============================
// TAB SWITCHING
// ============================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    state.activeTab = tab.dataset.tab;
    renderOutput();
  });
});

// ============================
// GENERATE BUTTON
// ============================
generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    outputBox.innerText = "❌ Please enter a topic first.";
    return;
  }

  state.prompt = prompt;
  outputBox.innerText = "⏳ Generating...";
  musicBox.innerText = `🎵 Auto-selected music for: ${prompt}`;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!res.ok) {
      throw new Error("API request failed");
    }

    const data = await res.json();

    state.script = data.script || "";
    state.hook = data.hook || "";
    state.caption = data.captions || "";

    renderOutput();

  } catch (err) {
    console.error(err);
    outputBox.innerText = "❌ AI generation failed. Check server logs.";
  }
});

// ============================
// COPY BUTTON
// ============================
copyBtn.addEventListener("click", () => {
  const text = state[state.activeTab];
  if (!text) return;

  navigator.clipboard.writeText(text);
});