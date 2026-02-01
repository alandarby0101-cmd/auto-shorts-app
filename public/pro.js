console.log("pro.js loaded");

const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");
const finalBtn = document.getElementById("finalBtn");

const promptInput = document.getElementById("promptInput");
const outputBox = document.getElementById("outputBox");
const musicBox = document.getElementById("musicBox");
const videoPreview = document.getElementById("videoPreview");

let currentTab = "script";

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.type;
  };
});

// GENERATE
generateBtn.onclick = async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    outputBox.innerText = "Enter something first.";
    return;
  }

  const responses = {
    script: `SCRIPT:\nA short story about ${prompt}`,
    hook: `HOOK:\nYou won't believe this about ${prompt}`,
    caption: `CAPTION:\nThis changes everything about ${prompt}`
  };

  outputBox.innerText = responses[currentTab];
  musicBox.innerText =
    prompt.toLowerCase().includes("crime") ? "Dark Cinematic" :
    prompt.toLowerCase().includes("sad") ? "Slow Emotional" :
    "Epic Journey";
};

// COPY
copyBtn.onclick = () => {
  navigator.clipboard.writeText(outputBox.innerText);
  copyBtn.innerText = "Copied!";
  setTimeout(() => copyBtn.innerText = "Copy", 1000);
};

// PREVIEW
previewBtn.onclick = () => {
  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%;border-radius:12px">
      <source src="/videos/sample.mp4" type="video/mp4">
    </video>
  `;
};

// FINAL
finalBtn.onclick = () => {
  window.location.href = "/videos/sample.mp4";
};
