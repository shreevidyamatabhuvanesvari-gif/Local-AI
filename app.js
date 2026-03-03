import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber = null;

document.addEventListener("DOMContentLoaded", async () => {

  const subtitlesDiv = document.getElementById("subtitles");
  const videoInput = document.getElementById("videoInput");
  const processBtn = document.getElementById("processBtn");
  const videoElement = document.getElementById("video");

  subtitlesDiv.textContent = "Loading AI model... ⏳";

  try {

    // 🔹 Load smaller stable model
    transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny",
      { quantized: true }
    );

    subtitlesDiv.textContent = "Model Loaded ✔";

  } catch (error) {

    subtitlesDiv.textContent = "Model Load Failed ❌";
    console.error(error);

  }

  // Video preview
  videoInput.addEventListener("change", () => {

    const file = videoInput.files[0];
    if (!file) return;

    videoElement.src = URL.createObjectURL(file);

  });

  // Process button
  processBtn.addEventListener("click", async () => {

    if (!transcriber) {
      alert("Model not ready");
      return;
    }

    const file = videoInput.files[0];

    if (!file) {
      alert("Upload video first");
      return;
    }

    subtitlesDiv.textContent = "Extracting audio...";

    const audio = await extractAudio(file);

    subtitlesDiv.textContent = "Transcribing...";

    try {

      const result = await transcriber(audio, {
        generate_kwargs: {
          language: "hi",
          task: "transcribe"
        }
      });

      subtitlesDiv.textContent = result.text;

    } catch (err) {

      subtitlesDiv.textContent = "Transcription failed ❌";
      console.error(err);

    }

  });

});


// Extract audio
async function extractAudio(file) {

  const arrayBuffer = await file.arrayBuffer();

  const audioCtx = new AudioContext();
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);

  const offline = new OfflineAudioContext(
    1,
    decoded.duration * 16000,
    16000
  );

  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0);

  const rendered = await offline.startRendering();

  return rendered.getChannelData(0);

}
