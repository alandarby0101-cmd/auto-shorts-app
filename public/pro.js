const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const textBox = document.getElementById("textBox");
const copyBtn = document.getElementById("copyBtn");

const previewBtn = document.getElementById("previewBtn");
const previewBox = document.getElementById("previewBox");

const finalGenerateBtn = document.getElementById("finalGenerateBtn");
const musicBox = document.getElementById("musicBox");

const tabs = document.querySelectorAll("#tabs button");

let dataStore = {
  script: "",
  hook: "",
  captions: "",
  music: "",
  videoUrl: ""
};

let currentTab = "script";

/* ======================
   TAB SWITCHING
====================== */
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    currentTab = btn.dataset.tab;
    textBox.innerText = dataStore[currentTab] || "Nothing yet";
  });
});

/* ======================
   GENERATE SCRIPT
====================== */
generateBtn.onclick = async () => {
  const prompt = promptInput.value;
  if (!prompt) return alert("Write something first");

  textBox.innerText = "Generating...";
  musicBox.innerText = "Choosing music...";

  const res = await fetch("/api/generate-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();

  // fake split for now (works with real AI later)
  dataStore.script = data.script;
  dataStore.hook = data.script.split(".")[0];
  dataStore.captions = data.script.split(".").slice(1).join(".");
  dataStore.music = data.music || "Cinematic Mood";

  textBox.innerText = dataStore[currentTab];
  musicBox.innerText = dataStore.music;
};

/* ======================
   COPY BUTTON
====================== */
copyBtn.onclick = () => {
  const text = dataStore[currentTab];
  if (!text) return;
  navigator.clipboard.writeText(text);
  copyBtn.innerText = "Copied!";
  setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
};

/* ======================
   VIDEO PREVIEW
====================== */
previewBtn.onclick = () => {
  const video = document.getElementById("previewVideo");
  video.src = "/videos/sample.mp4";
  video.load();
  video.play();
};
/* ======================
   FINAL VIDEO
====================== */
finalGenerateBtn.onclick = async () => {
  finalGenerateBtn.innerText = "Generating final video...";
  finalGenerateBtn.disabled = true;

  const res = await fetch("/api/generate-video", {
    method: "POST"
  });
  const data = await res.json();

  window.location.href = data.url;
};