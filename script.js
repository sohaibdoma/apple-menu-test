/* ===============================
   Global Bootstrap Script
   =============================== */

document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('menu-placeholder');

  // If page has no menu placeholder, still init i18n for page content
  if (!placeholder) {
    if (window.initI18n) {
      window.initI18n();
    }
    return;
  }

  fetch('menu.html')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.text();
    })
    .then(html => {
      // Inject menu into DOM
      placeholder.innerHTML = html;

      // Init menu AFTER menu exists
      if (window.initMenu) {
        window.initMenu();
      }

      // Init language AFTER language buttons exist
      if (window.initI18n) {
        window.initI18n();
      }
    })
    .catch(err => {
      console.error('Failed to load menu.html:', err);

      // Even if menu fails, still init i18n so page content works
      if (window.initI18n) {
        window.initI18n();
      }
    });
});
