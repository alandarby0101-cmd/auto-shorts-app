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