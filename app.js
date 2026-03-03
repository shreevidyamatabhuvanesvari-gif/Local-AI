import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";
import { correctHindiText } from "./hindiSpellCorrector.js";

let transcriber;
let wordChunks = [];
let subtitleEngineStarted = false;

const videoInput = document.getElementById("videoInput");
const videoElement = document.getElementById("video");
const subtitlesDiv = document.getElementById("subtitles");
const processBtn = document.getElementById("processBtn");

// -------------------------
// 1️⃣ Load Model
// -------------------------
async function loadModel() {
  try {
    subtitlesDiv.innerHTML = "Model Loading... ⏳";

    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-small",
      { quantized: true }
    );

    subtitlesDiv.innerHTML = "Model Loaded ✅";
  } catch (err) {
    subtitlesDiv.innerHTML = "Model Load Failed ❌";
    console.error(err);
  }
}

loadModel();

// -------------------------
// 2️⃣ Video Preview
// -------------------------
videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (!file) return;

  videoElement.src = URL.createObjectURL(file);
});

// -------------------------
// 3️⃣ Generate Subtitles
// -------------------------
processBtn.addEventListener("click", async () => {
  try {
    const file = videoInput.files[0];
    if (!file) return alert("Upload video first");

    subtitlesDiv.innerHTML = "Extracting Audio... ⏳";

    const audioData = await extractAudioProper(file);

    subtitlesDiv.innerHTML = "Transcribing... ⏳";

    const result = await transcriber(audioData, {
      return_timestamps: "word",
      generate_kwargs: {
        language: "hi",
        task: "transcribe"
      }
    });

    console.log("RESULT:", result);

    if (!result || (!result.chunks && !result.text)) {
      subtitlesDiv.innerHTML = "Speech not detected ❌";
      return;
    }

    // अगर chunks नहीं मिले तो fallback
    if (!result.chunks) {
      const corrected = correctHindiText(result.text);
      subtitlesDiv.innerHTML = corrected;
      return;
    }

    // Spell correction apply
    wordChunks = result.chunks.map(word => ({
      ...word,
      text: correctHindiText(word.text.trim())
    }));

    subtitlesDiv.innerHTML = "Ready ▶ Play Video";

    if (!subtitleEngineStarted) {
      startSubtitleEngine();
      subtitleEngineStarted = true;
    }

  } catch (error) {
    subtitlesDiv.innerHTML = "Processing Failed ❌";
    console.error(error);
  }
});

// -------------------------
// 4️⃣ Proper Audio Resampling
// -------------------------
async function extractAudioProper(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * 16000),
    16000
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);

  const rendered = await offlineCtx.startRendering();

  return rendered.getChannelData(0);
}

// -------------------------
// 5️⃣ Subtitle Sync Engine
// -------------------------
function startSubtitleEngine() {
  videoElement.addEventListener("timeupdate", () => {
    const currentTime = videoElement.currentTime;

    let text = "";

    wordChunks.forEach(word => {
      const [start, end] = word.timestamp;

      if (currentTime >= start && currentTime <= end) {
        text += `<span style="color:yellow;font-size:28px;">${word.text}</span> `;
      }
    });

    subtitlesDiv.innerHTML = text;
  });
    }
