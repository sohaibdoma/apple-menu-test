const QURAN_MODE_STORAGE_KEY = "quranMode";

function getSurahIdFromURL() {
  const params = new URLSearchParams(window.location.search);

  const surahParam = params.get("surah");
  if (surahParam) {
    const num = Number.parseInt(surahParam, 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  const idParam = params.get("id");
  if (idParam) {
    const num = Number.parseInt(idParam, 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  return 1;
}

function getInitialAyahHashTarget() {
  const hash = window.location.hash || "";
  if (!hash.startsWith("#ayah-")) return "";

  return decodeURIComponent(hash.slice(1));
}

function flashAyahTarget(target) {
  if (!target) return;

  target.classList.remove("ayah-targeted");
  void target.offsetWidth;
  target.classList.add("ayah-targeted");
}

function scrollToAyahHashTarget() {
  const targetId = getInitialAyahHashTarget();
  if (!targetId) return;

  const target = document.getElementById(targetId);
  if (!target) return;

  requestAnimationFrame(() => {
    setTimeout(() => {
      const header = document.querySelector(".main-header");
      const headerHeight = header ? header.offsetHeight : 0;

      const y =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        headerHeight -
        24;

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });

      flashAyahTarget(target);
    }, 120);
  });
}

function isSupportedQuranMode(mode) {
  return mode === "tajweed";
}

function getStoredQuranMode() {
  try {
    const stored = localStorage.getItem(QURAN_MODE_STORAGE_KEY);
    return isSupportedQuranMode(stored) ? stored : "";
  } catch (e) {
    return "";
  }
}

function setStoredQuranMode(mode) {
  if (!isSupportedQuranMode(mode)) return;

  try {
    localStorage.setItem(QURAN_MODE_STORAGE_KEY, mode);
  } catch (e) {}
}

function getQuranMode() {
  const storedMode = getStoredQuranMode();
  if (storedMode) return storedMode;

  const configuredMode = window.Wahyollah?.config?.defaultQuranMode;

  if (isSupportedQuranMode(configuredMode)) {
    return configuredMode;
  }

  return "tajweed";
}

function getModeLabel(mode) {
  const lang = document.documentElement.getAttribute("data-lang") || "ar";

  if (mode === "tajweed") {
    if (lang === "en") return "Tajweed";
    if (lang === "tr") return "Tecvid";
    return "تجويد";
  }

  return mode;
}

function renderModeSwitch(currentMode) {
  const holder = document.getElementById("quran-mode-switch");
  if (!holder) return;

  holder.innerHTML = "";
}

function debugTajweedClasses() {
  if (getQuranMode() !== "tajweed") return;

  const nodes = document.querySelectorAll(".ayah-text tajweed[class]");
  const classNames = [...nodes]
    .map((node) => node.getAttribute("class"))
    .filter(Boolean);

  const unique = [...new Set(classNames)].sort();

  console.log("Tajweed classes found:", unique);
}

function sanitizeTajweedMarkup(html) {
  if (!html || typeof html !== "string") {
    return document.createDocumentFragment();
  }

  const template = document.createElement("template");
  template.innerHTML = html;

  const allowedTags = new Set(["SPAN", "TAJWEED"]);
  const allowedClassPattern = /^[a-zA-Z0-9_-]+$/;

  const sanitizeNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || "");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createTextNode("");
    }

    const tagName = node.tagName.toUpperCase();

    if (!allowedTags.has(tagName)) {
      const fragment = document.createDocumentFragment();
      Array.from(node.childNodes).forEach((child) => {
        fragment.appendChild(sanitizeNode(child));
      });
      return fragment;
    }

    const classList = Array.from(node.classList).filter((className) =>
      allowedClassPattern.test(className)
    );

    if (classList.includes("end")) {
      return document.createTextNode("");
    }

    const cleanEl = document.createElement(
      tagName === "TAJWEED" ? "tajweed" : "span"
    );

    if (classList.length > 0) {
      cleanEl.className = classList.join(" ");
    }

    Array.from(node.childNodes).forEach((child) => {
      cleanEl.appendChild(sanitizeNode(child));
    });

    return cleanEl;
  };

  const fragment = document.createDocumentFragment();

  Array.from(template.content.childNodes).forEach((child) => {
    fragment.appendChild(sanitizeNode(child));
  });

  return fragment;
}

document.addEventListener("DOMContentLoaded", async () => {
  const headerEl = document.getElementById("surah-header");
  const contentEl = document.getElementById("surah-content");

  if (!headerEl || !contentEl) return;

  const surahId = getSurahIdFromURL();

  if (!surahId) {
    contentEl.innerHTML = "<p>Invalid Surah ID</p>";
    return;
  }

  const currentMode = getQuranMode();

  document.body.dataset.surah = String(surahId);
  document.body.dataset.quranMode = currentMode;

  if (window.Wahyollah?.markCurrentSurah) {
    window.Wahyollah.markCurrentSurah();
  }

  renderModeSwitch(currentMode);

  try {
    const surahData = await fetchSurah(surahId, currentMode);
    renderSurah(surahData);
    debugTajweedClasses();
    scrollToAyahHashTarget();
  } catch (error) {
    contentEl.innerHTML = "<p>Failed to load Surah.</p>";
    console.error(error);
  }
});

