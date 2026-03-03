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
    let isPausedByAyah = false;

    let rafId = 0;
    let lastT = 0;

    // Float scroll position (allows slow speeds without “pausing”)
    let scrollYFloat = 0;

    // You can set this to 7 / 10 / 15 etc
    const SPEED = prefersReduced ? 0 : 10;

    // Prevent our own scrollTo from being treated as “user scroll”
    let programmaticScroll = false;

    /* ===============================
       UI State
    =============================== */
    function setUi() {
      btn.setAttribute("aria-pressed", String(isOn));
      btn.classList.toggle("is-on", isOn);

      // If you want, you can later show a paused style in CSS using .is-paused
      btn.classList.toggle("is-paused", isOn && isPausedByAyah);

      btn.setAttribute(
        "aria-label",
        isOn ? (isPausedByAyah ? "Resume auto scroll" : "Pause auto scroll") : "Start auto scroll"
      );
    }

    /* ===============================
       Core
    =============================== */
    function stopAll() {
      // true “OFF”
      isOn = false;
      isPausedByAyah = false;

      cancelAnimationFrame(rafId);
      rafId = 0;
      lastT = 0;

      setUi();
    }

    function pauseByAyah() {
      if (!isOn || isPausedByAyah) return;

      isPausedByAyah = true;
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastT = 0;

      setUi();
    }

    function resumeFromAyah() {
      if (!isOn || !isPausedByAyah) return;

      // Resume from CURRENT user position
      scrollYFloat = window.scrollY;
      lastT = 0;
      isPausedByAyah = false;

      setUi();
      rafId = requestAnimationFrame(tick);
    }

    function tick(t) {
      if (!isOn || isPausedByAyah) return;

      if (!lastT) lastT = t;
      const dt = (t - lastT) / 1000;
      lastT = t;

      scrollYFloat += SPEED * dt;

      programmaticScroll = true;
      window.scrollTo(0, scrollYFloat);
      programmaticScroll = false;

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        stopAll();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (prefersReduced || isOn) return;

      // Always start from wherever user currently is
      scrollYFloat = window.scrollY;
      lastT = 0;

      isOn = true;
      isPausedByAyah = false;

      setUi();
      rafId = requestAnimationFrame(tick);
    }

    function toggleButton() {
      // Button is the only thing that truly turns it ON/OFF
      isOn ? stopAll() : start();
    }

    /* ===============================
       Behaviors you requested
    =============================== */

    // (1) User scroll should NOT stop auto-scroll, and should NOT be blocked.
    //     We simply “follow” the user by updating the float baseline.
    window.addEventListener(
      "scroll",
      () => {
        if (!isOn || isPausedByAyah) return;
        if (programmaticScroll) return;

        // User scrolled manually -> continue auto from here
        scrollYFloat = window.scrollY;
        lastT = 0;
      },
      { passive: true }
    );

    // (2) Clicking an ayah toggles pause/resume
    surahRoot.addEventListener("click", (e) => {
      const ayah = e.target.closest?.(".ayah");
      if (!ayah) return;

      if (!isOn) return; // only toggle pause when auto mode is ON
      isPausedByAyah ? resumeFromAyah() : pauseByAyah();
    });

    // Stop when menu button is clicked
    const menuBtn = document.querySelector(".menu-toggle");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        if (isOn) stopAll();
      });
    }

    // Stop when page is exited/hidden (video-like)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isOn) stopAll();
    });

    window.addEventListener("beforeunload", () => {
      if (isOn) stopAll();
    });

    /* ===============================
       Init
    =============================== */
    btn.addEventListener("click", toggleButton);
    setUi();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initAutoScroll = initAutoScroll;
})();
