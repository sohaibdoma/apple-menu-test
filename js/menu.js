(function () {
  "use strict";

  function initMenu() {
    const menuButton = document.querySelector(".menu-toggle");
    const searchButton = document.getElementById("searchToggle");
    const chooseSurahButton = document.getElementById("chooseSurahBtn");
    const menuNav = document.getElementById("main-menu");
    const header = document.querySelector(".main-header");

    if (!menuButton || !header) {
      console.warn("Menu elements not found");
      return;
    }

    const getMenuScroller = () => document.getElementById("menu-placeholder");
    const getSearchScroller = () => document.getElementById("search-placeholder");

    let lastFocusedElement = null;
    let lockedScrollY = 0;

    function markCurrentSurah() {
      if (!menuNav) return;

      menuNav.querySelectorAll('a[aria-current="page"]').forEach((a) => {
        a.removeAttribute("aria-current");
      });

      if (document.body?.dataset?.pageType === "mushaf") return;

      const currentSurah = document.body?.dataset?.surah;
      if (!currentSurah) return;
      
      const currentLink = menuNav.querySelector(`[data-surah="${currentSurah}"]`);
      if (currentLink) currentLink.setAttribute("aria-current", "page");
    }

    function getOverlayMode() {
      if (document.body.classList.contains("menu-open")) return "menu";
      if (document.body.classList.contains("search-open")) return "search";
      return "none";
    }

    function isOverlayOpen() {
      return getOverlayMode() !== "none";
    }

    function lockScroll() {
      lastFocusedElement = document.activeElement;

      lockedScrollY = window.scrollY;
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.classList.add("menu-open-lock");
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }

    function unlockScroll() {
      document.body.style.top = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.overflow = "";


      

      document.body.classList.remove("menu-open-lock");


      

      window.scrollTo(0, lockedScrollY);
      lockedScrollY = 0;

      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }

    function setButtonsOpenState(open) {
      menuButton.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));

      if (searchButton) {
        searchButton.classList.toggle("is-open", open && getOverlayMode() === "search");
        searchButton.setAttribute("aria-expanded", String(open && getOverlayMode() === "search"));
      }
    }

    function openOverlay(mode) {
      document.body.classList.remove("no-blur-transition");

      const current = getOverlayMode();
      if (current === mode) return;

      const wasOpen = isOverlayOpen();
      if (!wasOpen) lockScroll();

      document.body.classList.remove("menu-open", "search-open");
      document.body.classList.add(mode === "menu" ? "menu-open" : "search-open");

      setButtonsOpenState(true);

      requestAnimationFrame(() => {
        if (mode === "menu") {
          const menuScroller = getMenuScroller();
          if (menuScroller) menuScroller.scrollTop = 0;

          markCurrentSurah();
          

if (menuNav) {
  const currentLink = menuNav.querySelector('a[aria-current="page"]');
  (currentLink || menuNav.querySelector("a"))?.focus({ preventScroll: true });
}

          
          
} else {
  const searchScroller = getSearchScroller();
  if (searchScroller) searchScroller.scrollTop = 0;

const input = document.querySelector("#searchInput");
if (input) input.focus({ preventScroll: true });
}

        
      });
    }

    function closeOverlay() {
      if (!isOverlayOpen()) return;

      document.body.classList.add("no-blur-transition");

      const mode = getOverlayMode();
      const scroller = mode === "menu" ? getMenuScroller() : getSearchScroller();
      const frozenScrollTop = scroller ? scroller.scrollTop : 0;

      document.body.classList.add(mode === "menu" ? "menu-closing" : "search-closing");

      let rafId = 0;
      function keepScrollFrozen() {
        if (scroller) scroller.scrollTop = frozenScrollTop;
        rafId = requestAnimationFrame(keepScrollFrozen);
      }
      keepScrollFrozen();

      document.body.classList.remove("menu-open", "search-open");
      setButtonsOpenState(false);

      unlockScroll();

      window.setTimeout(() => {
        cancelAnimationFrame(rafId);
        document.body.classList.remove("menu-closing", "search-closing");

        requestAnimationFrame(() => {
          document.body.classList.remove("no-blur-transition");
        });
      }, 420);
    }

    menuButton.addEventListener("click", () => {
      isOverlayOpen() ? closeOverlay() : openOverlay("menu");
    });

    if (searchButton) {
      searchButton.addEventListener("click", () => {
        getOverlayMode() === "search" ? closeOverlay() : openOverlay("search");
      });
    }

    if (chooseSurahButton) {
      chooseSurahButton.addEventListener("click", (e) => {
        e.stopPropagation();

        if (getOverlayMode() !== "menu") {
          openOverlay("menu");
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOverlayOpen()) {
        closeOverlay();
      }
    });

    document.addEventListener("click", (e) => {
      if (!isOverlayOpen()) return;

      const clickedInsideHeader = header.contains(e.target);
      const clickedMenuButton = menuButton.contains(e.target);
      const clickedSearchButton = searchButton ? searchButton.contains(e.target) : false;
      const clickedChooseSurahButton = chooseSurahButton ? chooseSurahButton.contains(e.target) : false;

      if (
        !clickedInsideHeader &&
        !clickedMenuButton &&
        !clickedSearchButton &&
        !clickedChooseSurahButton
      ) {
        closeOverlay();
      }
    });

    markCurrentSurah();

    window.Wahyollah = window.Wahyollah || {};
    window.Wahyollah.markCurrentSurah = markCurrentSurah;
    window.Wahyollah.openOverlay = openOverlay;
    window.Wahyollah.closeOverlay = closeOverlay;
    window.Wahyollah.getOverlayMode = getOverlayMode;
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initMenu = initMenu;
})();
