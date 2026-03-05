(function () {
  "use strict";

  function initSearch() {
    const holder = document.getElementById("search-placeholder");
    if (!holder) return;

    if (holder.dataset.ready === "1") return;
    holder.dataset.ready = "1";

    // Build UI (Arabic / RTL)
holder.innerHTML = `
  <div class="search-sheet" role="search">
    <div class="search-head">
      <input
        id="searchInput"
        class="search-input"
        type="search"
        autocomplete="off"
        spellcheck="false"
        dir="rtl"
        placeholder="اكتب للبحث"
        aria-label="اكتب للبحث"
      />
    </div>

    <div id="searchResults" class="search-results" role="list"></div>
  </div>
`;

    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");
    if (!input || !results) return;

    // iOS: focus input when search overlay opens (best-effort, doesn't break anything)
    const searchToggle = document.getElementById("searchToggle");
    if (searchToggle) {
      searchToggle.addEventListener("click", () => {
        // allow overlay class to apply first
        requestAnimationFrame(() => {
          // focus only if overlay is open
          if (document.body.classList.contains("search-open")) {
            input.focus({ preventScroll: true });
          }
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

    function collectMenuItems() {
      const menu = document.getElementById("main-menu");
      if (!menu) return [];
      return [...menu.querySelectorAll("a[href]")].map((a) => ({
        type: "menu",
        label: a.textContent.trim(),
        href: a.getAttribute("href"),
      }));
    }

    function collectPageTextHits(q) {
      const hits = [];
      const nodes = document.querySelectorAll(
        ".ayah, .ayah-text, #surah-content, .surah-title, .bismillah"
      );

      nodes.forEach((el) => {
        const text = el.textContent || "";
        if (norm(text).includes(q)) {
          const trimmed = text.trim();
          hits.push({
            type: "page",
            label: trimmed.slice(0, 140) + (trimmed.length > 140 ? "…" : ""),
            el,
          });
        }
      });

      return hits;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = `<div class="search-empty">لا توجد نتائج</div>`;
        return;
      }

      results.innerHTML = items
        .slice(0, 80)
        .map((it, idx) => {
          const safe = escapeHtml(it.label || "");
          return `<button class="search-result" type="button" data-idx="${idx}">${safe}</button>`;
        })
        .join("");

      const buttons = results.querySelectorAll(".search-result");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = Number(btn.getAttribute("data-idx"));
          const item = items[i];
          if (!item) return;

          window.Wahyollah?.closeOverlay?.();

          if (item.type === "menu") {
            window.location.href = item.href;
            return;
          }

          if (item.type === "page" && item.el) {
            item.el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      });
    }

    function doSearch() {
      const q = norm(input.value);

      if (!q) {
        results.innerHTML = "";
        return;
      }

      const menuItems = collectMenuItems().filter((it) =>
        norm(it.label).includes(q)
      );
      const pageHits = collectPageTextHits(q);

      render([...menuItems, ...pageHits]);
    }

    input.addEventListener("input", doSearch);

    // initial state
    results.innerHTML = "";
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initSearch = initSearch;
})();
