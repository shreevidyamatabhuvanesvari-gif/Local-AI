import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber;

async function loadModel() {
  transcriber = await pipeline(
    "automatic-speech-recognition",
    "Xenova/whisper-tiny"
  );
  alert("Model Loaded!");
}

loadModel();

document.getElementById("processBtn").addEventListener("click", async () => {
  const video = document.getElementById("video");
  const file = document.getElementById("videoInput").files[0];
  if (!file) return alert("Upload video first");

  const audioBuffer = await extractAudio(file);
  const result = await transcriber(audioBuffer);

  console.log(result);
  alert("Transcription Done! Check console.");
});

async function extractAudio(file) {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer.getChannelData(0);
}
