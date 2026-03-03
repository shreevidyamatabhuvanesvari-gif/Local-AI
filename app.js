import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber = null;

document.addEventListener("DOMContentLoaded", async () => {

  const subtitlesDiv = document.getElementById("subtitles");
  const videoInput = document.getElementById("videoInput");
  const processBtn = document.getElementById("processBtn");
  const videoElement = document.getElementById("video");
  const editor = document.getElementById("editor");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  subtitlesDiv.textContent = "Loading AI model...";

  try {
    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small",
      { quantized: true }
    );

    subtitlesDiv.textContent = "Model Loaded ✔";
  } catch (err) {
    subtitlesDiv.textContent = "Model Load Failed ❌";
    console.error(err);
  }

  // Video Preview
  videoInput.addEventListener("change", () => {
    const file = videoInput.files[0];
    if (!file) return;

    videoElement.src = URL.createObjectURL(file);
    videoElement.load();
  });

  // Generate
  processBtn.addEventListener("click", async () => {

    if (!transcriber) {
      alert("Model not ready yet");
      return;
    }

    const file = videoInput.files[0];
    if (!file) {
      alert("Upload video first");
      return;
    }

    try {
      subtitlesDiv.textContent = "Extracting audio...";
      const audio = await extractAudio(file);

      subtitlesDiv.textContent = "Transcribing...";
      const result = await transcriber(audio, {
        generate_kwargs: {
          temperature: 0.0
        }
      });

      let cleanText = cleanRepetition(result.text || "");

      subtitlesDiv.textContent = "Done ✔";
      editor.value = cleanText;

    } catch (err) {
      subtitlesDiv.textContent = "Transcription failed ❌";
      console.error(err);
    }
  });

  // Copy
  copyBtn.addEventListener("click", () => {
    editor.select();
    document.execCommand("copy");
    alert("Copied!");
  });

  // Download
  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([editor.value], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transcription.txt";
    link.click();
  });

});

// Audio Extract
async function extractAudio(file) {

  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const targetSampleRate = 16000;

  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * targetSampleRate),
    targetSampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);

  const rendered = await offlineCtx.startRendering();

  return rendered.getChannelData(0);
}

// Remove repeated words
function cleanRepetition(text) {
  const words = text.split(" ");
  const filtered = [];
  let lastWord = "";

  for (let word of words) {
    if (word !== lastWord) {
      filtered.push(word);
    }
    lastWord = word;
  }

  return filtered.join(" ");
}
