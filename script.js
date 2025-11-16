const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");
const container = document.querySelector(".container");

menuBtn.addEventListener("click", () => {
  const isOpen = menuPanel.classList.toggle("open");
  menuBtn.classList.toggle("active", isOpen);
  container.classList.toggle("menu-open", isOpen);
});
