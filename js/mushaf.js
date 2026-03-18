(function () {
  "use strict";

  let pagesMap = new Map();
  let renderedPages = new Set();
  let highestRenderedPage = 0;
  let isLoadingMore = false;

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

  function getSurahNameArabicById(surahId) {
    if (surahId === 1) return "الفاتحة";
    if (surahId === 2) return "البقرة";
    return "";
  }

  function groupVersesByPage(verses) {
    const map = new Map();

    verses.forEach((verse) => {
      const pageNumber = verse.page_number;
      if (!pageNumber) return;

      if (!map.has(pageNumber)) {
        map.set(pageNumber, []);
      }

      map.get(pageNumber).push(verse);
    });

    return map;
  }

  function createMushafPage(pageNumber, verses) {
    const firstVerse = verses[0];
    const surahId = firstVerse?.chapter_id || 1;
    const surahName = getSurahNameArabicById(surahId);

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

    return page;
  }

  function appendPage(pageNumber) {
    const pagesRoot = document.getElementById("mushaf-pages");
    if (!pagesRoot) return;

    if (renderedPages.has(pageNumber)) return;

    const verses = pagesMap.get(pageNumber) || [];
    if (verses.length === 0) return;

    const pageEl = createMushafPage(pageNumber, verses);
    pagesRoot.appendChild(pageEl);

    renderedPages.add(pageNumber);
    highestRenderedPage = Math.max(highestRenderedPage, pageNumber);
  }

  function renderInitialPages() {
    const pagesRoot = document.getElementById("mushaf-pages");
    if (!pagesRoot) return;

    pagesRoot.innerHTML = "";
    renderedPages.clear();
    highestRenderedPage = 0;

    [1, 2, 3].forEach((pageNumber) => {
      appendPage(pageNumber);
    });

    updateNavbarSurahTitle();
  }

  function loadNextPageIfNeeded() {
    if (isLoadingMore) return;

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500;

    if (!nearBottom) return;

    const nextPage = highestRenderedPage + 1;
    if (!pagesMap.has(nextPage)) return;

    isLoadingMore = true;
    appendPage(nextPage);
    updateNavbarSurahTitle();
    isLoadingMore = false;
  }

  async function loadInitialMushafData() {
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

    pagesMap = groupVersesByPage(allVerses);
    renderInitialPages();
  }

  document.addEventListener("scroll", () => {
    updateNavbarSurahTitle();
    loadNextPageIfNeeded();
  }, { passive: true });

  window.addEventListener("resize", updateNavbarSurahTitle);

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await loadInitialMushafData();
    } catch (error) {
      console.error("Failed to load Mushaf pages:", error);

      const pagesRoot = document.getElementById("mushaf-pages");
      if (pagesRoot) {
        pagesRoot.innerHTML = "<p>Failed to load Mushaf pages.</p>";
      }
    }
  });
})();
