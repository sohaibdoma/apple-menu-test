const menuButton = document.querySelector('.menu-button');
const menuOverlay = document.querySelector('.menu-overlay');
const menuNav = document.getElementById('main-menu');

let lastFocusedElement = null;

function openMenu() {
  lastFocusedElement = document.activeElement;

  menuOverlay.setAttribute('aria-hidden', 'false');
  menuButton.setAttribute('aria-expanded', 'true');

  const firstLink = menuNav.querySelector('a');
  firstLink?.focus();

  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOverlay.setAttribute('aria-hidden', 'true');
  menuButton.setAttribute('aria-expanded', 'false');

  lastFocusedElement?.focus();

  document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'Escape' &&
    menuButton.getAttribute('aria-expanded') === 'true'
  ) {
    closeMenu();
  }
});
menuOverlay.addEventListener('click', (e) => {
  if (e.target === menuOverlay) {
    closeMenu();
  }
});

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});
const currentSurah = document.body.dataset.surah;

if (currentSurah) {
  const activeLink = menuNav.querySelector(
    `[data-surah="${currentSurah}"]`
  );
  activeLink?.setAttribute('aria-current', 'page');
}
