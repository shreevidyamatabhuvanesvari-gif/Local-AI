const videoInput = document.getElementById("videoInput");
const video = document.getElementById("video");
const subtitles = document.getElementById("subtitles");
const btn = document.getElementById("generateBtn");

videoInput.addEventListener("change", function(){

const file = this.files[0];

if(file){

video.src = URL.createObjectURL(file);
video.load();

}

});

btn.onclick = async function(){

const file = videoInput.files[0];

if(!file){

alert("Please upload video first");
return;

}

subtitles.innerText = "Processing audio...";

const formData = new FormData();

formData.append("video", file);

try{

const res = await fetch("YOUR_NGROK_URL/transcribe",{

method:"POST",
body:formData

});

const text = await res.text();

subtitles.innerText = text;

}

catch(err){

subtitles.innerText = "Error connecting to server";

}

};
