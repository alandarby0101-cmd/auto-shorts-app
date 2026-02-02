console.log("✅ pro.js loaded");

/* =========================
   STATE
========================= */
const state = {
  script: "",
  hook: "",
  caption: "",
  music: "",
  activeTab: "script"
};

/* =========================
   ELEMENTS
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const previewBtn = document.getElementById("previewBtn");
  const finalBtn = document.getElementById("finalBtn");

  const promptInput = document.getElementById("promptInput");
  const outputBox = document.getElementById("outputBox");
  const musicBox = document.getElementById("musicBox");
  const videoPreview = document.getElementById("videoPreview");

  const tabs = document.querySelectorAll(".tab");

  /* =========================
     SAFETY CHECK
  ========================= */
  if (!generateBtn || !outputBox || !promptInput) {
    console.error("❌ Required elements missing in pro.html");
    return;
  }

  /* =========================
     TAB SWITCHING
  ========================= */
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      state.activeTab = tab.dataset.type;
      renderOutput();
    });
  });

  function renderOutput() {
    if (state.activeTab === "script") outputBox.innerText = state.script || "No script yet";
    if (state.activeTab === "hook") outputBox.innerText = state.hook || "No hook yet";
    if (state.activeTab === "caption") outputBox.innerText = state.caption || "No caption yet";
  }

  /* =========================
     GENERATE (REAL AI)
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
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) throw new Error("AI request failed");

      const data = await res.json();

      state.script = data.script || "";
      state.hook = data.hook || "";
      state.caption = data.caption || "";
      state.music = data.music || "";

      musicBox.innerText = state.music || "No music selected";
      renderOutput();

    } catch (err) {
      console.error(err);
      outputBox.innerText = "❌ Generation failed";
    }
  });

  /* =========================
     COPY
  ========================= */
  copyBtn.addEventListener("click", () => {
    let text = "";

    if (state.activeTab === "script") text = state.script;
    if (state.activeTab === "hook") text = state.hook;
    if (state.activeTab === "caption") text = state.caption;

    if (!text) return;

    navigator.clipboard.writeText(text);
    copyBtn.innerText = "Copied!";
    setTimeout(() => (copyBtn.innerText = "Copy"), 1200);
  });

  /* =========================
     PREVIEW VIDEO
  ========================= */
  previewBtn.addEventListener("click", () => {
    videoPreview.innerHTML = `
      <video controls autoplay style="width:100%; border-radius:12px;">
        <source src="/videos/sample.mp4" type="video/mp4">
      </video>
    `;
  });

  /* =========================
     FINAL GENERATION
  ========================= */
  finalBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/generate-video", { method: "POST" });
      const data = await res.json();

      if (!data.url) throw new Error("No video URL");

      window.location.href = data.url;

    } catch (err) {
      alert("❌ Final video generation failed");
    }
  });
});