window.addEventListener("error", (e) => {
  console.error("Global Error:", e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled Promise Rejection:", e.reason);
});


/* ===============================
   Global Bootstrap Script
   =============================== */

function bootstrapApp() {
// Init modules from a single global namespace (cleaner than many window.* globals)
const App = window.Wahyollah;

  if (App?.initMenu) {
    App.initMenu();
  }

  if (App?.initI18n) {
    App.initI18n();
  }
   
  if (App?.initTheme) {
    App.initTheme();
  }

    /* Auto Scroll (Surah pages only) */
  if (App?.initAutoScroll) {
    App.initAutoScroll();
  }

}

const placeholder = document.getElementById('menu-placeholder');

if (placeholder) {
  const menuUrl = window.Wahyollah?.config?.menuPath || 'components/menu.html';
fetch(menuUrl)

    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(html => {
      placeholder.innerHTML = html;

      // DOM is now COMPLETE
      bootstrapApp();
    })
    .catch(err => {
      console.error('Failed to load menu.html:', err);
      bootstrapApp();
    });
} else {
  // Pages without menu
  bootstrapApp();
}
