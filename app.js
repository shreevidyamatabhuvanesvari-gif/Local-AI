import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber;
let wordChunks = [];

const videoInput = document.getElementById("videoInput");
const videoElement = document.getElementById("video");
const subtitlesDiv = document.getElementById("subtitles");
const processBtn = document.getElementById("processBtn");

// ------------------
// Load Model (Better Hindi)
// ------------------
async function loadModel() {
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-base"
  );
  alert("Model Loaded ✅");
}
loadModel();

// ------------------
// Video Upload
// ------------------
videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (!file) return;

  videoElement.src = URL.createObjectURL(file);
});

// ------------------
// Generate Subtitles
// ------------------
processBtn.addEventListener("click", async () => {
  const file = videoInput.files[0];
  if (!file) return alert("Upload video first");

  subtitlesDiv.innerHTML = "Processing... ⏳";

  const audioData = await extractAudio(file);

  const result = await transcriber(audioData, {
    return_timestamps: "word",
    generate_kwargs: {
      language: "hi",
      task: "transcribe"
    }
  });

  if (!result.chunks) {
    subtitlesDiv.innerHTML = "No speech detected.";
    return;
  }

  wordChunks = result.chunks.map(word => ({
    text: convertUrduToHindi(word.text),
    timestamp: word.timestamp
  }));

  subtitlesDiv.innerHTML = "Play Video ▶";

  startSubtitleEngine();
});

// ------------------
// Extract Audio
// ------------------
async function extractAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  return decoded.getChannelData(0);
}

// ------------------
// Subtitle Engine
// ------------------
function startSubtitleEngine() {

  videoElement.ontimeupdate = () => {
    const currentTime = videoElement.currentTime;

    let html = "";

    wordChunks.forEach(word => {
      if (currentTime >= word.timestamp[0] &&
          currentTime <= word.timestamp[1]) {

        html += `<span style="color:yellow;font-size:32px;">
                  ${word.text}
                </span> `;
      } else {
        html += `<span style="opacity:0.6;">
                  ${word.text}
                </span> `;
      }
    });

    subtitlesDiv.innerHTML = html;
  };
}

// ------------------
// Urdu → Hindi Script Convert
// ------------------
function convertUrduToHindi(text) {
  const map = {
    "ا":"अ","ب":"ब","پ":"प","ت":"त","ٹ":"ट",
    "ث":"स","ج":"ज","چ":"च","ح":"ह","خ":"ख",
    "د":"द","ڈ":"ड","ر":"र","ز":"ज","س":"स",
    "ش":"श","ص":"स","ض":"द","ط":"त","ظ":"ज",
    "ع":"अ","غ":"ग","ف":"फ","ق":"क","ک":"क",
    "گ":"ग","ل":"ल","م":"म","ن":"न","و":"व",
    "ہ":"ह","ی":"ि"
  };

  return text.split("").map(c => map[c] || c).join("");
}
