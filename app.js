import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber;
let currentWords = [];

// --------------------
// Load Whisper Model
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
// Handle Video Upload
// --------------------
const videoInput = document.getElementById("videoInput");
const videoElement = document.getElementById("video");
const subtitlesDiv = document.getElementById("subtitles");

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  videoElement.src = url;
});

// --------------------
// Generate Subtitles
// --------------------
document.getElementById("processBtn").addEventListener("click", async () => {
  const file = videoInput.files[0];
  if (!file) return alert("Upload video first");

  subtitlesDiv.innerHTML = "Processing... ⏳";

  const audioData = await extractAudio(file);

  const result = await transcriber(audioData, {
    return_timestamps: "word"
  });

  console.log(result);

  if (!result.chunks) {
    subtitlesDiv.innerHTML = "No speech detected.";
    return;
  }

  currentWords = result.chunks;

  subtitlesDiv.innerHTML = "Ready ▶ Play video";

  startSubtitleSync(currentWords, videoElement);
});

// --------------------
// Extract Audio Properly
// --------------------
async function extractAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const channelData = decoded.getChannelData(0);
  return channelData;
}

// --------------------
// Subtitle Sync System
// --------------------
function startSubtitleSync(words, video) {
  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;

    const activeWord = words.find(word =>
      currentTime >= word.timestamp[0] &&
      currentTime <= word.timestamp[1]
    );

    if (activeWord) {
      subtitlesDiv.innerHTML =
        `<span style="
          color:${randomColor()};
          font-family:${randomFont()};
          font-size:22px;
          font-weight:bold;
        ">
          ${activeWord.text}
        </span>`;
    }
  });
}

// --------------------
// Random Styling
// --------------------
function randomColor() {
  const colors = ["red", "yellow", "cyan", "lime", "orange", "pink"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomFont() {
  const fonts = ["Arial", "Courier New", "Georgia", "Verdana"];
  return fonts[Math.floor(Math.random() * fonts.length)];
}
