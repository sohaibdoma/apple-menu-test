window.Wahyollah = window.Wahyollah || {};

(() => {
  if (window.Wahyollah.normalizeArabic) return;

  function normalizeArabic(text) {
    if (!text) return "";

    return String(text)
      .normalize("NFKD")
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/\u0640/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  window.Wahyollah.normalizeArabic = normalizeArabic;
})();
