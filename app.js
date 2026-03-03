import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";
import { correctHindiText } from "./hindiSpellCorrector.js";

let transcriber = null;
let wordChunks = [];
let subtitleEngineStarted = false;

document.addEventListener("DOMContentLoaded", () => {

  const videoInput = document.getElementById("videoInput");
  const videoElement = document.getElementById("video");
  const subtitlesDiv = document.getElementById("subtitles");
  const processBtn = document.getElementById("processBtn");

  // 🛑 DOM Safety Check
  if (!videoInput || !videoElement || !subtitlesDiv || !processBtn) {
    console.error("DOM Elements Missing");
    return;
  }

  // -------------------------
  // 1️⃣ Load Model
  // -------------------------
  async function loadModel() {
    try {
      subtitlesDiv.textContent = "Model Loading... ⏳";

      transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-small",
        { quantized: true }
      );

      subtitlesDiv.textContent = "Model Loaded ✅";
    } catch (err) {
      subtitlesDiv.textContent = "Model Load Failed ❌";
      console.error("MODEL ERROR:", err);
    }
  }

  loadModel();

  // -------------------------
  // 2️⃣ Video Preview
  // -------------------------
  videoInput.addEventListener("change", () => {
    const file = videoInput.files?.[0];
    if (!file) return;

    videoElement.src = URL.createObjectURL(file);
  });

  // -------------------------
  // 3️⃣ Generate Subtitles
  // -------------------------
  processBtn.addEventListener("click", async () => {

    if (!transcriber) {
      alert("Model not loaded yet");
      return;
    }

    const file = videoInput.files?.[0];
    if (!file) {
      alert("Upload video first");
      return;
    }

    try {
      subtitlesDiv.textContent = "Extracting Audio... ⏳";

      const audioData = await extractAudioProper(file);

      subtitlesDiv.textContent = "Transcribing... ⏳";

      const result = await transcriber(audioData, {
        return_timestamps: "word",
        generate_kwargs: {
          language: "hi",
          task: "transcribe"
        }
      });

      console.log("RESULT:", result);

      if (!result) {
        subtitlesDiv.textContent = "No result ❌";
        return;
      }

      if (!result.chunks && result.text) {
        subtitlesDiv.textContent =
          correctHindiText(result.text);
        return;
      }

      if (!result.chunks) {
        subtitlesDiv.textContent = "Speech not detected ❌";
        return;
      }

      wordChunks = result.chunks
        .filter(w => w.timestamp && w.timestamp.length === 2)
        .map(word => ({
          ...word,
          text: correctHindiText(word.text?.trim() || "")
        }));

      subtitlesDiv.textContent = "Ready ▶ Play Video";

      if (!subtitleEngineStarted) {
        startSubtitleEngine(videoElement, subtitlesDiv);
        subtitleEngineStarted = true;
      }

    } catch (err) {
      subtitlesDiv.textContent = "Processing Failed ❌";
      console.error("PROCESS ERROR:", err);
    }

  });

});

// -------------------------
// 4️⃣ Proper Resampling (Safe)
// -------------------------
async function extractAudioProper(file) {

  const arrayBuffer = await file.arrayBuffer();

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  const audioCtx = new AudioContextClass();

  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const targetSampleRate = 16000;

  const length = Math.max(
    1,
    Math.floor(decoded.duration * targetSampleRate)
  );

  const offlineCtx = new OfflineAudioContext(
    1,
    length,
    targetSampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);

  const rendered = await offlineCtx.startRendering();

  return rendered.getChannelData(0);
}

// -------------------------
// 5️⃣ Subtitle Sync Engine (Safe)
// -------------------------
function startSubtitleEngine(videoElement, subtitlesDiv) {

  videoElement.addEventListener("timeupdate", () => {

    if (!wordChunks.length) return;

    const currentTime = videoElement.currentTime;
    let activeText = "";

    for (let word of wordChunks) {

      if (!word.timestamp) continue;

      const start = word.timestamp[0];
      const end = word.timestamp[1];

      if (currentTime >= start && currentTime <= end) {
        activeText += word.text + " ";
      }
    }

    subtitlesDiv.textContent = activeText.trim();

  });

}
