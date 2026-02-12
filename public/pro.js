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
    document.getElementById("username").innerText = savedName;
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          type: state.activeTab
        })
      });

      if (!res.ok) {
        throw new Error("AI request failed");
      }

      const data = await res.json();

      /* EXPECTED RESPONSE FORMAT FROM SERVER:
         {
           script: "...",
           hook: "...",
           captions: "..."
         }
      */

      state.script  = data.script || "";
      state.hook    = data.hook || "";
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
  previewBtn.addEventListener("click", () => {

    videoPreview.innerHTML = `
      <video controls autoplay style="width:100%;border-radius:12px;">
        <source src="/videos/sample.mp4" type="video/mp4">
      </video>
    `;

    state.videoReady = true;
  });
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

function saveProfile(){

    const name = document.getElementById("nameInput").value;
    const fileInput = document.getElementById("imageInput");

    // SAVE NAME
    if(name){
        localStorage.setItem("profileName", name);
        const userEl = document.getElementById("username");
if(userEl){
  userEl.innerText = name;
}
    }

    // SAVE IMAGE
    const file = fileInput.files[0];

    if(file){
        const reader = new FileReader();

        reader.onload = function(e){
            localStorage.setItem("profileImage", e.target.result);

            document.querySelector(".pro-icon").innerHTML =
                `<img src="${e.target.result}" style="width:32px;height:32px;border-radius:50%">`;
        };

        reader.readAsDataURL(file);
    }

    closeEdit();
}


/* ================================
   LOAD SAVED PROFILE ON PAGE LOAD
================================ */

window.addEventListener("load", () => {

    const savedName = localStorage.getItem("profileName");
    const savedImage = localStorage.getItem("profileImage");

    if(savedName){
        document.getElementById("username").innerText = savedName;
    }

    if(savedImage){
        document.querySelector(".pro-icon").innerHTML =
            `<img src="${savedImage}" style="width:32px;height:32px;border-radius:50%">`;
    }
});
  /* =========================
   SAVE PROFILE (UI ONLY)
========================= */
function saveProfile() {

  const nameInput = document.getElementById("nameInput");
  const fileInput = document.getElementById("imageInput");

  const name = nameInput ? nameInput.value.trim() : "";

  if (name) {
    localStorage.setItem("profileName", name);

    const username = document.getElementById("username");
    if (username) username.textContent = name;
  }

  const file = fileInput && fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {

      const imageData = e.target.result;

      localStorage.setItem("profileImage", imageData);

      const icon = document.querySelector(".pro-icon");

      if (icon) {
        icon.innerHTML =
          '<img src="' + imageData + '" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">';
      }
    };

    reader.readAsDataURL(file);
  }

  closeEdit();
}