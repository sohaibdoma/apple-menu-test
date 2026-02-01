const menuButton = document.querySelector(".menu-button");
const menuOverlay = document.querySelector(".menu-overlay");

menuButton.addEventListener("click", () => {
  const isOpen = menuOverlay.classList.toggle("open");

  menuButton.classList.toggle("open", isOpen);
  menuOverlay.setAttribute("aria-hidden", !isOpen);

  document.body.style.overflow = isOpen ? "hidden" : "";
});
