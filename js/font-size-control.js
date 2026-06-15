(function () {
  const STORAGE_KEY = "quranFontSize";
  const DEFAULT_SIZE = "normal";

  const pill = document.getElementById("fontSizePill");
  const trigger = document.getElementById("fontSizeTrigger");

  if (!pill || !trigger) return;

  const buttons = Array.from(
    pill.querySelectorAll("[data-font-size-option]")
  );

  let ignoreScrollClose = false;

  function setSize(size) {
    ignoreScrollClose = true;

    document.body.setAttribute("data-quran-font-size", size);
    try {
  localStorage.setItem(STORAGE_KEY, size);
} catch (e) {}

    buttons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.fontSizeOption === size
      );
    });

    window.setTimeout(function () {
      ignoreScrollClose = false;
    }, 400);
  }


function updateOpenWidth() {
  const autoScroll = document.querySelector(".auto-scroll-bar");
  if (!autoScroll) return;

  const pillRect = pill.getBoundingClientRect();
  const autoRect = autoScroll.getBoundingClientRect();

  const width = pillRect.right - autoRect.left;

  pill.style.setProperty("--font-size-open-width", `${width}px`);
}

  
function openMenu() {
  updateOpenWidth();

  pill.classList.add("is-open");
  document.body.classList.add("font-size-open");
  trigger.setAttribute("aria-expanded", "true");
}

  
function closeMenu() {
  pill.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");

  requestAnimationFrame(function () {
    document.body.classList.remove("font-size-open");
  });
}

  function toggleMenu() {
    if (pill.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  
let savedSize = DEFAULT_SIZE;

try {
  savedSize = localStorage.getItem(STORAGE_KEY) || DEFAULT_SIZE;
} catch (e) {}

setSize(savedSize);
  

trigger.addEventListener("click", function (event) {
  event.stopPropagation();

  document.querySelector(".auto-scroll-btn.is-on")?.click();

  requestAnimationFrame(function () {
    toggleMenu();
  });
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
      if (ignoreScrollClose) return;
      closeMenu();
    },
    { passive: true }
  );
})();
