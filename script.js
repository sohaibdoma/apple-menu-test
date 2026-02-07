/* ===============================
   Global Bootstrap Script
   =============================== */

function bootstrapApp() {
  // Init menu behavior if menu exists
  if (window.initI18n) {
  window.initI18n();
}

  // Init language system ONCE, after DOM is final
  if (window.initI18n) {
    window.initI18n();
  }
}

const placeholder = document.getElementById('menu-placeholder');

// If page has a menu placeholder, load menu first
if (placeholder) {
  fetch('menu.html')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(html => {
      // Inject menu HTML
      placeholder.innerHTML = html;

      // Now the DOM is COMPLETE
      bootstrapApp();
    })
    .catch(err => {
      console.error('Failed to load menu.html:', err);

      // Even if menu fails, continue safely
      bootstrapApp();
    });
} else {
  // No menu on this page → DOM already complete
  bootstrapApp();
}
