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
      // Clear any previous aria-current
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

      // Wait a frame so layout/height changes are applied before touching scroll/focus
      requestAnimationFrame(() => {
        // Always start from the top
        if (menuScroller) menuScroller.scrollTop = 0;

        // Highlight current page in the list (no auto-centering)
        markCurrentSurah();

        // Focus current item (without scrolling) or fallback to first item
        const current = menuNav.querySelector('a[aria-current="page"]');
        (current || menuNav.querySelector("a"))?.focus({ preventScroll: true });
      });
    }

    function closeMenu() {
      // Make blur removal instant (no transition on close)
      document.body.classList.add("no-blur-transition");

      menuButton.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");

      document.body.style.top = "";
      document.body.classList.remove("menu-open");

      window.scrollTo(0, lockedScrollY);
      lockedScrollY = 0;

      // Restore focus to whatever was focused before opening
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }

      // Restore smooth transitions for the next open
      requestAnimationFrame(() => {
        document.body.classList.remove("no-blur-transition");
      });
    }

    // Toggle on button click
    menuButton.addEventListener("click", () => {
      isMenuOpen() ? closeMenu() : openMenu();
    });

    // Do nothing on menu link click (navigation will happen)
    menuNav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      // intentionally empty
    });

    // ESC closes menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) {
        closeMenu();
      }
    });

    // Click outside closes menu
    document.addEventListener("click", (e) => {
      if (!isMenuOpen()) return;

      const clickedInsideHeader = header.contains(e.target);
      const clickedMenuButton = menuButton.contains(e.target);

      if (!clickedInsideHeader && !clickedMenuButton) {
        closeMenu();
      }
    });

    // Mark current on load (useful before first open)
    markCurrentSurah();

    // Expose helpers (matches your existing pattern)
    window.Wahyollah = window.Wahyollah || {};
    window.Wahyollah.markCurrentSurah = markCurrentSurah;
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initMenu = initMenu;
})();
