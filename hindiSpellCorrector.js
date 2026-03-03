// Advanced Hindi Spell Corrector (Unicode Safe)

export function correctHindiText(inputText) {

  if (typeof inputText !== "string") {
    return "";
  }

  let text = inputText;

  // Common Hindi spelling corrections
  const corrections = {
    "तकदिरें": "तकदीरें",
    "तकदिर": "तकदीर",
    "वकत": "वक्त",
    "मे": "में",
    "क्युकी": "क्योंकि",
    "हैे": "है",
    "हैँ": "हैं",
    "हैैं": "हैं",
    "क्यो": "क्यों",
    "कय": "कई",
    "कही": "कहीं",
    "यु": "यू",
    "किसीभी": "किसी भी",
    "हूँगाा": "हूँगा"
  };

  // Unicode-safe whole word replacement
  for (const wrong in corrections) {

    const correct = corrections[wrong];

    // Custom word boundary for Devanagari
    const regex = new RegExp(
      `(^|\\s)${escapeRegExp(wrong)}(?=\\s|$)`,
      "g"
    );

    text = text.replace(regex, (match, p1) => {
      return p1 + correct;
    });
  }

  // Extra cleanup
  text = text.replace(/\s+/g, " ").trim();

  return text;
}


// Escape regex special characters safely
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
