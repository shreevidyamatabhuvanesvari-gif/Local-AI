console.log("APP JS RUNNING");

document.addEventListener("DOMContentLoaded", () => {
  const sub = document.getElementById("subtitles");
  if (sub) {
    sub.textContent = "JavaScript Working ✔";
  }
});
