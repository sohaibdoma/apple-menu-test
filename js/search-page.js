(function () {
  "use strict";

  function getQueryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function norm(s) {
    return (s || "").toString().trim().toLowerCase();
  }

  function escapeHtml(s) {
    return (s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
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
      return `${count} result${count === 1 ? "" : "s"} for "${query}"`;
    }

    if (lang === "tr") {
      return `"${query}" için ${count} sonuç`;
    }

    return `"${query}" لـ ${count} نتيجة`;
  }

  function getEmptyLabel(query) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (lang === "en") {
      return `No results found for "${query}"`;
    }

    if (lang === "tr") {
      return `"${query}" için sonuç bulunamadı`;
    }

    return `لا توجد نتائج لـ "${query}"`;
  }

  function getTypeLabel(type) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (type === "surah") {
      if (lang === "en") return "Surah";
      if (lang === "tr") return "Sure";
      return "سورة";
    }

    if (lang === "en") return "Result";
    if (lang === "tr") return "Sonuç";
    return "نتيجة";
  }

  function setPageHeader(query, count) {
    const titleEl = document.querySelector(".search-page-title");
    const subtitleEl = document.getElementById("search-page-query");

    if (titleEl) {
      titleEl.textContent = getPageTitle();
    }

    if (subtitleEl) {
      subtitleEl.textContent = query
        ? getResultsLabel(count, query)
        : "";
    }

    document.title = query ? `${getPageTitle()} - ${query}` : getPageTitle();
  }

  async function loadAllSurahs() {
    const api = window.Wahyollah?.api;
    if (!api) {
      throw new Error("API module not loaded");
    }

    const requests = [];

    for (let id = 1; id <= 114; id += 1) {
      requests.push(api.getChapter(id));
    }

    const responses = await Promise.all(requests);

    return responses.map((res) => {
      const chapter = res.chapter;

      return {
        type: "surah",
        surahId: chapter.id,
        href: `surah.html?surah=${chapter.id}`,
        nameArabic: chapter.name_arabic || "",
        nameSimple: chapter.name_simple || "",
        revelationPlace: chapter.revelation_place || "",
        versesCount: chapter.verses_count || ""
      };
    });
  }

  function searchItems(items, query) {
    const q = norm(query);
    if (!q) return [];

    return items.filter((item) => {
      return (
        norm(item.nameArabic).includes(q) ||
        norm(item.nameSimple).includes(q) ||
        norm(item.revelationPlace).includes(q) ||
        String(item.surahId).includes(q) ||
        String(item.versesCount).includes(q)
      );
    });
  }

  function getPrimaryLabel(item) {
    const lang = document.documentElement.getAttribute("data-lang") || "ar";

    if (lang === "ar") {
      return item.nameArabic || item.nameSimple;
    }

    return item.nameSimple || item.nameArabic;
  }

  function getSecondaryLabel(item) {
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

  function renderResults(items, query) {
    const resultsEl = document.getElementById("search-page-results");
    if (!resultsEl) return;

    if (!items.length) {
      resultsEl.innerHTML = `
        <div class="search-empty">${escapeHtml(getEmptyLabel(query))}</div>
      `;
      return;
    }

    resultsEl.innerHTML = items
      .map((item) => {
        const safeHref = escapeHtml(item.href);
        const typeLabel = escapeHtml(getTypeLabel(item.type));
        const primaryLabel = escapeHtml(getPrimaryLabel(item));
        const secondaryLabel = escapeHtml(getSecondaryLabel(item));

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

  async function initSearchPage() {
    const query = getQueryFromURL();

    setPageHeader(query, 0);

    if (!query) {
      renderResults([], "");
      return;
    }

    try {
      const allSurahs = await loadAllSurahs();
      const items = searchItems(allSurahs, query);

      setPageHeader(query, items.length);
      renderResults(items, query);
    } catch (error) {
      console.error(error);
      renderResults([], query);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initSearchPage();
  });
})();
