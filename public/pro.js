console.log("pro.js loaded");

/* =========================
   DOM ELEMENTS
========================= */

const scriptTab = document.getElementById("tab-script");
const hookTab = document.getElementById("tab-hook");
const captionTab = document.getElementById("tab-caption");

const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const musicBox = document.getElementById("musicBox");
const videoPreview = document.getElementById("videoPreview");

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");

/* =========================
   HARD FAIL IF DOM IS WRONG
========================= */

if (
  !scriptTab ||
  !hookTab ||
  !captionTab ||
  !promptInput ||
  !outputBox ||
  !musicBox ||
  !videoPreview ||
  !generateBtn ||
  !copyBtn ||
  !previewBtn
) {
  console.error("❌ Required DOM elements missing");
  throw new Error("Required DOM elements missing");
}

/* =========================
   APP STATE
========================= */

const state = {
  activeTab: "script",
  prompt: "",
  script: "",
  hook: "",
  caption: "",
  videoReady: false,
};

/* =========================
   TAB HANDLING
========================= */

function setActiveTab(tab) {
  state.activeTab = tab;

  [scriptTab, hookTab, captionTab].forEach(btn =>
    btn.classList.remove("active")
  );

  if (tab === "script") scriptTab.classList.add("active");
  if (tab === "hook") hookTab.classList.add("active");
  if (tab === "caption") captionTab.classList.add("active");

  renderOutput();
}

scriptTab.addEventListener("click", () => setActiveTab("script"));
hookTab.addEventListener("click", () => setActiveTab("hook"));
captionTab.addEventListener("click", () => setActiveTab("caption"));

/* =========================
   OUTPUT RENDER
========================= */

function renderOutput() {
  outputBox.innerText =
    state[state.activeTab] || "Generated text appears here";
}

/* =========================
   GENERATE (AI)
========================= */

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    outputBox.innerText = "❌ Please enter a prompt";
    return;
  }

  state.prompt = prompt;
  outputBox.innerText = "⏳ Generating...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        type: state.activeTab,
      }),
    });

    if (!res.ok) {
      throw new Error("API request failed");
    }

    const data = await res.json();

    state.script = data.script || "";
    state.hook = data.hook || "";
    state.caption = data.caption || "";

    musicBox.innerText = "🎵 Auto-selected based on script";
    renderOutput();
  } catch (err) {
    console.error(err);
    outputBox.innerText = "❌ Generation failed";
  }
});

/* =========================
   COPY BUTTON
========================= */

copyBtn.addEventListener("click", () => {
  const text = state[state.activeTab];
  if (!text) return;
  navigator.clipboard.writeText(text);
});

/* =========================
   PREVIEW VIDEO
========================= */

previewBtn.addEventListener("click", () => {
  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%; border-radius:12px">
      <source src="/videos/sample.mp4" type="video/mp4" />
    </video>
  `;
  state.videoReady = true;
});