const promptInput = document.getElementById("prompt");
const generateBtn = document.getElementById("generate");
const scriptBox = document.getElementById("script");
const finalBtn = document.getElementById("finalBtn");

generateBtn.onclick = async () => {
  const prompt = promptInput.value;
  if (!prompt) return alert("Enter a prompt");

  scriptBox.innerText = "Generating...";

  const res = await fetch("/api/generate-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  scriptBox.innerText = data.script;
};

finalBtn.onclick = () => {
  alert("Final video generation started (stub)");
};
