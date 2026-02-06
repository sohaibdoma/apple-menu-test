/* ===============================
   Global Bootstrap Script
   =============================== */

const placeholder = document.getElementById('menu-placeholder');

// If page has NO menu placeholder → init i18n only
if (!placeholder) {
  if (window.initI18n) {
    window.initI18n();
  }
} else {
  fetch('menu.html')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(html => {
      // Inject menu
      placeholder.innerHTML = html;

      // Init menu AFTER it exists
      if (window.initMenu) {
        window.initMenu();
      }

      // Init i18n AFTER language buttons exist
      if (window.initI18n) {
        window.initI18n();
      }
    })
    .catch(err => {
      console.error('Failed to load menu.html:', err);

      // Even if menu fails, page language still works
      if (window.initI18n) {
        window.initI18n();
      }
    });
}
