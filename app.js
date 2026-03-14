import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0";

let transcriber=null;

const videoInput=document.getElementById("videoInput");
const video=document.getElementById("video");
const subtitles=document.getElementById("subtitles");
const generateBtn=document.getElementById("generateBtn");

subtitles.textContent="Loading speech AI...";

transcriber = await pipeline(
"automatic-speech-recognition",
"Xenova/whisper-small"
);

subtitles.textContent="AI ready";

videoInput.addEventListener("change",()=>{

const file=videoInput.files[0];

if(file){

video.src=URL.createObjectURL(file);

}

});

generateBtn.onclick=async()=>{

const file=videoInput.files[0];

if(!file){
alert("Upload video first");
return;
}

subtitles.textContent="Extracting audio...";

const audio = await extractAudio(file);

subtitles.textContent="Transcribing...";

const result = await transcriber(audio);

subtitles.textContent=result.text;

};

async function extractAudio(file){

const buffer=await file.arrayBuffer();

const ctx=new AudioContext();

const decoded=await ctx.decodeAudioData(buffer);

return decoded.getChannelData(0);

}
