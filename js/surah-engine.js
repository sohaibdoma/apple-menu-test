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
  return mode === "reading" || mode === "tajweed" || mode === "mushaf";
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

  return "reading";
}

function getModeLabel(mode) {
  const lang = document.documentElement.getAttribute("data-lang") || "ar";

  if (mode === "reading") {
    if (lang === "en") return "Reading";
    if (lang === "tr") return "Okuma";
    return "قراءة";
  }

  if (mode === "tajweed") {
    if (lang === "en") return "Tajweed";
    if (lang === "tr") return "Tecvid";
    return "تجويد";
  }

  if (mode === "mushaf") {
    if (lang === "en") return "Mushaf";
    if (lang === "tr") return "Mushaf";
    return "مصحف";
  }

  return mode;
}

function renderModeSwitch(currentMode) {
  const holder = document.getElementById("quran-mode-switch");
  if (!holder) return;

  holder.innerHTML = `
    <div class="quran-mode-switch" role="group" aria-label="Quran mode switch">
      <button
        type="button"
        class="quran-mode-btn${currentMode === "reading" ? " is-active" : ""}"
        data-mode="reading"
        aria-pressed="${currentMode === "reading" ? "true" : "false"}"
      >
        ${getModeLabel("reading")}
      </button>

      <button
        type="button"
        class="quran-mode-btn${currentMode === "tajweed" ? " is-active" : ""}"
        data-mode="tajweed"
        aria-pressed="${currentMode === "tajweed" ? "true" : "false"}"
      >
        ${getModeLabel("tajweed")}
      </button>

      <button
        type="button"
        class="quran-mode-btn${currentMode === "mushaf" ? " is-active" : ""}"
        data-mode="mushaf"
        aria-pressed="${currentMode === "mushaf" ? "true" : "false"}"
      >
        ${getModeLabel("mushaf")}
      </button>
    </div>
  `;

  const buttons = holder.querySelectorAll(".quran-mode-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextMode = button.getAttribute("data-mode");
      if (!nextMode || nextMode === currentMode) return;

      setStoredQuranMode(nextMode);
      window.location.reload();
    });
  });
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

  let versesRes;

  if (mode === "tajweed") {
    versesRes = await api.getTajweedVersesByChapter(id);
  } else if (mode === "mushaf") {
    versesRes = await api.getMushafVersesByChapter(id);
  } else {
    versesRes = await api.getUthmaniVersesByChapter(id);
  }

  return {
    chapter: chapterRes.chapter,
    verses: versesRes.verses,
    mode
  };
}

function toArabicDigits(n) {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

function renderSurah(data) {
  const header = document.getElementById("surah-header");
  const content = document.getElementById("surah-content");
  const navTitle = document.getElementById("nav-surah-title");

  if (navTitle) {
    navTitle.textContent = data.chapter.name_arabic;
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

  data.verses.forEach((verse, index) => {
    const pageNum = verse.page_number ?? null;
    if (pageNum !== null) currentPage = pageNum;

    const ayah = document.createElement("div");
    ayah.classList.add("ayah");

    const verseKey =
      verse.verse_key ||
      `${data.chapter.id}:${verse.verse_number ?? index + 1}`;

    ayah.id = `ayah-${String(verseKey).replace(":", "-")}`;

    const text = document.createElement("span");
    text.className = "ayah-text";

    if (data.mode === "mushaf") {
      ayah.classList.add("ayah-mushaf");

      const mushafSpan = document.createElement("span");
      mushafSpan.className = "mushaf-text";
      mushafSpan.textContent = verse.code_v2 || "";

      text.appendChild(mushafSpan);
    }

    else if (data.mode === "tajweed") {
      text.innerHTML = verse.text_uthmani_tajweed || "";
    }

    else {
      text.textContent = verse.text_uthmani || "";
    }

    const badge = document.createElement("span");
    badge.className = "q-badge q-badge--ayah";

    const verseNo = verse.verse_number ?? index + 1;
    badge.textContent = toArabicDigits(verseNo);

    ayah.appendChild(text);
    ayah.appendChild(badge);

    content.appendChild(ayah);
  });
}