async function fetchSurah(id, mode) {
  const api = window.Wahyollah?.api;
  if (!api) throw new Error("API module not loaded");

  const chapterRes = await api.getChapter(id);

  const versesRes = await api.getTajweedVersesByChapter(id);

  return {
    chapter: chapterRes.chapter,
    verses: versesRes.verses,
    mode
  };
}

function toArabicDigits(n) {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

async function buildNextSurahLink(currentSurahId) {
  const nextSurahId = currentSurahId + 1;

  if (nextSurahId > 114) return null;

  const link = document.createElement("a");
  link.className = "next-surah-link";
  link.href = `surah.html?surah=${nextSurahId}`;

  const lang = document.documentElement.getAttribute("data-lang") || "ar";
  const api = window.Wahyollah?.api;

  let nextName = "";

  try {
    const res = await api.getChapter(nextSurahId);

    if (lang === "ar") nextName = res.chapter.name_arabic;
    else nextName = res.chapter.name_simple;
  } catch (e) {
    nextName = "";
  }

  link.textContent = nextName;

  return link;
}

function renderSurah(data) {
  const header = document.getElementById("surah-header");
  const content = document.getElementById("surah-content");
  const navTitle = document.getElementById("nav-surah-title");

  function updateSurahNavbarPage() {
    if (!navTitle) return;

    const ayahs = Array.from(document.querySelectorAll(".ayah"));
    let currentPageNumber = "";

    ayahs.forEach((ayah) => {
      const rect = ayah.getBoundingClientRect();

      if (rect.top <= 140 && rect.bottom > 140) {
        currentPageNumber = ayah.getAttribute("data-page-number") || "";
      }
    });

    navTitle.innerHTML = currentPageNumber
      ? `<span>${toArabicDigits(currentPageNumber)}</span><span class="nav-title-divider" aria-hidden="true"></span><span>${data.chapter.name_arabic}</span>`
      : `<span>${data.chapter.name_arabic}</span>`;
  }

  header.innerHTML = `
    <div class="surah-title">
      <h1>${data.chapter.name_arabic}</h1>
      <p class="surah-meta">
        ${data.chapter.name_simple} • ${data.chapter.revelation_place} • ${data.chapter.verses_count} Ayahs
      </p>
    </div>
  `;

  content.innerHTML = "";

  if (data.chapter.id !== 9) {
    const bismillah = document.createElement("div");
    bismillah.classList.add("bismillah");
    bismillah.textContent = "﷽";
    content.appendChild(bismillah);
  }

  let currentPage = null;

  const appendPageFooter = (pageNum, options = {}) => {
    if (!pageNum) return;

    const { isLastPage = false, chapterId = null } = options;

    const footer = document.createElement("div");
    footer.className = "mushaf-page-footer";

    const badge = document.createElement("span");
    badge.className = "q-badge q-badge--page";
    badge.textContent = toArabicDigits(pageNum);

    footer.appendChild(badge);
    content.appendChild(footer);

    if (isLastPage && chapterId !== null) {
      buildNextSurahLink(chapterId).then((nextLink) => {
        if (nextLink) {
          const navWrap = document.createElement("div");
          navWrap.className = "surah-nav-wrap";

          navWrap.appendChild(nextLink);

          content.appendChild(navWrap);
        }
      });
    }
  };

  data.verses.forEach((verse, index) => {
    const pageNum = verse.page_number ?? null;

    if (currentPage !== null && pageNum !== currentPage) {
      appendPageFooter(currentPage);
    }

    if (pageNum !== null) currentPage = pageNum;

    const ayah = document.createElement("div");
    ayah.classList.add("ayah");

    const verseKey =
      verse.verse_key || `${data.chapter.id}:${verse.verse_number ?? index + 1}`;
    ayah.id = `ayah-${String(verseKey).replace(":", "-")}`;
    ayah.setAttribute("data-verse-key", verseKey);

    if (pageNum !== null) {
      ayah.setAttribute("data-page-number", String(pageNum));
    }

    const text = document.createElement("span");
    text.className = "ayah-text";

    text.appendChild(sanitizeTajweedMarkup(verse.text_uthmani_tajweed || ""));

    const badge = document.createElement("span");
    badge.className = "q-badge q-badge--ayah";

    const verseNo = verse.verse_number ?? index + 1;
    badge.textContent = toArabicDigits(verseNo);

    ayah.appendChild(text);
    ayah.appendChild(badge);
    content.appendChild(ayah);
  });

  if (currentPage !== null) {
    appendPageFooter(currentPage, {
      isLastPage: true,
      chapterId: data.chapter.id
    });
  }

  updateSurahNavbarPage();

  window.addEventListener("scroll", updateSurahNavbarPage, {
    passive: true
  });
}
