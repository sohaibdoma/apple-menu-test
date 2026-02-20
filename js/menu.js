function initMenu() {
  const menuButton = document.querySelector('.menu-button');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuNav = document.getElementById('main-menu');

  if (!menuButton || !menuOverlay || !menuNav) {
    console.warn('Menu elements not found');
    return;
  }
  
  let lastFocusedElement = null;
  let lockedScrollY = 0;

  function openMenu() {
    lastFocusedElement = document.activeElement;

    lockedScrollY = window.scrollY;
    document.body.style.top = `-${lockedScrollY}px`;

    menuOverlay.classList.add('open');
    menuButton.classList.add('open');

    menuOverlay.setAttribute('aria-hidden', 'false');
    menuButton.setAttribute('aria-expanded', 'true');

    document.body.classList.add('menu-open');

    menuNav.querySelector('a')?.focus();
  }

  function closeMenu() {
    menuOverlay.classList.remove('open');
    menuButton.classList.remove('open');

    menuOverlay.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');

    document.body.style.top = '';
    document.body.classList.remove('menu-open');
    window.scrollTo(0, lockedScrollY);
    lockedScrollY = 0;

    lastFocusedElement?.focus();
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  menuOverlay.addEventListener('click', e => {
    if (e.target === menuOverlay) closeMenu();
  });

menuOverlay.addEventListener('scroll', () => {
  if (menuOverlay.scrollTop <= 0) {
    menuOverlay.scrollTop = 1;
  }

  const maxScrollTop =
    menuOverlay.scrollHeight - menuOverlay.clientHeight - 1;

  if (menuOverlay.scrollTop >= maxScrollTop) {
    menuOverlay.scrollTop = maxScrollTop;
  }
}, { passive: true });
  
function markCurrentSurah(menuNav) {
  const currentSurah = document.body.dataset.surah;
  if (!currentSurah) return;

  menuNav
    .querySelector(`[data-surah="${currentSurah}"]`)
    ?.setAttribute("aria-current", "page");
}

markCurrentSurah(menuNav);

window.Wahyollah = window.Wahyollah || {};
window.Wahyollah.markCurrentSurah = () => markCurrentSurah(menuNav);
  
}

// expose globally
window.Wahyollah = window.Wahyollah || {};
window.Wahyollah.initMenu = initMenu;
