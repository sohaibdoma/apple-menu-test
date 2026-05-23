(function () {
  const STORAGE_KEY = "quranFontSize";
  const DEFAULT_SIZE = "normal";

  const pill = document.getElementById("fontSizePill");
  const trigger = document.getElementById("fontSizeTrigger");

  if (!pill || !trigger) return;

  const buttons = Array.from(
    pill.querySelectorAll("[data-font-size-option]")
  );

  function setSize(size) {
    document.body.setAttribute("data-quran-font-size", size);
    localStorage.setItem(STORAGE_KEY, size);

    buttons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.fontSizeOption === size
      );
    });
  }

  function openMenu() {
    pill.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    pill.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (pill.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  const savedSize = localStorage.getItem(STORAGE_KEY) || DEFAULT_SIZE;
  setSize(savedSize);

  trigger.addEventListener("click", function (event) {
    event.stopPropagation();
    toggleMenu();
  });

  buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      setSize(button.dataset.fontSizeOption);
    });
  });

  document.addEventListener("click", function (event) {
    if (!pill.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener(
    "scroll",
    function () {
      closeMenu();
    },
    { passive: true }
  );
})();
