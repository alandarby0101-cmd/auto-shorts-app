// ===============================
// STATE
// ===============================
let currentTab = "script";
let generatedText = "";
let videoUrl = "/videos/sample.mp4";

// ===============================
// TABS
// ===============================
document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.type;
  };
});

// ===============================
// GENERATE SCRIPT / HOOK / CAPTION
// ===============================
document.getElementById("generateBtn").onclick = async () => {
  const prompt = document.getElementById("promptInput").value.trim();
  if (!prompt) return alert("Enter a prompt first");

  const res = await fetch("/api/generate-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      type: currentTab
    })
  });

  const data = await res.json();
  generatedText = data.text || data.script || "No output";

  document.getElementById("outputBox").innerText = generatedText;
  document.getElementById("musicBox").innerText =
    data.music || "Music selected automatically";
};

// ===============================
// COPY
// ===============================
document.getElementById("copyBtn").onclick = () => {
  if (!generatedText) return;
  navigator.clipboard.writeText(generatedText);
};

// ===============================
// PREVIEW VIDEO
// ===============================
document.getElementById("previewBtn").onclick = () => {
  const videoBox = document.getElementById("videoPreview");

  videoBox.innerHTML = `
    <video controls style="width:100%;border-radius:14px">
      <source src="${videoUrl}" type="video/mp4" />
    </video>
  `;
};

// ===============================
// FINAL GENERATE
// ===============================
document.getElementById("finalBtn").onclick = async () => {
  const res = await fetch("/api/generate-video", {
    method: "POST"
  });

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Video generation failed");
  }
};