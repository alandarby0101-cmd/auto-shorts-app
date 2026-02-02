console.log("pro.js loaded");

// =======================
// APP STATE
// =======================
const state = {
  prompt: "",
  script: "",
  hook: "",
  caption: "",
  activeTab: "script",
  videoReady: false
};

// =======================
// ELEMENTS
// =======================
const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const musicBox = document.getElementById("musicBox");
const videoPreview = document.getElementById("videoPreview");

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");
const finalBtn = document.getElementById("finalBtn");

// =======================
// TABS (REAL STATE SWITCHING)
// =======================
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    state.activeTab = tab.dataset.type;
    renderOutput();
  });
});

function renderOutput() {
  outputBox.innerText =
    state[state.activeTab] || "Generated text will appear here…";
}

// =======================
// GENERATE (REAL APP BEHAVIOR)
// =======================
generateBtn.addEventListener("click", () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    outputBox.innerText = "❌ Please enter a topic first.";
    return;
  }

  state.prompt = prompt;

// REAL AI GENERATION
fetch("/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt,
    type: state.activeTab
  })
})
.then(res => {
  if (!res.ok) throw new Error("AI request failed");
  return res.json();
})
.then(data => {
  state.script = data.script;
  state.hook = data.hook;
  state.caption = data.caption;

  state.videoReady = true;
  musicBox.innerText = `🎵 Auto-selected music for: ${prompt}`;
  renderOutput();
})
.catch(err => {
  console.error(err);
  outputBox.innerText = "❌ AI generation failed. Check server logs.";
});

  musicBox.innerText = `🎵 Auto-selected music for: ${prompt}`;
  renderOutput();
});

// =======================
// COPY
// =======================
copyBtn.addEventListener("click", () => {
  if (!state[state.activeTab]) return;
  navigator.clipboard.writeText(state[state.activeTab]);
  copyBtn.innerText = "Copied!";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1000);
});

// =======================
// PREVIEW VIDEO
// =======================
previewBtn.addEventListener("click", () => {
  if (!state.videoReady) {
    videoPreview.innerText = "Generate content first.";
    return;
  }

  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%; border-radius:12px;">
      <source src="/videos/sample.mp4" type="video/mp4">
    </video>
  `;
});

// =======================
// FINAL BUTTON (APP LOGIC)
// =======================
finalBtn.addEventListener("click", () => {
  if (!state.script || !state.videoReady) {
    alert("Generate everything first.");
    return;
  }
  window.location.href = "/success.html";
});