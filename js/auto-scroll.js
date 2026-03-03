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

    // Smooth low-speed support:
    // keep our own float scroll position and ALWAYS reset it on start
    let scrollYFloat = 0;

    // Change this number freely (7, 10, 15...)
    const SPEED = prefersReduced ? 0 : 7;

    /* ===============================
       UI State (CSS handles icon)
    =============================== */
    function setUi() {
      btn.setAttribute("aria-pressed", String(isOn));
      btn.classList.toggle("is-on", isOn);
      btn.setAttribute(
        "aria-label",
        isOn ? "Pause auto scroll" : "Start auto scroll"
      );
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

      scrollYFloat += SPEED * dt;
      window.scrollTo(0, scrollYFloat);

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

      // ✅ Always start from wherever the user is NOW (after manual scroll)
      scrollYFloat = window.scrollY;
      lastT = 0;

      isOn = true;
      setUi();
      rafId = requestAnimationFrame(tick);
    }

    function toggle() {
      isOn ? stop() : start();
    }

    /* ===============================
       Video-like behavior
       - Do NOT stop on scroll / touch / keys
       - Pause when tab is hidden (like video)
    =============================== */
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });

    /* ===============================
       Init
    =============================== */
    btn.addEventListener("click", toggle);

    // Ensure initial UI state is correct
    setUi();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initAutoScroll = initAutoScroll;
})();
