window.Wahyollah = window.Wahyollah || {};

function initTheme() {
  const saved = localStorage.getItem("theme");

  if (saved === "night") {
    document.body.classList.add("night-mode");
  }

  const toggle = document.getElementById("themeToggle");

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const isNight = document.body.classList.toggle("night-mode");

    localStorage.setItem("theme", isNight ? "night" : "light");
  });
}

window.Wahyollah.initTheme = initTheme;
