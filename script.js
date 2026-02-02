const menuButton = document.querySelector('.menu-button');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('.menu-overlay a');

// Toggle menu (≡ ↔ X)
function toggleMenu() {
  const isOpen = menuOverlay.classList.toggle('open');

  menuButton.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
}


// Close menu (force close)
function closeMenu() {
  menuButton.classList.remove('open');
  menuOverlay.classList.remove('open');
  document.body.classList.remove('menu-open');
}


// Menu button click
menuButton.addEventListener('click', toggleMenu);

// Menu item clicks behave EXACTLY like clicking X
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMenu();
  });
});
