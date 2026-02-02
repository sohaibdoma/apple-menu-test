const menuButton = document.querySelector('.menu-button');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('.menu-overlay a');

// Toggle menu (≡ ↔ X)
function toggleMenu() {
  menuButton.classList.toggle('open');
  menuOverlay.classList.toggle('open');
}

// Close menu (force close)
function closeMenu() {
  menuButton.classList.remove('open');
  menuOverlay.classList.remove('open');
}

// Menu button click
menuButton.addEventListener('click', toggleMenu);

// Menu item clicks behave EXACTLY like clicking X
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});
