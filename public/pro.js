// ======================
// ELEMENTS
// ======================
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");
const inputBox = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const previewVideo = document.getElementById("previewVideo");

// ======================
// STATE
// ======================
let currentTab = "script";
let generatedText = "";
let videoUrl = "/videos/sample.mp4";

// ======================
// TABS
// ======================
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.type;
  };
});

// ======================
// GENERATE
// ======================
generateBtn.onclick = async () => {
  const prompt = inputBox.value.trim();

  if (!prompt) {
    alert("Enter something first");
    return;
  }

  generateBtn.innerText = "Generating...";
  generateBtn.disabled = true;

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

    generatedText = data.text || "No response returned";
    outputBox.value = generatedText;
  } catch (err) {
    outputBox.value = "Error generating text";
    console.error(err);
  }

  generateBtn.innerText = "Generate";
  generateBtn.disabled = false;
};

// ======================
// COPY
// ======================
copyBtn.onclick = () => {
  if (!outputBox.value) return;
  navigator.clipboard.writeText(outputBox.value);
  copyBtn.innerText = "Copied!";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1000);
};

// ======================
// PREVIEW VIDEO
// ======================
previewBtn.onclick = () => {
  previewVideo.src = videoUrl;
  previewVideo.load();
  previewVideo.play();
};