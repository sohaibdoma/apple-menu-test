(function () {
  "use strict";

  function initSearch() {
    const holder = document.getElementById("search-placeholder");
    if (!holder) return;

    if (holder.dataset.ready === "1") return;
    holder.dataset.ready = "1";

    
    // Build UI (minimal + clean)
    holder.innerHTML = `
      <div class="search-sheet" role="search">
        <input id="searchInput" class="search-input" type="search" autocomplete="off" spellcheck="false"
               placeholder="اكتب للبحث" aria-label="Search text" />
        <div id="searchResults" class="search-results" role="list"></div>
      </div>
    `;

    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");

    function norm(s) {
      return (s || "").toString().trim().toLowerCase();
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
      const nodes = document.querySelectorAll(".ayah, .ayah-text, #surah-content, .surah-title, .bismillah");
      nodes.forEach((el) => {
        const text = el.textContent || "";
        if (norm(text).includes(q)) {
          hits.push({ type: "page", label: text.trim().slice(0, 140) + (text.trim().length > 140 ? "…" : ""), el });
        }
      });
      return hits;
    }

    function render(items) {
      if (!results) return;

      if (!items.length) {
        results.innerHTML = `<div class="search-empty">No results</div>`;
        return;
      }

      results.innerHTML = items
        .slice(0, 80)
        .map((it, idx) => {
          const safe = (it.label || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<button class="search-result" type="button" data-idx="${idx}">${safe}</button>`;
        })
        .join("");

      const buttons = results.querySelectorAll(".search-result");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = Number(btn.getAttribute("data-idx"));
          const item = items[i];
          if (!item) return;

          // close overlay for navigation feel
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
        results.innerHTML = `<div class="search-empty">Type to search</div>`;
        return;
      }

      const menuItems = collectMenuItems().filter((it) => norm(it.label).includes(q));
      const pageHits = collectPageTextHits(q);

      render([...menuItems, ...pageHits]);
    }

    input.addEventListener("input", doSearch);

    // initial state
    results.innerHTML = `<div class="search-empty">Type to search</div>`;
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initSearch = initSearch;
})();
