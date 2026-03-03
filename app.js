import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber;
let wordChunks = [];

const videoInput = document.getElementById("videoInput");
const videoElement = document.getElementById("video");
const subtitlesDiv = document.getElementById("subtitles");
const processBtn = document.getElementById("processBtn");

// -------------------------
// 1️⃣ Load Whisper-small
// -------------------------
async function loadModel() {
  subtitlesDiv.innerHTML = "Model Loading... ⏳ (First time slow होगा)";
  
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-small"
  );

  subtitlesDiv.innerHTML = "Model Loaded ✅";
}

loadModel();

// -------------------------
// 2️⃣ Video Upload Preview
// -------------------------
videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  videoElement.src = url;
});

// -------------------------
// 3️⃣ Generate Subtitles
// -------------------------
processBtn.addEventListener("click", async () => {
  const file = videoInput.files[0];
  if (!file) return alert("Upload video first");

  subtitlesDiv.innerHTML = "Processing Audio... ⏳";

  const audioData = await extractAudio(file);

  const result = await transcriber(audioData, {
    return_timestamps: "word",
    generate_kwargs: {
      language: "hi",
      task: "transcribe"
    }
  });

  if (!result.chunks) {
    subtitlesDiv.innerHTML = "Speech not detected ❌";
    return;
  }

  wordChunks = normalizeHindi(result.chunks);

  subtitlesDiv.innerHTML = "Ready ▶ Play Video";
  startSubtitleEngine();
});

// -------------------------
// 4️⃣ Extract Audio
// -------------------------
async function extractAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  return decoded.getChannelData(0);
}

// -------------------------
// 5️⃣ Urdu → Hindi Normalize
// -------------------------
function normalizeHindi(chunks) {
  const urduToHindiMap = {
    "ہے": "है",
    "میں": "में",
    "اور": "और",
    "کی": "की",
    "کا": "का",
    "کو": "को",
    "یہ": "यह",
    "وہ": "वह"
  };

  return chunks.map(word => {
    let text = word.text.trim();

    Object.keys(urduToHindiMap).forEach(urdu => {
      if (text.includes(urdu)) {
        text = text.replaceAll(urdu, urduToHindiMap[urdu]);
      }
    });

    return {
      ...word,
      text
    };
  });
}

// -------------------------
// 6️⃣ Subtitle Sync Engine
// -------------------------
function startSubtitleEngine() {
  videoElement.addEventListener("timeupdate", () => {
    const currentTime = videoElement.currentTime;

    let activeText = "";

    wordChunks.forEach(word => {
      const [start, end] = word.timestamp;

      if (currentTime >= start && currentTime <= end) {
        activeText += `<span style="color:yellow;">${word.text}</span> `;
      } else {
        activeText += `<span style="opacity:0.6;">${word.text}</span> `;
      }
    });

    subtitlesDiv.innerHTML = activeText;
  });
    }
