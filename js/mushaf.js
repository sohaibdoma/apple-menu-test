(function () {
  "use strict";

  let pagesMap = new Map();
  let renderedPages = new Set();
  let highestRenderedPage = 0;
  let isLoadingMore = false;

  let highestLoadedSurah = 0;
  const loadedSurahIds = new Set();

  const SURAH_NAMES_AR = {
    1: "الفاتحة",
    2: "البقرة",
    3: "آل عمران",
    4: "النساء",
    5: "المائدة",
    6: "الأنعام",
    7: "الأعراف",
    8: "الأنفال",
    9: "التوبة",
    10: "يونس",
    11: "هود",
    12: "يوسف",
    13: "الرعد",
    14: "إبراهيم",
    15: "الحجر",
    16: "النحل",
    17: "الإسراء",
    18: "الكهف",
    19: "مريم",
    20: "طه",
    21: "الأنبياء",
    22: "الحج",
    23: "المؤمنون",
    24: "النور",
    25: "الفرقان",
    26: "الشعراء",
    27: "النمل",
    28: "القصص",
    29: "العنكبوت",
    30: "الروم",
    31: "لقمان",
    32: "السجدة",
    33: "الأحزاب",
    34: "سبإ",
    35: "فاطر",
    36: "يس",
    37: "الصافات",
    38: "ص",
    39: "الزمر",
    40: "غافر",
    41: "فصلت",
    42: "الشورى",
    43: "الزخرف",
    44: "الدخان",
    45: "الجاثية",
    46: "الأحقاف",
    47: "محمد",
    48: "الفتح",
    49: "الحجرات",
    50: "ق",
    51: "الذاريات",
    52: "الطور",
    53: "النجم",
    54: "القمر",
    55: "الرحمن",
    56: "الواقعة",
    57: "الحديد",
    58: "المجادلة",
    59: "الحشر",
    60: "الممتحنة",
    61: "الصف",
    62: "الجمعة",
    63: "المنافقون",
    64: "التغابن",
    65: "الطلاق",
    66: "التحريم",
    67: "الملك",
    68: "القلم",
    69: "الحاقة",
    70: "المعارج",
    71: "نوح",
    72: "الجن",
    73: "المزمل",
    74: "المدثر",
    75: "القيامة",
    76: "الإنسان",
    77: "المرسلات",
    78: "النبأ",
    79: "النازعات",
    80: "عبس",
    81: "التكوير",
    82: "الانفطار",
    83: "المطففين",
    84: "الانشقاق",
    85: "البروج",
    86: "الطارق",
    87: "الأعلى",
    88: "الغاشية",
    89: "الفجر",
    90: "البلد",
    91: "الشمس",
    92: "الليل",
    93: "الضحى",
    94: "الشرح",
    95: "التين",
    96: "العلق",
    97: "القدر",
    98: "البينة",
    99: "الزلزلة",
    100: "العاديات",
    101: "القارعة",
    102: "التكاثر",
    103: "العصر",
    104: "الهمزة",
    105: "الفيل",
    106: "قريش",
    107: "الماعون",
    108: "الكوثر",
    109: "الكافرون",
    110: "النصر",
    111: "المسد",
    112: "الإخلاص",
    113: "الفلق",
    114: "الناس"
  };

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

  function addVersesToPagesMap(verses) {
    verses.forEach((verse) => {
      const pageNumber = verse.page_number;
      if (!pageNumber) return;

      if (!pagesMap.has(pageNumber)) {
        pagesMap.set(pageNumber, []);
      }

      pagesMap.get(pageNumber).push(verse);
    });
  }

  function getPageVerses(pageNumber) {
    const verses = pagesMap.get(pageNumber) || [];

    return [...verses].sort((a, b) => {
      if (a.chapter_id !== b.chapter_id) {
        return a.chapter_id - b.chapter_id;
      }
      return a.verse_number - b.verse_number;
    });
  }

  async function loadSurahIntoCache(surahId) {
    const api = window.Wahyollah?.api;
    if (!api) {
      throw new Error("API module not loaded");
    }

    if (loadedSurahIds.has(surahId)) return;

    const result = await api.getTajweedVersesByChapter(surahId);
    const verses = result?.verses || [];

    addVersesToPagesMap(verses);
    loadedSurahIds.add(surahId);
    highestLoadedSurah = Math.max(highestLoadedSurah, surahId);
  }

  function isPageComplete(pageNumber) {
    const currentPageVerses = getPageVerses(pageNumber);
    if (currentPageVerses.length === 0) return false;

    if (pageNumber === 604) return true;

    const nextPageVerses = getPageVerses(pageNumber + 1);
    return nextPageVerses.length > 0;
  }

  async function ensurePageIsComplete(pageNumber) {
    while (!isPageComplete(pageNumber) && highestLoadedSurah < 114) {
      await loadSurahIntoCache(highestLoadedSurah + 1);
    }

    return isPageComplete(pageNumber);
  }

  function createSurahHeaderBlock(surahId) {
    const wrapper = document.createElement("div");
    wrapper.className = "mushaf-surah-start";

    const title = document.createElement("div");
    title.className = "mushaf-surah-title";
    title.textContent = getSurahNameArabicById(surahId);

    wrapper.appendChild(title);

    if (surahId !== 1 && surahId !== 9) {
      const bismillah = document.createElement("div");
      bismillah.className = "mushaf-bismillah";
      bismillah.textContent = "﷽";
      wrapper.appendChild(bismillah);
    }

    return wrapper;
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

    let lastRenderedSurahId = null;

    verses.forEach((verse) => {
      const currentSurahId = verse.chapter_id;

      if (verse.verse_number === 1 && currentSurahId !== lastRenderedSurahId) {
        text.appendChild(createSurahHeaderBlock(currentSurahId));
      }

      const inlineAyah = document.createElement("span");
      inlineAyah.className = "mushaf-ayah-inline";

      const verseHtml = cleanTajweedHtml(verse.text_uthmani_tajweed || "");
      inlineAyah.innerHTML = verseHtml + " ";

      text.appendChild(inlineAyah);
      lastRenderedSurahId = currentSurahId;
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
    if (!pagesRoot) return false;
    if (renderedPages.has(pageNumber)) return false;

    const verses = getPageVerses(pageNumber);
    if (verses.length === 0) return false;

    const pageEl = createMushafPage(pageNumber, verses);
    pagesRoot.appendChild(pageEl);

    renderedPages.add(pageNumber);
    highestRenderedPage = Math.max(highestRenderedPage, pageNumber);
    return true;
  }

  async function renderPageWhenReady(pageNumber) {
    const ready = await ensurePageIsComplete(pageNumber);
    if (!ready) return false;
    return appendPage(pageNumber);
  }

  async function renderInitialPages() {
    const pagesRoot = document.getElementById("mushaf-pages");
    if (!pagesRoot) return;

    pagesRoot.innerHTML = "";
    renderedPages.clear();
    highestRenderedPage = 0;

    await renderPageWhenReady(1);
    await renderPageWhenReady(2);
    await renderPageWhenReady(3);

    updateNavbarSurahTitle();
  }

  async function loadNextPageIfNeeded() {
    if (isLoadingMore) return;

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500;

    if (!nearBottom) return;

    isLoadingMore = true;

    try {
      const nextPage = highestRenderedPage + 1;
      const appended = await renderPageWhenReady(nextPage);

      if (appended) {
        updateNavbarSurahTitle();
      }
    } catch (error) {
      console.error("Failed to load next Mushaf page:", error);
    } finally {
      isLoadingMore = false;
    }
  }

  async function loadInitialMushafData() {
    await loadSurahIntoCache(1);
    await loadSurahIntoCache(2);
    await renderInitialPages();
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
