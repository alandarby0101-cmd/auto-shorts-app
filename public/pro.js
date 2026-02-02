document.addEventListener("DOMContentLoaded", () => {
  console.log("pro.js loaded");

  // =========================
  // STATE
  // =========================
  const state = {
    prompt: "",
    script: "",
    hook: "",
    caption: "",
    activeTab: "script",
    videoReady: false
  };

  // =========================
  // ELEMENTS
  // =========================
  const promptInput = document.getElementById("promptInput");
  const outputBox = document.getElementById("outputBox");
  const musicBox = document.getElementById("musicBox");
  const videoPreview = document.getElementById("videoPreview");

  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const previewBtn = document.getElementById("previewBtn");
  const finalBtn = document.getElementById("finalBtn");

  const tabScript = document.getElementById("tabScript");
  const tabHook = document.getElementById("tabHook");
  const tabCaption = document.getElementById("tabCaption");

  // =========================
  // SAFETY CHECK
  // =========================
  if (!generateBtn || !previewBtn || !tabScript || !tabHook || !tabCaption) {
    console.error("Required DOM elements missing");
    return;
  }

  // =========================
  // RENDER OUTPUT
  // =========================
  function renderOutput() {
    outputBox.innerText =
      state[state.activeTab] || "Generated text appears here";
  }

  function setActiveTab(tab) {
    state.activeTab = tab;

    tabScript.classList.remove("active");
    tabHook.classList.remove("active");
    tabCaption.classList.remove("active");

    if (tab === "script") tabScript.classList.add("active");
    if (tab === "hook") tabHook.classList.add("active");
    if (tab === "caption") tabCaption.classList.add("active");

    renderOutput();
  }

  // =========================
  // TAB EVENTS
  // =========================
  tabScript.addEventListener("click", () => setActiveTab("script"));
  tabHook.addEventListener("click", () => setActiveTab("hook"));
  tabCaption.addEventListener("click", () => setActiveTab("caption"));

  // =========================
  // GENERATE (AI)
  // =========================
  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      outputBox.innerText = "❌ Please enter a topic first.";
      return;
    }

    state.prompt = prompt;
    outputBox.innerText = "⏳ Generating...";
    musicBox.innerText = "🎵 Selecting music...";

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          type: state.activeTab
        })
      });

      if (!res.ok) throw new Error("AI request failed");

      const data = await res.json();

      state.script = data.script || "";
      state.hook = data.hook || "";
      state.caption = data.caption || "";

      state.videoReady = true;

      renderOutput();
      musicBox.innerText = `🎵 Auto-selected based on script`;
    } catch (err) {
      console.error(err);
      outputBox.innerText = "❌ Generation failed";
      musicBox.innerText = "";
    }
  });

  // =========================
  // COPY
  // =========================
  copyBtn?.addEventListener("click", () => {
    const text = state[state.activeTab];
    if (!text) return;
    navigator.clipboard.writeText(text);
  });

  // =========================
  // PREVIEW VIDEO
  // =========================
  previewBtn.addEventListener("click", () => {
    if (!state.videoReady) {
      alert("Generate content first.");
      return;
    }

    videoPreview.innerHTML = `
      <video controls autoplay style="width:100%; border-radius:12px">
        <source src="/videos/sample.mp4" type="video/mp4" />
      </video>
    `;
  });

  // =========================
  // FINAL BUTTON
  // =========================
  finalBtn?.addEventListener("click", () => {
    if (!state.script || !state.videoReady) {
      alert("Generate everything first.");
      return;
    }
    window.location.href = "/success.html";
  });

  // =========================
  // INIT
  // =========================
  setActiveTab("script");
});