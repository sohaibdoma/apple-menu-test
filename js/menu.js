    // 2️⃣ Now query elements (AFTER injection)
    const menuButton = document.querySelector('.menu-button');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuNav = document.getElementById('main-menu');

    let lastFocusedElement = null;

    function openMenu() {
  lastFocusedElement = document.activeElement;

  menuOverlay.classList.add('open');
  menuButton.classList.add('open');

  menuOverlay.setAttribute('aria-hidden', 'false');
  menuButton.setAttribute('aria-expanded', 'true');

  document.body.classList.add('menu-open');

  const firstLink = menuNav.querySelector('a');
  firstLink?.focus();
}

function closeMenu() {
  menuOverlay.classList.remove('open');
  menuButton.classList.remove('open');

  menuOverlay.setAttribute('aria-hidden', 'true');
  menuButton.setAttribute('aria-expanded', 'false');

  document.body.classList.remove('menu-open');

  lastFocusedElement?.focus();
}

    // Escape key closes menu
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Escape' &&
        menuButton.getAttribute('aria-expanded') === 'true'
      ) {
        closeMenu();
      }
    });

    // Click outside menu closes it
    menuOverlay.addEventListener('click', (e) => {
      if (e.target === menuOverlay) {
        closeMenu();
      }
    });

    // Toggle button
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });

    // Highlight current surah
    const currentSurah = document.body.dataset.surah;

    if (currentSurah) {
      const activeLink = menuNav.querySelector(
        `[data-surah="${currentSurah}"]`
      );
      activeLink?.setAttribute('aria-current', 'page');
    }
  })
  .catch((err) => {
    console.error('Failed to load menu.html', err);
  });
