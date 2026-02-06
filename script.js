fetch('menu.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('menu-placeholder').innerHTML = html;

    // 🔹 Menu is now in the DOM → load menu logic
    const menuScript = document.createElement('script');
    menuScript.src = 'js/menu.js';
    document.body.appendChild(menuScript);

    // 🔹 Language buttons now exist → init i18n
    if (window.initI18n) {
      window.initI18n();
    }
  })
  .catch(err => {
    console.error('Failed to load menu.html', err);
  });
