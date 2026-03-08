import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber;
let words = [];

const video = document.getElementById("video");
const videoInput = document.getElementById("videoInput");
const subtitleBox = document.getElementById("subtitleBox");
const editor = document.getElementById("editor");
const generateBtn = document.getElementById("generateBtn");

init();

async function init(){

subtitleBox.innerText="Loading AI...";

transcriber = await pipeline(
"automatic-speech-recognition",
"Xenova/whisper-small",
{ quantized:true }
);

subtitleBox.innerText="AI Ready";

}

videoInput.onchange = ()=>{
const file = videoInput.files[0];
video.src = URL.createObjectURL(file);
};

generateBtn.onclick = async ()=>{

const file = videoInput.files[0];

if(!file){
alert("Upload video first");
return;
}

subtitleBox.innerText="Extracting audio...";

const audio = await extractAudio(file);

subtitleBox.innerText="AI Listening...";

const result = await transcriber(audio,{
return_timestamps:"word"
});

words = result.chunks;

editor.value = result.text;

subtitleBox.innerText="Subtitles Ready";

};

video.addEventListener("timeupdate", ()=>{

const time = video.currentTime;

for(let w of words){

if(time>=w.timestamp[0] && time<=w.timestamp[1]){

subtitleBox.innerText = w.text;

break;

}

}

});

async function extractAudio(file){

const buffer = await file.arrayBuffer();

const ctx = new AudioContext();

const decoded = await ctx.decodeAudioData(buffer);

const targetRate = 16000;

const offline = new OfflineAudioContext(
1,
decoded.duration * targetRate,
targetRate
);

const src = offline.createBufferSource();

src.buffer = decoded;

src.connect(offline.destination);

src.start();

const rendered = await offline.startRendering();

return rendered.getChannelData(0);

}
