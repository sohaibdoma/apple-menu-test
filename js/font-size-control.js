(function () {
  "use strict";

  const STORAGE_KEY = "quranFontSize";
  const VALID_SIZES = new Set(["small", "normal", "large"]);

  function getSavedSize() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VALID_SIZES.has(saved) ? saved : "normal";
    } catch (e) {
      return "normal";
    }
  }

  function saveSize(size) {
    if (!VALID_SIZES.has(size)) return;

    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch (e) {}
  }

  function applySize(size) {
    document.body.dataset.quranFontSize = size;

    document.querySelectorAll("[data-font-size-option]").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.dataset.fontSizeOption === size
      );
    });
  }

  function initFontSizeControl() {
    const savedSize = getSavedSize();
    applySize(savedSize);

    document.querySelectorAll("[data-font-size-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const size = btn.dataset.fontSizeOption;
        if (!VALID_SIZES.has(size)) return;

        saveSize(size);
        applySize(size);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initFontSizeControl);
})();
