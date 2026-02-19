window.Wahyollah = window.Wahyollah || {};

function initTheme() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  const saved = localStorage.getItem("theme");
  if (saved === "night") {
    document.body.classList.add("night-mode");
  } else {
    document.body.classList.remove("night-mode");
  }

  toggle.addEventListener("click", () => {
    const isNight = document.body.classList.toggle("night-mode");
    localStorage.setItem("theme", isNight ? "night" : "light");
  });

  requestAnimationFrame(() => {
    document.body.classList.add("theme-ready");
  });
}

window.Wahyollah.initTheme = initTheme;
