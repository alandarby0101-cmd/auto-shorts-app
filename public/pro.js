console.log("✅ pro.js loaded");

// =======================
// ELEMENTS
// =======================
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");
const finalBtn = document.getElementById("finalBtn");

const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const musicBox = document.getElementById("musicBox");
const videoPreview = document.getElementById("videoPreview");

let currentTab = "script";

// =======================
// TABS
// =======================
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.type;
  });
});

// =======================
// GENERATE (LOCAL FAKE GEN – proves wiring)
// =======================
generateBtn.addEventListener("click", () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    outputBox.innerText = "❌ Please type something first";
    return;
  }

  const responses = {
    script: `🎬 SCRIPT:\nThis short explains ${prompt} in a simple, engaging way.\n\nStart with a hook, deliver value, end strong.`,
    hook: `🔥 HOOK:\nNobody talks about this with ${prompt}…`,
    caption: `📢 CAPTION:\n${prompt} explained in 30 seconds 👇`
  };

  outputBox.innerText = responses[currentTab];
  musicBox.innerText = `🎵 Auto-selected music for: ${prompt}`;
});

// =======================
// COPY
// =======================
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(outputBox.innerText);
  copyBtn.innerText = "Copied!";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
});

// =======================
// PREVIEW VIDEO
// =======================
previewBtn.addEventListener("click", () => {
  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%; border-radius:12px;">
      <source src="/videos/sample.mp4" type="video/mp4">
    </video>
  `;
});

// =======================
// FINAL GENERATE
// =======================
finalBtn.addEventListener("click", () => {
  alert("✅ Final video generation would start here (backend step)");
});