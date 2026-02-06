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
