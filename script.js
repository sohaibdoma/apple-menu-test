fetch('menu.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('menu-placeholder').innerHTML = html;

    // Init menu AFTER it exists
    if (window.initMenu) {
      window.initMenu();
    }

    // Init language AFTER menu buttons exist
    if (window.initI18n) {
      window.initI18n();
    }
  })
  .catch(err => {
    console.error('Failed to load menu.html', err);
  });
