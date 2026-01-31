// =======================================
// ELEMENTS
// =======================================
const generateBtn = document.getElementById("generateBtn");
const inputBox = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");
const previewVideo = document.getElementById("previewVideo");

// =======================================
// STATE
// =======================================
let currentTab = "script";
let generatedText = "";
let videoUrl = "/videos/sample.mp4";

// =======================================
// TABS (Script / Hook / Caption)
// =======================================
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.type;
  };
});

// =======================================
// GENERATE SCRIPT
// =======================================
generateBtn.onclick = async () => {
  const prompt = inputBox.value.trim();

  if (!prompt) {
    outputBox.innerText = "Enter a prompt first.";
    return;
  }

  outputBox.innerText = "Generating...";

  try {
    const res = await fetch("/api/generate-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        type: currentTab
      })
    });

    const data = await res.json();

    if (!data.text) {
      outputBox.innerText = "No response from server.";
      return;
    }

    generatedText = data.text;
    outputBox.innerText = generatedText;
  } catch (err) {
    console.error(err);
    outputBox.innerText = "Error generating text.";
  }
};

// =======================================
// COPY BUTTON
// =======================================
copyBtn.onclick = () => {
  if (!generatedText) return;
  navigator.clipboard.writeText(generatedText);
  copyBtn.innerText = "Copied!";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
};

// =======================================
// PREVIEW VIDEO
// =======================================
previewBtn.onclick = () => {
  previewVideo.src = videoUrl;
  previewVideo.load();
  previewVideo.play();
};

// =======================================
// SAFETY LOG (optional but useful)
// =======================================
console.log("pro.js loaded OK");