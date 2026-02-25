function initMenu() {
  const menuButton = document.querySelector(".menu-button");
  const menuNav = document.getElementById("main-menu");

  if (!menuButton || !menuNav) {
    console.warn("Menu elements not found");
    return;
  }

  const header = document.querySelector(".main-header");

  let lastFocusedElement = null;
  let lockedScrollY = 0;



function openMenu() {
  document.body.classList.remove("no-blur-transition");

  lastFocusedElement = document.activeElement;

  lockedScrollY = window.scrollY;
  document.body.style.top = `-${lockedScrollY}px`;

  menuButton.classList.add("open");
  menuButton.setAttribute("aria-expanded", "true");

  document.body.classList.add("menu-open");

  // 1) Ensure current surah is marked (aria-current="page")
  markCurrentSurah();

  // 2) Scroll the current surah into the middle of the menu
  const current = menuNav.querySelector('a[aria-current="page"]');
  if (current) {
    // Wait 1 frame so layout/height changes apply before scrolling
    requestAnimationFrame(() => {
      current.scrollIntoView({ block: "center", inline: "nearest" });
      current.focus({ preventScroll: true });
    });
  } else {
    // fallback: focus first item
    menuNav.querySelector("a")?.focus();
  }
}

  

  function closeMenu() {
    // make blur removal instant (no transition on close)
    document.body.classList.add("no-blur-transition");

    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");

    document.body.style.top = "";
    document.body.classList.remove("menu-open");

    window.scrollTo(0, lockedScrollY);
    lockedScrollY = 0;

    lastFocusedElement?.focus();

    // restore smooth transitions for next open
    requestAnimationFrame(() => {
      document.body.classList.remove("no-blur-transition");
    });
  }

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  menuNav.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // Do nothing on menu item click.
    // The browser will navigate to the next page, and closing animation looks bad.
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  document.addEventListener("click", (e) => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;

    if (!header) return;

    const clickedInsideHeader = header.contains(e.target);
    const clickedMenuButton = menuButton.contains(e.target);

    if (!clickedInsideHeader && !clickedMenuButton) {
      closeMenu();
    }
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
