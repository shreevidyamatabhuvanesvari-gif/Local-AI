import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber = null;
let sentenceChunks = [];
let subtitleEngineStarted = false;

document.addEventListener("DOMContentLoaded", () => {

  const videoInput = document.getElementById("videoInput");
  const videoElement = document.getElementById("video");
  const subtitlesDiv = document.getElementById("subtitles");
  const processBtn = document.getElementById("processBtn");

  if (!videoInput || !videoElement || !subtitlesDiv || !processBtn) {
    console.error("DOM Elements Missing");
    return;
  }

  // =========================
  // 1️⃣ Load Whisper Medium
  // =========================
  async function loadModel() {
    try {
      subtitlesDiv.textContent = "Loading Medium Model... ⏳ (First time may take 1-2 min)";

      transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-medium",
        { quantized: true }
      );

      subtitlesDiv.textContent = "Model Ready ✅";

    } catch (err) {
      subtitlesDiv.textContent = "Model Load Failed ❌";
      console.error(err);
    }
  }

  loadModel();

  // =========================
  // 2️⃣ Video Preview
  // =========================
  videoInput.addEventListener("change", () => {
    const file = videoInput.files?.[0];
    if (!file) return;
    videoElement.src = URL.createObjectURL(file);
  });

  // =========================
  // 3️⃣ Generate Subtitles
  // =========================
  processBtn.addEventListener("click", async () => {

    if (!transcriber) {
      alert("Model still loading...");
      return;
    }

    const file = videoInput.files?.[0];
    if (!file) {
      alert("Upload video first");
      return;
    }

    try {
      subtitlesDiv.textContent = "Extracting Audio... ⏳";

      const audioData = await extractAudio(file);

      subtitlesDiv.textContent = "Transcribing (High Accuracy Mode)... ⏳";

      const result = await transcriber(audioData, {
        return_timestamps: true,   // ✅ sentence-level
        chunk_length_s: 20,        // stable chunking
        generate_kwargs: {
          language: "hi",
          task: "transcribe"
        }
      });

      if (!result || !result.chunks) {
        subtitlesDiv.textContent = "No speech detected ❌";
        return;
      }

      // Store sentence chunks
      sentenceChunks = result.chunks
        .filter(c => c.timestamp && c.timestamp.length === 2)
        .map(chunk => ({
          start: chunk.timestamp[0],
          end: chunk.timestamp[1],
          text: cleanText(chunk.text)
        }));

      subtitlesDiv.textContent = "Ready ▶ Play Video";

      if (!subtitleEngineStarted) {
        startSubtitleEngine(videoElement, subtitlesDiv);
        subtitleEngineStarted = true;
      }

    } catch (err) {
      subtitlesDiv.textContent = "Processing Failed ❌";
      console.error(err);
    }

  });

});


// =========================
// 🎧 Stable Audio Extraction
// =========================
async function extractAudio(file) {

  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const targetSampleRate = 16000;
  const length = Math.floor(decoded.duration * targetSampleRate);

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


// =========================
// 🧹 Safe Minimal Cleanup
// =========================
function cleanText(text) {
  return text
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}


// =========================
// 🎬 Sentence Subtitle Engine
// =========================
function startSubtitleEngine(videoElement, subtitlesDiv) {

  videoElement.addEventListener("timeupdate", () => {

    if (!sentenceChunks.length) return;

    const currentTime = videoElement.currentTime;

    const activeChunk = sentenceChunks.find(chunk =>
      currentTime >= chunk.start && currentTime <= chunk.end
    );

    subtitlesDiv.textContent = activeChunk ? activeChunk.text : "";

  });

}
