const menuButton = document.querySelector('.menu-button');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('.menu-overlay a');

// ONE source of truth
function toggleMenu() {
  menuButton.classList.toggle('open');
  menuOverlay.classList.toggle('open');
}

// Menu button
menuButton.addEventListener('click', toggleMenu);

// Menu links behave EXACTLY like clicking the button
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    toggleMenu();
  });
});
// Load shared menu
fetch('/menu.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('menu-placeholder').innerHTML = html;

    const menuButton = document.querySelector('.menu-button');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-overlay a');

    function toggleMenu() {
      menuButton.classList.toggle('open');
      menuOverlay.classList.toggle('open');
    }

    menuButton.addEventListener('click', toggleMenu);

    menuLinks.forEach(link => {
      link.addEventListener('click', toggleMenu);
    });
  });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
    toggleMenu();
  }
});

