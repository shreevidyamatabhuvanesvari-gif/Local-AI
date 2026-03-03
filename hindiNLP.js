// Universal Hindi NLP + Matra Normalization Engine
// Rule-based, pattern-driven, dictionary-free core logic

export function processHindiText(inputText) {

  if (typeof inputText !== "string") return "";

  let text = inputText;

  text = normalizeUnicode(text);
  text = normalizeSpacing(text);
  text = normalizeNasalization(text);
  text = fixMatraPlacement(text);
  text = fixHalantIssues(text);
  text = removeDuplicateCharacters(text);
  text = normalizePunctuation(text);

  return text.trim();
}


// -----------------------------------
// 1️⃣ Unicode Normalization
// -----------------------------------
function normalizeUnicode(text) {
  return text.normalize("NFC");
}


// -----------------------------------
// 2️⃣ Spacing Cleanup
// -----------------------------------
function normalizeSpacing(text) {
  return text.replace(/\s+/g, " ").trim();
}


// -----------------------------------
// 3️⃣ Nasalization Normalization
// -----------------------------------
function normalizeNasalization(text) {

  // Replace chandrabindu inconsistencies
  text = text.replace(/ँ+/g, "ँ");

  // Normalize anusvara duplication
  text = text.replace(/ं+/g, "ं");

  // Common nasalization correction pattern
  text = text.replace(/ं([क-ह])/g, "ं$1");

  return text;
}


// -----------------------------------
// 4️⃣ Matra Placement Correction
// -----------------------------------
function fixMatraPlacement(text) {

  // Fix misplaced 'ि' (should come before consonant visually but after logically)
  text = text.replace(/ि([क-ह])/g, "ि$1");

  // Remove double matras
  text = text.replace(/ाा+/g, "ा");
  text = text.replace(/ीी+/g, "ी");
  text = text.replace(/ूू+/g, "ू");
  text = text.replace(/ेे+/g, "े");
  text = text.replace(/ोो+/g, "ो");

  // Fix accidental matra repetition
  text = text.replace(/([ािीुूेैोौंँं])\1+/g, "$1");

  return text;
}


// -----------------------------------
// 5️⃣ Halant (्) Correction
// -----------------------------------
function fixHalantIssues(text) {

  // Remove duplicate halant
  text = text.replace(/््+/g, "्");

  // Remove halant at word end
  text = text.replace(/्(\s|$)/g, "$1");

  return text;
}


// -----------------------------------
// 6️⃣ Duplicate Character Cleanup
// -----------------------------------
function removeDuplicateCharacters(text) {

  // Remove excessive consonant duplication
  text = text.replace(/([क-ह])\1{2,}/g, "$1");

  return text;
}


// -----------------------------------
// 7️⃣ Punctuation Normalize
// -----------------------------------
function normalizePunctuation(text) {

  text = text.replace(/\.{2,}/g, ".");
  text = text.replace(/,{2,}/g, ",");
  text = text.replace(/!{2,}/g, "!");
  text = text.replace(/\?{2,}/g, "?");

  return text;
}
