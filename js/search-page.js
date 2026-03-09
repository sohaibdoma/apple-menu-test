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

  function collectMenuItems() {
    const menu = document.getElementById("main-menu");
    if (!menu) return [];

    return [...menu.querySelectorAll("a[href]")].map((a) => {
      const href = a.getAttribute("href") || "";
      const label = a.textContent.trim();

      const surahMatch = href.match(/surah\.html\?(?:surah|id)=(\d+)/i);
      const surahId = surahMatch ? Number.parseInt(surahMatch[1], 10) : null;

      return {
        type: "surah",
        label,
        href,
        surahId
      };
    });
  }

  function searchItems(query) {
    const q = norm(query);
    if (!q) return [];

    const items = collectMenuItems();

    return items.filter((item) => {
      const labelMatch = norm(item.label).includes(q);
      const idMatch =
        item.surahId !== null &&
        String(item.surahId).includes(q);

      return labelMatch || idMatch;
    });
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
        const safeLabel = escapeHtml(item.label);
        const safeHref = escapeHtml(item.href);
        const typeLabel = escapeHtml(getTypeLabel(item.type));

        return `
          <a class="search-result" href="${safeHref}">
            <span class="search-result-type">${typeLabel}</span>
            <span class="search-result-text">${safeLabel}</span>
          </a>
        `;
      })
      .join("");
  }

  function waitForMenuAndRender(query) {
    let tries = 0;
    const maxTries = 60;

    function attempt() {
      const menu = document.getElementById("main-menu");

      if (menu || tries >= maxTries) {
        const items = searchItems(query);
        setPageHeader(query, items.length);
        renderResults(items, query);
        return;
      }

      tries += 1;
      setTimeout(attempt, 100);
    }

    attempt();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const query = getQueryFromURL();

    setPageHeader(query, 0);

    if (!query) {
      renderResults([], "");
      return;
    }

    waitForMenuAndRender(query);
  });
})();
