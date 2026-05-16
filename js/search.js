(function () {
  "use strict";

  let searchDataPromise = null;

  function initSearch() {
    const holder = document.getElementById("search-placeholder");
    if (!holder) return;

    if (holder.dataset.ready === "1") return;
    holder.dataset.ready = "1";

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
    inputWrap.setAttribute("dir", currentDir);

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

    const searchToggle = document.getElementById("searchToggle");
    if (searchToggle) {
      searchToggle.addEventListener("click", () => {
        requestAnimationFrame(() => {
          setTimeout(() => {
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
      const safe = escapeHtml(text);
      if (!query) return safe;

      const q = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${q})`, "gi");

      return safe.replace(regex, `<span class="search-highlight">$1</span>`);
    }

    function goToSearchPage() {
      const q = input.value.trim();
      if (!q) return;

      window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }

    async function loadSearchData() {
      if (searchDataPromise) return searchDataPromise;

      const api = window.Wahyollah?.api;
      if (!api) {
        throw new Error("API module not loaded");
      }

      searchDataPromise = (async () => {
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

        const ayahs = allAyahs.map((ayah) => ({
          type: "ayah",
          surahId: ayah.surahId,
          ayahNumber: ayah.ayahNumber,
          verseKey: ayah.verseKey,
          pageNumber: ayah.pageNumber,
          textArabic: ayah.textArabic || "",
          href: ayah.href || ""
        }));

        return { surahs, ayahs };
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

    function getPrimaryLabel(item) {
      const lang = document.documentElement.getAttribute("data-lang") || "ar";

      if (item.type === "ayah") {
        return item.textArabic || "";
      }

      if (lang === "ar") {
        return item.nameArabic || item.nameSimple;
      }

      return item.nameSimple || item.nameArabic;
    }

    function getSecondaryLabel(item) {
      const lang = document.documentElement.getAttribute("data-lang") || "ar";

      if (item.type === "ayah") {
        if (lang === "en") {
          return `Surah ${item.surahId} • Ayah ${item.ayahNumber}`;
        }

        if (lang === "tr") {
          return `Sure ${item.surahId} • Ayet ${item.ayahNumber}`;
        }

        const surah = window.Wahyollah?.i18nCache?.ar?.[`menu.${String(item.surahId).padStart(3, "0")}`] || `سورة ${item.surahId}`;
return `${surah} • آية ${item.ayahNumber}`;
      }

      if (lang === "ar") {
        const simple = item.nameSimple || "";
        const number = item.surahId || "";
        return `${simple} • ${number}`;
      }

      const arabic = item.nameArabic || "";
      const number = item.surahId || "";
      return `${arabic} • ${number}`;
    }

    function renderQuickLinks() {
      results.innerHTML = `
        <div class="search-quick-links" aria-label="روابط سريعة">
          <div class="search-quick-title">روابط سريعة</div>

          <button class="search-result search-quick-link" type="button" data-href="surah.html?surah=2#ayah-2-255">
            <span class="search-result-text">آية الكرسي</span>
          </button>

          <button class="search-result search-quick-link" type="button" data-href="surah.html?surah=2">
            <span class="search-result-text">سورة البقرة</span>
          </button>
        </div>
      `;

      results.querySelectorAll(".search-quick-link").forEach((btn) => {
        btn.addEventListener("click", () => {
          const href = btn.getAttribute("data-href");
          if (!href) return;

          window.Wahyollah?.closeOverlay?.();
          window.location.href = href;
        });
      });
    }

    function render(items, query) {
      if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "search-empty";
        empty.textContent =
          window.Wahyollah?.i18nCache?.[
            document.documentElement.getAttribute("data-lang") || "ar"
          ]?.search_empty || "لا توجد نتائج";

        results.replaceChildren(empty);
        return;
      }

      results.innerHTML = items
        .map((it, idx) => {
          const primary = highlightMatch(getPrimaryLabel(it), query);
          const secondary = highlightMatch(getSecondaryLabel(it), query);

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

      const q = input.value.trim();

      if (!q) {
        renderQuickLinks();
        return;
      }

      try {
        const { surahs, ayahs } = await loadSearchData();
        const surahMatches = searchSurahs(surahs, q).slice(0, 8);
        const ayahMatches = searchAyahs(ayahs, q).slice(0, 12);
        const items = [...surahMatches, ...ayahMatches];

        render(items, q);
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

    renderQuickLinks();
    updateSubmitState();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initSearch = initSearch;
})();
