console.log("APP STARTED");

document.addEventListener("DOMContentLoaded", async () => {

  const sub = document.getElementById("subtitles");
  sub.textContent = "Testing Transformers Load...";

  try {

    const { pipeline } = await import(
      "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0"
    );

    sub.textContent = "Transformers Loaded ✔";

  } catch (err) {
    sub.textContent = "Transformers FAILED ❌";
    console.error("IMPORT ERROR:", err);
  }

});
