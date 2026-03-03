// Basic Hindi Spell Correction Dictionary

export function correctHindiText(text) {

  const corrections = {
    "तकदिरें": "तकदीरें",
    "तकदिर": "तकदीर",
    "हैे": "है",
    "मे": "में",
    "क्युकी": "क्योंकि",
    "सच्ची": "सच्ची",
    "वकत": "वक्त",
    "तस्वीरें": "तस्वीरें",
    "है": "है",
    "हैं": "हैं"
  };

  Object.keys(corrections).forEach(wrong => {
    const regex = new RegExp(`\\b${wrong}\\b`, "g");
    text = text.replace(regex, corrections[wrong]);
  });

  return text;
}
