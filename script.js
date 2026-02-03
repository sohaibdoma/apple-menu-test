// Load shared menu (base-aware, works everywhere)
fetch('menu.html')
  .then(res => {
    if (!res.ok) throw new Error('Menu not found');
    return res.text();
  })
  .then(html => {
    const placeholder = document.getElementById('menu-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = html;

    const menuButton = document.querySelector('.menu-button');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-overlay a');

    function toggleMenu() {
      menuButton.classList.toggle('open');
      menuOverlay.classList.toggle('open');
      document.body.classList.toggle('menu-open');
      menuOverlay.setAttribute(
        'aria-hidden',
        menuOverlay.classList.contains('open') ? 'false' : 'true'
      );
    }

    menuButton.addEventListener('click', toggleMenu);
    menuLinks.forEach(link => link.addEventListener('click', toggleMenu));
  })
  .catch(err => console.error('Menu load failed:', err));
