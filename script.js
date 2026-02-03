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
    // Inject menu HTML into placeholder
    document.getElementById('menu-placeholder').innerHTML = html;

    // Now the menu elements exist → bind functionality
    const menuButton = document.querySelector('.menu-button');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-overlay a');

    function toggleMenu() {
      menuButton.classList.toggle('open');
      menuOverlay.classList.toggle('open');
      document.body.classList.toggle('menu-open'); // optional: locks scrolling
      menuOverlay.setAttribute(
        'aria-hidden',
        menuOverlay.classList.contains('open') ? 'false' : 'true'
      );
    }

    // Menu button toggles menu
    menuButton.addEventListener('click', toggleMenu);

    // Menu links close menu when clicked
    menuLinks.forEach(link => link.addEventListener('click', toggleMenu));
  })
  .catch(err => console.error('Failed to load menu.html:', err));
