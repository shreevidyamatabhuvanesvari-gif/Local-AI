import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber;
let wordChunks = [];
let fullText = "";

// --------------------
// Load Whisper Model (Force Hindi)
// --------------------
async function loadModel() {
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-tiny"
  );

  alert("AI Model Loaded ✅");
}
loadModel();

// --------------------
// Elements
// --------------------
const videoInput = document.getElementById("videoInput");
const videoElement = document.getElementById("video");
const subtitlesDiv = document.getElementById("subtitles");
const processBtn = document.getElementById("processBtn");

// --------------------
// Handle Video Upload
// --------------------
videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  videoElement.src = url;
});

// --------------------
// Generate Subtitles
// --------------------
processBtn.addEventListener("click", async () => {
  const file = videoInput.files[0];
  if (!file) return alert("Upload video first");

  subtitlesDiv.innerHTML = "Processing... ⏳";

  const audioData = await extractAudio(file);

  const result = await transcriber(audioData, {
    return_timestamps: "word",
    language: "hi",       // 🔥 Force Hindi
    task: "transcribe"
  });

  console.log(result);

  if (!result.chunks) {
    subtitlesDiv.innerHTML = "No speech detected.";
    return;
  }

  wordChunks = result.chunks;
  fullText = result.text;

  subtitlesDiv.innerHTML = "Ready ▶ Play Video";

  startSubtitleEngine();
});

// --------------------
// Extract Audio (16kHz Mono)
// --------------------
async function extractAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const channelData = decoded.getChannelData(0);
  return channelData;
}

// --------------------
// Advanced Subtitle Engine
// --------------------
function startSubtitleEngine() {

  videoElement.addEventListener("timeupdate", () => {
    const currentTime = videoElement.currentTime;

    let sentenceHTML = "";

    wordChunks.forEach(word => {
      const start = word.timestamp[0];
      const end = word.timestamp[1];

      if (currentTime >= start && currentTime <= end) {
        // 🔥 Active word highlighted
        sentenceHTML += `
          <span style="
            color: yellow;
            font-weight: bold;
            font-size: 28px;
          ">
            ${word.text}
          </span> `;
      } else {
        sentenceHTML += `
          <span style="
            color: white;
            opacity: 0.6;
            font-size: 22px;
          ">
            ${word.text}
          </span> `;
      }
    });

    subtitlesDiv.innerHTML = sentenceHTML;
  });
}
