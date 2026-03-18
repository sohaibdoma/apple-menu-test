(function () {
  "use strict";

  function toArabicDigits(n) {
    return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  }

  function cleanTajweedHtml(html) {
    if (!html || typeof html !== "string") return "";

    const template = document.createElement("template");
    template.innerHTML = html;

    template.content.querySelectorAll("tajweed").forEach((el) => {
      el.replaceWith(...el.childNodes);
    });

    return template.innerHTML;
  }

  function updateNavbarSurahTitle() {
    const navTitle = document.getElementById("nav-surah-title");
    const pages = Array.from(document.querySelectorAll(".mushaf-page"));

    if (!navTitle || pages.length === 0) return;

    let bestPage = null;
    let bestVisibleHeight = 0;

    pages.forEach((page) => {
      const rect = page.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (visibleHeight > bestVisibleHeight) {
        bestVisibleHeight = visibleHeight;
        bestPage = page;
      }
    });

    if (!bestPage) return;

    const surahName = bestPage.getAttribute("data-surah-name") || "";
    if (surahName) {
      navTitle.textContent = surahName;
    }
  }

  function renderMushafPage(pageNumber, verses) {
    const pagesRoot = document.getElementById("mushaf-pages");

    if (!pagesRoot) return;

    pagesRoot.innerHTML = "";

    if (!verses || verses.length === 0) {
      pagesRoot.innerHTML = "<p>Failed to load Mushaf page.</p>";
      return;
    }

    const firstVerse = verses[0];
    const surahId = firstVerse?.chapter_id || 1;
    const surahName = surahId === 1 ? "الفاتحة" : "البقرة";

    const page = document.createElement("section");
    page.className = "mushaf-page";
    page.setAttribute("data-page-number", String(pageNumber));
    page.setAttribute("data-surah-id", String(surahId));
    page.setAttribute("data-surah-name", surahName);

    const text = document.createElement("div");
    text.className = "mushaf-text";

    verses.forEach((verse) => {
      const inlineAyah = document.createElement("span");
      inlineAyah.className = "mushaf-ayah-inline";

      const verseHtml = cleanTajweedHtml(verse.text_uthmani_tajweed || "");
      inlineAyah.innerHTML = verseHtml + " ";

      text.appendChild(inlineAyah);
    });

    const pageNumberEl = document.createElement("div");
    pageNumberEl.className = "mushaf-page-number";
    pageNumberEl.textContent = toArabicDigits(pageNumber);

    page.appendChild(text);
    page.appendChild(pageNumberEl);
    pagesRoot.appendChild(page);

    updateNavbarSurahTitle();
  }

  async function loadRealFirstMushafPage() {
    const api = window.Wahyollah?.api;
    const pagesRoot = document.getElementById("mushaf-pages");

    if (!api) {
      throw new Error("API module not loaded");
    }

    if (!pagesRoot) return;

    const [surah1, surah2] = await Promise.all([
      api.getTajweedVersesByChapter(1),
      api.getTajweedVersesByChapter(2)
    ]);

    const allVerses = [
      ...(surah1?.verses || []),
      ...(surah2?.verses || [])
    ];

    const page1Verses = allVerses.filter((verse) => verse.page_number === 1);

    renderMushafPage(1, page1Verses);
  }

  document.addEventListener("scroll", updateNavbarSurahTitle, { passive: true });
  window.addEventListener("resize", updateNavbarSurahTitle);

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await loadRealFirstMushafPage();
    } catch (error) {
      console.error("Failed to load Mushaf page:", error);

      const pagesRoot = document.getElementById("mushaf-pages");
      if (pagesRoot) {
        pagesRoot.innerHTML = "<p>Failed to load Mushaf page.</p>";
      }
    }
  });
})();
