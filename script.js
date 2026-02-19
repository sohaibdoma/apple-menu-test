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
   
  // 🌙 Apply saved theme on page load
if (localStorage.getItem("theme") === "night") {
  document.body.classList.add("night-mode");
}

// 🌙 Night Mode Toggle
const toggle = document.getElementById("themeToggle");

if (toggle) {
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("night-mode");

    if (document.body.classList.contains("night-mode")) {
      localStorage.setItem("theme", "night");
    } else {
      localStorage.setItem("theme", "light");
    }
  });
}

}

const placeholder = document.getElementById('menu-placeholder');

if (placeholder) {
  fetch('components/menu.html')
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
