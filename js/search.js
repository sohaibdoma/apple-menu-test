(function () {
  "use strict";

  let surahIndexPromise = null;

  function initSearch() {
    const holder = document.getElementById("search-placeholder");
    if (!holder) return;

    if (holder.dataset.ready === "1") return;
    holder.dataset.ready = "1";

    // Build UI (Arabic / RTL)
    const sheet = document.createElement("div");
    sheet.className = "search-sheet";
    sheet.setAttribute("role", "search");

    const head = document.createElement("div");
    head.className = "search-head";

    const inputWrap = document.createElement("div");
    inputWrap.className = "search-input-wrap";

    const inputEl = document.createElement("input");
    inputEl.id = "searchInput";
    inputEl.className = "search-input";
    inputEl.type = "search";
    inputEl.autocomplete = "off";
    inputEl.spellcheck = false;
    inputEl.setAttribute("data-i18n-placeholder", "search_placeholder");
    inputEl.setAttribute("data-i18n-aria-label", "search_aria_label");

    const currentDir = document.documentElement.dir || "rtl";
    inputEl.dir = currentDir;

    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "search-submit";
    actionBtn.id = "searchSubmit";
    actionBtn.setAttribute("aria-label", "Search");
    actionBtn.setAttribute("aria-disabled", "true");
    actionBtn.disabled = true;

    actionBtn.innerHTML = `
      <svg class="search-submit-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5"></circle>
        <path d="M16.2 16.2 L20 20"></path>
      </svg>
    `;

    inputWrap.appendChild(inputEl);
    inputWrap.appendChild(actionBtn);

    const resultsEl = document.createElement("div");
    resultsEl.id = "searchResults";
    resultsEl.className = "search-results";
    resultsEl.setAttribute("role", "list");

    head.appendChild(inputWrap);
    sheet.appendChild(head);
    sheet.appendChild(resultsEl);
    holder.replaceChildren(sheet);

    const input = holder.querySelector("#searchInput");
    const submitBtn = holder.querySelector("#searchSubmit");
    const results = holder.querySelector("#searchResults");
    if (!input || !submitBtn || !results) return;

    // iOS: focus input when search overlay opens (best-effort, doesn't break anything)
    const searchToggle = document.getElementById("searchToggle");
    if (searchToggle) {
      searchToggle.addEventListener("click", () => {
        // allow overlay class to apply first
        requestAnimationFrame(() => {
          setTimeout(() => {
            // focus only if overlay is open
            if (document.body.classList.contains("search-open")) {
              input.focus({ preventScroll: true });
            }
          }, 250);
        });
      });
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

    function goToSearchPage() {
      const q = input.value.trim();
      if (!q) return;

      window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }

    async function loadAllSurahs() {
      if (surahIndexPromise) return surahIndexPromise;

      const api = window.Wahyollah?.api;
      if (!api) {
        throw new Error("API module not loaded");
      }

      surahIndexPromise = (async () => {
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
      })();

      return surahIndexPromise;
    }

    function searchSurahs(items, query) {
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

    function render(items) {
      if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "search-empty";
        empty.textContent =
          window.Wahyollah?.i18nCache?.[
            document.documentElement.getAttribute("data-lang") || "ar"
          ]?.search_empty || "No results found";

        results.replaceChildren(empty);
        return;
      }

      results.innerHTML = items
        .slice(0, 80)
        .map((it, idx) => {
          const primary = escapeHtml(getPrimaryLabel(it));
          const secondary = escapeHtml(getSecondaryLabel(it));
          return `
            <button class="search-result" type="button" data-idx="${idx}">
              <span class="search-result-text">${primary}</span>
              <span class="search-result-meta">${secondary}</span>
            </button>
          `;
        })
        .join("");

      const buttons = results.querySelectorAll(".search-result");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = Number(btn.getAttribute("data-idx"));
          const item = items[i];
          if (!item) return;

          window.Wahyollah?.closeOverlay?.();
          window.location.href = item.href;
        });
      });
    }

    function updateSubmitState() {
      const hasValue = norm(input.value).length > 0;

      submitBtn.disabled = !hasValue;
      submitBtn.setAttribute("aria-disabled", String(!hasValue));
      submitBtn.classList.toggle("is-active", hasValue);
    }

    async function doSearch() {
      updateSubmitState();

      const q = norm(input.value);

      if (!q) {
        results.innerHTML = "";
        return;
      }

      try {
        const allSurahs = await loadAllSurahs();
        const items = searchSurahs(allSurahs, q);
        render(items);
      } catch (error) {
        console.error(error);
        results.innerHTML = "";
      }
    }

    input.addEventListener("input", doSearch);

    submitBtn.addEventListener("click", () => {
      const q = norm(input.value);
      if (!q) return;

      goToSearchPage();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = norm(input.value);
        if (!q) return;

        goToSearchPage();
      }
    });

    // initial state
    results.innerHTML = "";
    updateSubmitState();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initSearch = initSearch;
})();
