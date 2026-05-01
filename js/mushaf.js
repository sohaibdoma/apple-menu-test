(function () {
  "use strict";

  let pagesMap = new Map();
  let renderedPages = new Set();
  let highestRenderedPage = 0;
  let isLoadingMore = false;

  let highestLoadedSurah = 0;
  const loadedSurahIds = new Set();

  const SURAH_NAMES_AR = { /* unchanged */ };

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

  function getSurahNameArabicById(surahId) {
    return SURAH_NAMES_AR[surahId] || "";
  }

  function updateNextSurahPill() {
    const navTitle = document.getElementById("nav-surah-title");
    const btn = document.getElementById("mushafNextSurahBtn");
    const nameEl = document.getElementById("mushafNextSurahName");

    if (!navTitle || !btn || !nameEl) return;

    const currentName = navTitle.textContent.trim();

    let currentId = null;

    for (const [id, name] of Object.entries(SURAH_NAMES_AR)) {
      if (name === currentName) {
        currentId = Number(id);
        break;
      }
    }

    if (!currentId || currentId >= 114) {
      btn.style.display = "none";
      return;
    }

    const nextId = currentId + 1;
    const nextName = getSurahNameArabicById(nextId);

    nameEl.textContent = nextName;
    btn.href = `surah.html?surah=${nextId}`;
    btn.style.display = "inline-flex";
  }

  function addVersesToPagesMap(verses) { /* unchanged */ }
  function getPageVerses(pageNumber) { /* unchanged */ }
  async function loadSurahIntoCache(surahId) { /* unchanged */ }
  async function loadAllRemainingSurahs() { /* unchanged */ }
  function isPageComplete(pageNumber) { /* unchanged */ }
  async function ensurePageIsComplete(pageNumber) { /* unchanged */ }

  function createSurahHeaderBlock(surahId) { /* unchanged */ }

  function updateNavbarSurahTitle() {
    const navTitle = document.getElementById("nav-surah-title");
    const headers = Array.from(document.querySelectorAll(".mushaf-surah-start"));

    if (!navTitle || headers.length === 0) return;

    const headerOffset = 140;
    let currentHeader = headers[0];

    headers.forEach((header) => {
      const rect = header.getBoundingClientRect();
      if (rect.top <= headerOffset) {
        currentHeader = header;
      }
    });

    const surahName = currentHeader.getAttribute("data-surah-name") || "";
    if (surahName) {
      navTitle.textContent = surahName;
      updateNextSurahPill(); // 🔥 added
    }
  }

  function createMushafPage(pageNumber, verses) { /* unchanged */ }
  function appendPage(pageNumber) { /* unchanged */ }
  async function renderPageWhenReady(pageNumber) { /* unchanged */ }

  async function renderInitialPages() {
    const pagesRoot = document.getElementById("mushaf-pages");
    if (!pagesRoot) return;

    pagesRoot.innerHTML = "";
    renderedPages.clear();
    highestRenderedPage = 0;

    await renderPageWhenReady(1);
    await renderPageWhenReady(2);
    await renderPageWhenReady(3);

    updateNavbarSurahTitle(); // 🔥 triggers pill
  }

  function isNearBottom() { /* unchanged */ }

  async function appendAllRemainingPagesToEnd() { /* unchanged */ }

  async function loadNextPagesIfNeeded() {
    if (isLoadingMore) return;
    if (!isNearBottom()) return;

    isLoadingMore = true;

    try {
      let didAppend = false;

      while (isNearBottom()) {
        const nextPage = highestRenderedPage + 1;
        if (nextPage > 604) break;

        const appended = await renderPageWhenReady(nextPage);
        if (!appended) break;

        didAppend = true;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      if (didAppend) {
        updateNavbarSurahTitle(); // 🔥 keeps pill updated
      }
    } catch (error) {
      console.error("Failed to load next Mushaf pages:", error);
    } finally {
      isLoadingMore = false;
    }
  }

  async function loadInitialMushafData() {
    await loadSurahIntoCache(1);
    await loadSurahIntoCache(2);
    await renderInitialPages();
  }

  function initScrollBottomButton() {
    const scrollBottomBtn = document.getElementById("mushafScrollBottomBtn");
    if (!scrollBottomBtn) return;

    scrollBottomBtn.addEventListener("click", async () => {
      try {
        scrollBottomBtn.disabled = true;

        await appendAllRemainingPagesToEnd();

        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        });

        updateNavbarSurahTitle();
      } catch (error) {
        console.error("Failed to force-load Mushaf end:", error);
      } finally {
        scrollBottomBtn.disabled = false;
      }
    });
  }

  document.addEventListener("scroll", () => {
    updateNavbarSurahTitle();
    loadNextPagesIfNeeded();
  }, { passive: true });

  window.addEventListener("resize", () => {
    updateNavbarSurahTitle();
    loadNextPagesIfNeeded();
  });

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      await loadInitialMushafData();
      await loadNextPagesIfNeeded();
      initScrollBottomButton();
    } catch (error) {
      console.error("Failed to load Mushaf pages:", error);

      const pagesRoot = document.getElementById("mushaf-pages");
      if (pagesRoot) {
        pagesRoot.innerHTML = "<p>Failed to load Mushaf pages.</p>";
      }
    }
  });
})();
