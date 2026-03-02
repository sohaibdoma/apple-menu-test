(function () {
  "use strict";

  function initAutoScroll() {
    const surahRoot = document.querySelector(".surah-container");
    if (!surahRoot) return;

    const btn = document.getElementById("autoScrollBtn");
    if (!btn) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let isOn = false;
    let rafId = 0;
    let lastT = 0;

    // Adjust this single number if you want different speed
    const SPEED = prefersReduced ? 0 : 55;

    /* ===============================
       SVG "Stem + One Chevron" helper
       - Only the chevron morphs (book-open style)
       - Vertical stem stays static
    =============================== */
    function playChev(open) {
      const svg = btn.querySelector("svg");
      if (!svg) return;

      const anim = svg.querySelector(open ? "#chevOpen" : "#chevClose");
      if (anim && typeof anim.beginElement === "function") {
        anim.beginElement();
      }
    }

    /* ===============================
       UI State
    =============================== */
    function setUi() {
      btn.setAttribute("aria-pressed", String(isOn));
      btn.classList.toggle("is-on", isOn);
      btn.setAttribute(
        "aria-label",
        isOn ? "Pause auto scroll" : "Start auto scroll"
      );

      // Trigger chevron morph only
      playChev(isOn);
    }

    /* ===============================
       Core Logic
    =============================== */
    function stop() {
      if (!isOn) return;
      isOn = false;
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastT = 0;
      setUi();
    }

    function tick(t) {
      if (!isOn) return;

      if (!lastT) lastT = t;
      const dt = (t - lastT) / 1000;
      lastT = t;

      window.scrollBy(0, SPEED * dt);

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        stop();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (prefersReduced || isOn) return;
      isOn = true;
      setUi();
      rafId = requestAnimationFrame(tick);
    }

    function toggle() {
      isOn ? stop() : start();
    }

    /* ===============================
       Stop on User Intent
    =============================== */
    const stopEvents = ["wheel", "touchstart", "keydown", "mousedown"];

    function stopHandler(e) {
      if (e?.target?.closest?.("#autoScrollBtn")) return;
      stop();
    }

    stopEvents.forEach((ev) =>
      window.addEventListener(ev, stopHandler, { passive: true })
    );

    // Stop if user switches tab (premium polish)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });

    /* ===============================
       Init
    =============================== */
    btn.addEventListener("click", toggle);

    // Set initial state (ensures SVG is in correct mode)
    setUi();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initAutoScroll = initAutoScroll;
})();
