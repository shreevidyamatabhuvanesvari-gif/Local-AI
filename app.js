function startSubtitleSync(words, video) {
  const subtitleDiv = document.getElementById("subtitles");

  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;

    const activeWord = words.find(word =>
      currentTime >= word.timestamp[0] &&
      currentTime <= word.timestamp[1]
    );

    if (activeWord) {
      subtitleDiv.innerHTML =
        `<span style="color:${randomColor()}; font-family:${randomFont()}">
          ${activeWord.text}
        </span>`;
    }
  });
}

function randomColor() {
  const colors = ["red", "yellow", "cyan", "lime", "orange"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomFont() {
  const fonts = ["Arial", "Courier New", "Georgia", "Verdana"];
  return fonts[Math.floor(Math.random() * fonts.length)];
}
import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber;

async function loadModel() {
  transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-tiny",
  { language: "hindi" }
);
  alert("Model Loaded!");
}

loadModel();

document.getElementById("processBtn").addEventListener("click", async () => {
  const video = document.getElementById("video");
  const file = document.getElementById("videoInput").files[0];
  if (!file) return alert("Upload video first");

  const audioBuffer = await extractAudio(file);
  const result = await transcriber(audioBuffer, {
  return_timestamps: "word"
});

  console.log(result);
  alert("Transcription Done! Check console.");
});

async function extractAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer.getChannelData(0);
}
