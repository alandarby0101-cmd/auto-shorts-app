async function loadUser() {
  const res = await fetch("/api/me");
  const data = await res.json();
  document.getElementById("videos").innerText = data.videos || 0;
}

document.getElementById("generate").onclick = async () => {
  const prompt = document.getElementById("prompt").value;

  const res = await fetch("/api/generate-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  document.getElementById("script").innerText = data.script;
};

document.getElementById("final").onclick = async () => {
  await fetch("/api/generate-video", { method: "POST" });
  alert("Final video generation started");
};

loadUser();