/* =========================================================
   AUTO SHORTS AI – PRO.JS
   FULL WORKING VERSION
   ✔ Tabs (Script / Hook / Caption)
   ✔ Generate button
   ✔ Preview video button
   ✔ AI API wiring
   ✔ Fixes "DOM elements missing"
========================================================= */



  console.log("pro.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  const savedName = localStorage.getItem("profileName");
if(savedName){
    const userEl = document.getElementById("username");
if(userEl){
userEl.innerText = savedName;
}
}
  /* =========================
     DOM ELEMENTS
  ========================= */
  const scriptTab   = document.getElementById("scriptTab");
  const hookTab     = document.getElementById("hookTab");
  const captionTab  = document.getElementById("captionTab");

  const promptInput = document.getElementById("promptInput");
  const outputBox   = document.getElementById("outputBox");
  const musicBox    = document.getElementById("musicBox");

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn     = document.getElementById("copyBtn");
  const previewBtn  = document.getElementById("previewBtn");

  const videoPreview = document.getElementById("videoPreview");

  if (
    !scriptTab || !hookTab || !captionTab ||
    !promptInput || !outputBox ||
    !generateBtn || !copyBtn || !previewBtn ||
    !videoPreview
  ) {
    console.error("Required DOM elements missing");
    return;
  }

  /* =========================
     STATE
  ========================= */
  const state = {
    activeTab: "script",
    script: "",
    hook: "",
    caption: "",
    videoReady: false
  };

  /* =========================
     TAB SWITCHING
  ========================= */
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

  /* =========================
     RENDER OUTPUT
  ========================= */
  function renderOutput() {
    const text =
      state[state.activeTab] ||
      "Generated text appears here";

    outputBox.innerText = text;
  }

  /* =========================
     GENERATE (AI CALL)
     🔥 THIS IS WHERE AI IS WIRED
     Your backend MUST expose:
     POST /api/generate
  ========================= */
generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();

  if (!prompt) {
    outputBox.innerText = "❌ Please enter a prompt.";
    return;
  }

  outputBox.innerText = "⏳ Generating...";
  musicBox.innerText = "🎵 Selecting music...";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        type: state.activeTab
      })
    });

    if (!res.ok) {
      throw new Error("AI request failed");
    }

    const data = await res.json();

    state.script = data.script || "";
    state.hook = data.hook || "";
    state.caption = data.captions || "";

    musicBox.innerText = `🎵 Auto-selected music for: ${prompt}`;

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
     PREVIEW VIDEO BUTTON
  ========================= */
previewBtn.addEventListener("click", async () => {

  videoPreview.innerHTML = "Generating AI video...";

  const scriptText = state.script;

  const response = await fetch("/api/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: scriptText })
  });

  const data = await response.json();

if (data.videoUrl) {
  videoPreview.innerHTML = `
    <video controls autoplay style="width:100%;border-radius:12px; max-height:500px;">
      <source src="${data.videoUrl}" type="video/mp4">
    </video>
  `;
} else {
  videoPreview.innerHTML = "Video generation failed.";
}

});
  /* ================================
   EDIT PROFILE SAVE SYSTEM
================================ */

function openEdit(){
    document.getElementById("editModal").style.display = "flex";
}

function closeEdit(){
    document.getElementById("editModal").style.display = "none";
}

function saveProfile() {
    const nameInput = document.getElementById("profileName");
    const name = nameInput.value.trim();

    if (!name) {
        alert("Please enter a name.");
        return;
    }

    // Save to browser storage
    localStorage.setItem("profileName", name);

    // Update display immediately
    document.getElementById("displayName").innerText = name;

    closeEdit();
}


/* ================================
   LOAD SAVED PROFILE ON PAGE LOAD
================================ */

window.addEventListener("load", () => {

    const savedName = localStorage.getItem("profileName");
   

    if(savedName){
        document.getElementById("username").innerText = savedName;
    }

    
});
});