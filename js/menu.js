function initMenu() {
  const menuButton = document.querySelector('.menu-button');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuNav = document.getElementById('menu-placeholder');

  if (!menuButton || !menuOverlay || !menuNav) {
    console.warn('Menu elements not found');
    return;
  }
  
  let lastFocusedElement = null;

  function openMenu() {
    lastFocusedElement = document.activeElement;

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

    document.body.classList.remove('menu-open');

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

  const currentSurah = document.body.dataset.surah;
  if (currentSurah) {
    menuNav
      .querySelector(`[data-surah="${currentSurah}"]`)
      ?.setAttribute('aria-current', 'page');
  }
}

// expose globally
window.initMenu = initMenu;
