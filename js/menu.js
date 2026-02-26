(function () {
  "use strict";

  function initMenu() {
    const menuButton = document.querySelector(".menu-button");
    const menuNav = document.getElementById("main-menu");
    const header = document.querySelector(".main-header");

    if (!menuButton || !menuNav || !header) {
      console.warn("Menu elements not found");
      return;
    }

    const getMenuScroller = () => document.getElementById("menu-placeholder");

    let lastFocusedElement = null;
    let lockedScrollY = 0;

    function markCurrentSurah() {
      menuNav.querySelectorAll('a[aria-current="page"]').forEach((a) => {
        a.removeAttribute("aria-current");
      });

      const currentSurah = document.body?.dataset?.surah;
      if (!currentSurah) return;

      const currentLink = menuNav.querySelector(`[data-surah="${currentSurah}"]`);
      if (currentLink) currentLink.setAttribute("aria-current", "page");
    }

    function isMenuOpen() {
      return menuButton.getAttribute("aria-expanded") === "true";
    }

    function openMenu() {
      document.body.classList.remove("no-blur-transition");

      lastFocusedElement = document.activeElement;

      lockedScrollY = window.scrollY;
      document.body.style.top = `-${lockedScrollY}px`;

      menuButton.classList.add("open");
      menuButton.setAttribute("aria-expanded", "true");

      document.body.classList.add("menu-open");

      const menuScroller = getMenuScroller();

      requestAnimationFrame(() => {
        if (menuScroller) menuScroller.scrollTop = 0;

        markCurrentSurah();

        const current = menuNav.querySelector('a[aria-current="page"]');
        (current || menuNav.querySelector("a"))?.focus({ preventScroll: true });
      });
    }

    function closeMenu() {
      document.body.classList.add("no-blur-transition");

      const menuScroller = getMenuScroller();
      const frozenScrollTop = menuScroller ? menuScroller.scrollTop : 0;

      document.body.classList.add("menu-closing");

      let rafId = 0;
      function keepScrollFrozen() {
        if (menuScroller) menuScroller.scrollTop = frozenScrollTop;
        rafId = requestAnimationFrame(keepScrollFrozen);
      }
      keepScrollFrozen();

      menuButton.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");

      document.body.style.top = "";
      document.body.classList.remove("menu-open");

      window.scrollTo(0, lockedScrollY);
      lockedScrollY = 0;

      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }

      // Match your header transition (~350ms)
      window.setTimeout(() => {
        cancelAnimationFrame(rafId);
        document.body.classList.remove("menu-closing");

        requestAnimationFrame(() => {
          document.body.classList.remove("no-blur-transition");
        });
      }, 420);
    }

    menuButton.addEventListener("click", () => {
      isMenuOpen() ? closeMenu() : openMenu();
    });

    menuNav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) {
        closeMenu();
      }
    });

    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;

      const clickedInsideHeader = header.contains(e.target);
      const clickedMenuButton = menuButton.contains(e.target);

      if (!clickedInsideHeader && !clickedMenuButton) {
        closeMenu();
      }
    });

    markCurrentSurah();

    window.Wahyollah = window.Wahyollah || {};
    window.Wahyollah.markCurrentSurah = markCurrentSurah;
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initMenu = initMenu;
})();
