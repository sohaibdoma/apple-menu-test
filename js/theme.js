window.Wahyollah = window.Wahyollah || {};

function applyTheme(isNight) {
  document.documentElement.classList.toggle("night-mode", isNight);
  document.body.classList.toggle("night-mode", isNight);

  try {
    localStorage.setItem("theme", isNight ? "night" : "light");
  } catch (e) {}
}

function initTheme() {
  let saved = "";

try {
  saved = localStorage.getItem("theme") || "";
} catch (e) {}
  
  applyTheme(saved === "night");

  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isNight = !document.body.classList.contains("night-mode");
      applyTheme(isNight);
    });
  }

  requestAnimationFrame(() => {
    document.documentElement.classList.add("theme-ready");
    document.body.classList.add("theme-ready");
  });
}

window.Wahyollah.initTheme = initTheme;
