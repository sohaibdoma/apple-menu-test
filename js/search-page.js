(function () {
  "use strict";

  let liveSearchTimer = null;

  let searchDataPromise = null;

  function getQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function norm(s) {
    return (s || "").toString().trim().toLowerCase();
  }

  function normalizeSearchText(s) {
    const normalizeArabic = window.Wahyollah?.normalizeArabic;
    if (typeof normalizeArabic === "function") {
      return normalizeArabic(s);
    }
    return norm(s);
  }

  function escapeHtml(s) {
    return (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

function highlightMatch(text, query) {
  return escapeHtml(text);
}

  function getPageTitle() {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (lang === "en") return "Search";
    if (lang === "tr") return "Arama";
    return "البحث";
  }

  function getResultsLabel(count, query) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (lang === "en") {
      return `${count} results found`;
    }

    if (lang === "tr") {
      return `${count} sonuç bulundu`;
    }

    return `${count} نتيجة`;
  }

  function getEmptyLabel(query) {
    return "";
  }

  function getTypeLabel(type) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (type === "surah") {
      if (lang === "en") return "Surah";
      if (lang === "tr") return "Sure";
      return "سورة";
    }

    if (type === "ayah") {
      if (lang === "en") return "Ayah";
      if (lang === "tr") return "Ayet";
      return "آية";
    }

    if (lang === "en") return "Result";
    if (lang === "tr") return "Sonuç";
    return "نتيجة";
  }

  function setPageHeader(query, count) {
    const titleEl = document.querySelector(".search-page-title");
    const subtitleEl = document.getElementById("search-page-query");
    const input = document.getElementById("searchPageInput");
    const inputWrap = input ? input.closest(".search-input-wrap") : null;

    if (titleEl) {
      titleEl.textContent = "";
      titleEl.style.display = "none";
    }

    if (subtitleEl) {
      subtitleEl.textContent = query ? getResultsLabel(count, query) : "";

      if (inputWrap) {
        inputWrap.insertAdjacentElement("afterend", subtitleEl);
      }
    }

    document.title = query ? `${getPageTitle()} - ${query}` : getPageTitle();
  }




  
async function loadSearchData() {
  if (searchDataPromise) return searchDataPromise;

  const api = window.Wahyollah?.api;
  if (!api) {
    throw new Error("API module not loaded");
  }

  searchDataPromise = (async () => {
    try {
      const [allSurahs, allAyahs] = await Promise.all([
        api.getAllChapters(),
        api.getAllAyahs()
      ]);

      const surahs = allSurahs.map((chapter) => ({
        type: "surah",
        surahId: chapter.id,
        href: `surah.html?surah=${chapter.id}`,
        nameArabic: chapter.name_arabic || "",
        nameSimple: chapter.name_simple || "",
        revelationPlace: chapter.revelation_place || "",
        versesCount: chapter.verses_count || ""
      }));

      const surahNameById = new Map(
        allSurahs.map((chapter) => [chapter.id, chapter.name_arabic || ""])
      );

      const ayahs = allAyahs.map((ayah) => ({
        type: "ayah",
        surahId: ayah.surahId,
        surahNameArabic: surahNameById.get(ayah.surahId) || "",
        ayahNumber: ayah.ayahNumber,
        verseKey: ayah.verseKey,
        pageNumber: ayah.pageNumber,
        textArabic: ayah.textArabic || "",
        href: ayah.href || ""
      }));

      return { surahs, ayahs };
    } catch (error) {
      searchDataPromise = null;
      throw error;
    }
  })();

  return searchDataPromise;
}

  

  function searchSurahs(items, query) {
    const q = normalizeSearchText(query);
    if (!q) return [];

    return items
      .map((item) => {
        const idText = String(item.surahId);
        const arabic = normalizeSearchText(item.nameArabic);
        const simple = norm(item.nameSimple);
        const revelation = norm(item.revelationPlace);
        const versesCount = String(item.versesCount);

        let score = 0;

        if (idText === q) score = 1000;
        else if (arabic === q || simple === q) score = 950;
        else if (arabic.startsWith(q) || simple.startsWith(q)) score = 900;
        else if (arabic.includes(q) || simple.includes(q)) score = 800;
        else if (revelation.includes(q)) score = 500;
        else if (versesCount === q) score = 450;
        else if (versesCount.includes(q)) score = 350;

        if (!score) return null;

        return {
          ...item,
          score
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.surahId - b.surahId;
      });
  }

  function searchAyahs(items, query) {
    const q = normalizeSearchText(query);
    if (!q) return [];

    return items
      .map((item) => {
        const text = normalizeSearchText(item.textArabic);
        const verseKey = norm(item.verseKey);
        const surahId = String(item.surahId);
        const ayahNumber = String(item.ayahNumber);

        let score = 0;

        if (verseKey === q) score = 980;
        else if (`${surahId}:${ayahNumber}` === q) score = 980;
        else if (text === q) score = 920;
        else if (text.startsWith(q)) score = 860;
        else if (text.includes(q)) score = 760;
        else if (ayahNumber === q) score = 300;

        if (!score) return null;

        return {
          ...item,
          score
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.surahId !== b.surahId) return a.surahId - b.surahId;
        return a.ayahNumber - b.ayahNumber;
      });
  }

  function getSurahPrimaryLabel(item) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (lang === "ar") {
      return item.nameArabic || item.nameSimple;
    }

    return item.nameSimple || item.nameArabic;
  }

  function getSurahSecondaryLabel(item) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (lang === "ar") {
      const simple = item.nameSimple || "";
      const number = item.surahId || "";
      return `${simple} • ${number}`;
    }

    const arabic = item.nameArabic || "";
    const number = item.surahId || "";
    return `${arabic} • ${number}`;
  }

  function getAyahPrimaryLabel(item) {
    return item.textArabic || "";
  }

  function getAyahSecondaryLabel(item) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";
    const surahNameArabic = item.surahNameArabic || `سورة ${item.surahId}`;

    if (lang === "en") {
      return `${surahNameArabic} • Ayah ${item.ayahNumber}`;
    }

    if (lang === "tr") {
      return `${surahNameArabic} • Ayet ${item.ayahNumber}`;
    }

    return `${surahNameArabic} • آية ${item.ayahNumber}`;
  }

  function mergeResults(surahItems, ayahItems) {
    const limitedSurahs = surahItems.slice(0, 20);
    const limitedAyahs = ayahItems.slice(0, 80);

    return [...limitedSurahs, ...limitedAyahs];
  }

  function renderResults(items, query) {
    const resultsEl = document.getElementById("search-page-results");
    if (!resultsEl) return;

    if (!items.length) {
      resultsEl.innerHTML = "";
      return;
    }

    resultsEl.innerHTML = items
      .map((item) => {
        const safeHref = escapeHtml(item.href);
        const typeLabel = escapeHtml(getTypeLabel(item.type));

        const primaryLabel =
          item.type === "ayah"
            ? highlightMatch(getAyahPrimaryLabel(item), query)
            : highlightMatch(getSurahPrimaryLabel(item), query);

        const secondaryLabel =
          item.type === "ayah"
            ? highlightMatch(getAyahSecondaryLabel(item), query)
            : highlightMatch(getSurahSecondaryLabel(item), query);

        return `
          <a class="search-result" href="${safeHref}">
            <span class="search-result-type">${typeLabel}</span>
            <span class="search-result-text">${primaryLabel}</span>
            <span class="search-result-meta">${secondaryLabel}</span>
          </a>
        `;
      })
      .join("");
  }

  async function runSearch(query) {
    document.title = query ? `${getPageTitle()} - ${query}` : getPageTitle();

    if (!query) {
      setPageHeader("", 0);
      renderResults([], "");
      return;
    }

    try {
      const { surahs, ayahs } = await loadSearchData();
      const surahMatches = searchSurahs(surahs, query);
      const ayahMatches = searchAyahs(ayahs, query);
      const items = mergeResults(surahMatches, ayahMatches);

      renderResults(items, query);
      setPageHeader(query, items.length);
    } catch (error) {
      console.error(error);
      setPageHeader("", 0);
      renderResults([], query);
    }
  }

  function updateSubmitState(input, submitBtn) {
    const hasValue = norm(input.value).length > 0;

    submitBtn.disabled = !hasValue;
    submitBtn.setAttribute("aria-disabled", String(!hasValue));
    submitBtn.classList.toggle("is-active", hasValue);
  }

  function updateURL(query) {
    const nextURL = query
      ? `search.html?q=${encodeURIComponent(query)}`
      : "search.html";

    window.history.replaceState({}, "", nextURL);
  }

  function scheduleLiveSearch(input, submitBtn) {
    window.clearTimeout(liveSearchTimer);

    const query = input.value.trim();

    updateSubmitState(input, submitBtn);
    updateURL(query);

    liveSearchTimer = window.setTimeout(() => {
      runSearch(query);
    }, 120);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("searchPageInput");
    const submitBtn = document.getElementById("searchPageSubmit");
    const initialQuery = getQueryFromURL();

    if (!input || !submitBtn) {
      runSearch(initialQuery);
      return;
    }

    input.placeholder = "إبحث في القرآن";

    const searchPage = document.querySelector(".search-page");

    if (searchPage) {
      searchPage.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".search-input")) return;
        input.blur();
      });

      searchPage.addEventListener(
        "touchmove",
        () => {
          input.blur();
        },
        { passive: true }
      );
    }

    const currentDir = document.documentElement.dir || "rtl";
    const inputWrap = input.closest(".search-input-wrap");

    input.dir = currentDir;
    if (inputWrap) {
      inputWrap.setAttribute("dir", currentDir);
    }

    input.value = initialQuery;

    updateSubmitState(input, submitBtn);
    runSearch(initialQuery);

    submitBtn.addEventListener("click", () => {
      const query = input.value.trim();
      if (!query) return;

      updateURL(query);
      runSearch(query);
    });

    input.addEventListener("input", () => {
      scheduleLiveSearch(input, submitBtn);
    });

    input.addEventListener("search", () => {
      scheduleLiveSearch(input, submitBtn);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const query = input.value.trim();
      updateURL(query);
      runSearch(query);
    });
  });
})();
