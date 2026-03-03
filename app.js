import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber = null;

document.addEventListener("DOMContentLoaded", async () => {

  const subtitlesDiv = document.getElementById("subtitles");
  const videoInput = document.getElementById("videoInput");
  const processBtn = document.getElementById("processBtn");
  const videoElement = document.getElementById("video");

  // =========================
  // 🔹 LOAD MODEL
  // =========================

  subtitlesDiv.textContent = "Loading AI model... ⏳";

  try {

    transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-small",
  { quantized: true }
);

    subtitlesDiv.textContent = "Model Loaded ✔";

  } catch (error) {

    subtitlesDiv.textContent = "Model Load Failed ❌";
    console.error(error);

  }

  // =========================
  // 🔹 VIDEO PREVIEW
  // =========================

  videoInput.addEventListener("change", () => {

    const file = videoInput.files[0];
    if (!file) return;

    const videoURL = URL.createObjectURL(file);

    videoElement.src = videoURL;
    videoElement.load();
    videoElement.style.display = "block";

  });

  // =========================
  // 🔹 PROCESS VIDEO
  // =========================

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

      subtitlesDiv.textContent = "Transcribing... ⏳";

      const result = await transcriber(audio, {
  return_timestamps: false,
  generate_kwargs: {
    language: "hi",
    task: "transcribe",
    temperature: 0.0
  }
});

      subtitlesDiv.textContent = result.text || "No speech detected";

    } catch (err) {

      subtitlesDiv.textContent = "Transcription failed ❌";
      console.error(err);

    }

  });

});

// =========================
// 🔹 AUDIO EXTRACT FUNCTION
// =========================

async function extractAudio(file) {

  const arrayBuffer = await file.arrayBuffer();

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  const audioCtx = new AudioContextClass();

  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const targetSampleRate = 16000;

  const offlineCtx = new OfflineAudioContext(
    1,
    decoded.duration * targetSampleRate,
    targetSampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);

  const rendered = await offlineCtx.startRendering();

  return rendered.getChannelData(0);

}
