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
  void target.offsetWidth; // restart animation
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
        24; // small breathing space

      window.scrollTo({
        top: y,
        behavior: "smooth"
      });

      flashAyahTarget(target);

    }, 120);
  });
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

  document.body.dataset.surah = String(surahId);
  if (window.Wahyollah?.markCurrentSurah) {
    window.Wahyollah.markCurrentSurah();
  }

  try {
    const surahData = await fetchSurah(surahId);
    renderSurah(surahData);
    scrollToAyahHashTarget();
  } catch (error) {
    contentEl.innerHTML = "<p>Failed to load Surah.</p>";
    console.error(error);
  }
});

async function fetchSurah(id) {
  const api = window.Wahyollah?.api;
  if (!api) throw new Error("API module not loaded");

  const chapterRes = await api.getChapter(id);
  const versesRes = await api.getUthmaniVersesByChapter(id);

  return {
    chapter: chapterRes.chapter,
    verses: versesRes.verses
  };
}

function toArabicDigits(n) {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

function getNextSurahLabel() {
  const lang = document.documentElement.getAttribute("data-lang") || "ar";

  if (lang === "en") return "Next Surah";
  if (lang === "tr") return "Sonraki Sure";
  return "السورة التالية";
}

function getPreviousSurahLabel() {
  const lang = document.documentElement.getAttribute("data-lang") || "ar";

  if (lang === "en") return "Previous Surah";
  if (lang === "tr") return "Önceki Sure";
  return "السورة السابقة";
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

  link.textContent = `${getNextSurahLabel()}: ${nextName}`;

  return link;
}

async function buildPreviousSurahLink(currentSurahId) {
  const previousSurahId = currentSurahId - 1;

  if (previousSurahId < 1) return null;

  const link = document.createElement("a");
  link.className = "previous-surah-link";
  link.href = `surah.html?surah=${previousSurahId}`;

  const lang = document.documentElement.getAttribute("data-lang") || "ar";
  const api = window.Wahyollah?.api;

  let previousName = "";

  try {
    const res = await api.getChapter(previousSurahId);

    if (lang === "ar") previousName = res.chapter.name_arabic;
    else previousName = res.chapter.name_simple;
  } catch (e) {
    previousName = "";
  }

  link.textContent = `${getPreviousSurahLabel()}: ${previousName}`;

  return link;
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
      Promise.all([
        buildPreviousSurahLink(chapterId),
        buildNextSurahLink(chapterId)
      ]).then(([previousLink, nextLink]) => {
        if (previousLink || nextLink) {
          const navWrap = document.createElement("div");
          navWrap.className = "surah-nav-wrap";

          if (nextLink) {
            navWrap.appendChild(nextLink);
          }

          if (previousLink) {
            navWrap.appendChild(previousLink);
          }

          content.appendChild(navWrap);
        }
      });
    }
  };

  data.verses.forEach((verse, index) => {
    const pageNum = verse.page_number ?? null;

    // If we moved to a new page, close the previous page at the bottom
    if (currentPage !== null && pageNum !== currentPage) {
      appendPageFooter(currentPage);
    }

    if (pageNum !== null) currentPage = pageNum;

    const ayah = document.createElement("div");
    ayah.classList.add("ayah");

    const verseKey = verse.verse_key || `${data.chapter.id}:${verse.verse_number ?? (index + 1)}`;
    ayah.id = `ayah-${String(verseKey).replace(":", "-")}`;
    ayah.setAttribute("data-verse-key", verseKey);

    const text = document.createElement("span");
    text.className = "ayah-text";
    text.textContent = verse.text_uthmani;

    const badge = document.createElement("span");
    badge.className = "q-badge q-badge--ayah";

    // Prefer API verse number, fallback to index + 1
    const verseNo = verse.verse_number ?? (index + 1);
    badge.textContent = toArabicDigits(verseNo);

    ayah.appendChild(text);
    ayah.appendChild(badge);
    content.appendChild(ayah);
  });

  // Close last page at the bottom
  if (currentPage !== null) {
    appendPageFooter(currentPage, {
      isLastPage: true,
      chapterId: data.chapter.id
    });
  }
}
