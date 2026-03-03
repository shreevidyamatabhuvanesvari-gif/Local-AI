import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber = null;

document.addEventListener("DOMContentLoaded", async () => {

  const subtitlesDiv = document.getElementById("subtitles");
  const videoInput = document.getElementById("videoInput");
  const processBtn = document.getElementById("processBtn");
  const videoElement = document.getElementById("video");

  subtitlesDiv.textContent = "Loading AI model...";

  // =========================
  // 🔹 LOAD MODEL
  // =========================
  try {

    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small",
      { quantized: true }
    );

    subtitlesDiv.textContent = "Model Loaded ✔";

  } catch (err) {

    subtitlesDiv.textContent = "Model Load Failed ❌";
    console.error("MODEL ERROR:", err);

  }

  // =========================
  // 🔹 VIDEO PREVIEW
  // =========================
  videoInput.addEventListener("change", () => {

    const file = videoInput.files?.[0];
    if (!file) return;

    videoElement.src = URL.createObjectURL(file);
    videoElement.load();
  });

  // =========================
  // 🔹 PROCESS VIDEO
  // =========================
  processBtn.addEventListener("click", async () => {

    if (!transcriber) {
      alert("Model not ready yet");
      return;
    }

    const file = videoInput.files?.[0];

    if (!file) {
      alert("Upload video first");
      return;
    }

    // Limit file size for browser safety (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("Video too large. Use short clip (under 50MB).");
      return;
    }

    try {

      subtitlesDiv.textContent = "Extracting audio...";

      const audio = await extractAudioSafe(file);

      subtitlesDiv.textContent = "Transcribing...";

      const result = await transcriber(audio, {
        generate_kwargs: {
          task: "transcribe",
          temperature: 0.0
        }
      });

      if (!result || !result.text) {
        subtitlesDiv.textContent = "No speech detected.";
        return;
      }

      const cleanText = cleanRepetition(result.text);

      subtitlesDiv.textContent = cleanText;

    } catch (err) {

      subtitlesDiv.textContent = "Transcription failed ❌";
      console.error("PROCESS ERROR:", err);

    }

  });

});


// =========================
// 🔹 SAFE AUDIO EXTRACT
// =========================
async function extractAudioSafe(file) {

  const arrayBuffer = await file.arrayBuffer();

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  const audioCtx = new AudioContextClass();

  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  // Direct mono extraction (no OfflineAudioContext)
  const channelData = decoded.getChannelData(0);

  return channelData;
}


// =========================
// 🔹 REPEAT FILTER (Improved)
// =========================
function cleanRepetition(text) {

  const words = text.split(/\s+/);
  const filtered = [];

  for (let i = 0; i < words.length; i++) {

    if (i === 0 || words[i] !== words[i - 1]) {
      filtered.push(words[i]);
    }

  }

  return filtered.join(" ").trim();
}
