console.log("pro.js loaded");

// ==============================
// APP STATE
// ==============================
const state = {
  prompt: "",
  script: "",
  hook: "",
  caption: "",
  activeTab: "script",
  videoReady: false,
};

// ==============================
// ELEMENTS
// ==============================
const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const musicBox = document.getElementById("musicBox");
const videoPreview = document.getElementById("videoPreview");

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");

const scriptTab = document.getElementById("scriptTab");
const hookTab = document.getElementById("hookTab");
const captionTab = document.getElementById("captionTab");

// ==============================
// RENDER OUTPUT
// ==============================
function renderOutput() {
  outputBox.innerText =
    state[state.activeTab] || "Generated text will appear here...";
}

// ==============================
// TAB HANDLERS
// ==============================
function setActiveTab(tab) {
  state.activeTab = tab;

  scriptTab.classList.remove("active");
  hookTab.classList.remove("active");
  captionTab.classList.remove("active");

  if (tab === "script") scriptTab.classList.add("active");
  if (tab === "hook") hookTab.classList.add("active");
  if (tab === "caption") captionTab.classList.add("active");

  renderOutput();
}

scriptTab.addEventListener("click", () => setActiveTab("script"));
hookTab.addEventListener("click", () => setActiveTab("hook"));
captionTab.addEventListener("click", () => setActiveTab("caption"));

// ==============================
// GENERATE
// ==============================
generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    outputBox.innerText = "❌ Please enter a topic first.";
    return;
  }

  state.prompt = prompt;
  outputBox.innerText = "⏳ Generating...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!res.ok) {
      throw new Error("API request failed");
    }

    const data = await res.json();

    state.script = data.script || "";
    state.hook = data.hook || "";
    state.caption = data.captions || "";

    state.videoReady = true;

    musicBox.innerText = `🎵 Auto-selected music for: ${prompt}`;

    renderOutput();
  } catch (err) {
    console.error(err);
    outputBox.innerText = "❌ Error generating content.";
  }
});

// ==============================
// COPY
// ==============================
copyBtn.addEventListener("click", () => {
  const text = state[state.activeTab];
  if (!text) return;

  navigator.clipboard.writeText(text);
});

// ==============================
// PREVIEW VIDEO
// ==============================
previewBtn.addEventListener("click", () => {
  if (!state.videoReady) {
    alert("Generate content first.");
    return;
  }

  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%; border-radius:12px;">
      <source src="/videos/sample.mp4" type="video/mp4" />
    </video>
  `;
});