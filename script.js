const menuButton = document.querySelector('.menu-button');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('.menu-overlay a');

menuButton.addEventListener('click', () => {
  menuButton.classList.toggle('open');
  menuOverlay.classList.toggle('open');
});

// Close menu when a menu link is clicked
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    menuButton.classList.remove('open');
    menuOverlay.classList.remove('open');
  });
});
