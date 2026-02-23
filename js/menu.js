function initMenu() {
  const menuButton = document.querySelector(".menu-button");
  const headerShell = document.querySelector(".main-header");
  const menuNav = document.getElementById("main-menu");

  if (!menuButton || !headerShell || !menuNav) {
    console.warn("Menu elements not found");
    return;
  }

  let lastFocusedElement = null;
  let lockedScrollY = 0;

  function syncHeaderHeight() {
    if (document.body.classList.contains("menu-open")) return;
    document.documentElement.style.setProperty("--header-h", `${headerShell.offsetHeight}px`);
  }

  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);

  function openMenu() {
    syncHeaderHeight();
    lastFocusedElement = document.activeElement;

    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.classList.add("menu-open");

    menuButton.classList.add("open");
    menuButton.setAttribute("aria-expanded", "true");

    menuNav.setAttribute("aria-hidden", "false");
    menuNav.querySelector("a")?.focus();
  }

  function closeMenu() {
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");

    document.body.classList.remove("menu-open");
    document.body.style.top = "";
    window.scrollTo(0, lockedScrollY);
    lockedScrollY = 0;

    menuNav.setAttribute("aria-hidden", "true");
    lastFocusedElement?.focus();

    syncHeaderHeight();
  }

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  document.addEventListener("click", (e) => {
    if (menuButton.getAttribute("aria-expanded") !== "true") return;
    if (!headerShell.contains(e.target)) closeMenu();
  });

  function markCurrentSurah() {
    const currentSurah = document.body.dataset.surah;
    if (!currentSurah) return;

    menuNav
      .querySelector(`[data-surah="${currentSurah}"]`)
      ?.setAttribute("aria-current", "page");
  }

  markCurrentSurah();

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.markCurrentSurah = markCurrentSurah;
}

window.Wahyollah = window.Wahyollah || {};
window.Wahyollah.initMenu = initMenu;
