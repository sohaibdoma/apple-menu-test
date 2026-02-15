/* ===============================
   Global Bootstrap Script
   =============================== */

function bootstrapApp() {
  // Init menu AFTER it exists
  if (window.initMenu) {
    window.initMenu();
  }

  // Init i18n ONCE, after DOM is final
  if (window.initI18n) {
    window.initI18n();
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
  fetch('menu.html')
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
