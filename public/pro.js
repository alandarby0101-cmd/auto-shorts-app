const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const textBox = document.getElementById("textBox");
const musicBox = document.getElementById("musicBox");
const copyBtn = document.getElementById("copyBtn");
const previewBtn = document.getElementById("previewBtn");
const finalBtn = document.getElementById("finalBtn");

const tabs = document.querySelectorAll(".tab");

let currentTab = "script";

let data = {
  script: "",
  hook: "",
  captions: "",
  music: ""
};

/* -----------------------------
   TAB SWITCHING (S / H / C)
--------------------------------*/
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    textBox.innerText = data[currentTab] || "Waiting...";
  };
});

/* -----------------------------
   GENERATE BUTTON
--------------------------------*/
generateBtn.onclick = async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert("Type something first");

  textBox.innerText = "Generating script...";
  musicBox.innerText = "Choosing music...";
  previewBox.innerText = "Preparing preview...";

const res = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt })
});

const json = await res.json();

dataStore.script = json.script || "";
dataStore.hook = json.hook || "";
dataStore.captions = json.captions || "";
dataStore.music = json.music || "";

textBox.innerText = dataStore[currentTab] || "";
musicBox.innerText = dataStore.music || "";
};

/* -----------------------------
   COPY BUTTON
--------------------------------*/
copyBtn.onclick = () => {
  navigator.clipboard.writeText(data[currentTab]);
};

/* -----------------------------
   PREVIEW BUTTON
--------------------------------*/
previewBtn.onclick = () => {
  window.open("/preview.html", "_blank");
};

/* -----------------------------
   FINAL BUTTON
--------------------------------*/
finalBtn.onclick = () => {
  window.location.href = "/download.html";
};