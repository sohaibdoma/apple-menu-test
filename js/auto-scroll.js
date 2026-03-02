(function () {
  "use strict";

  function initAutoScroll() {
    // Only run on pages that have the surah container
    const surahRoot = document.querySelector(".surah-container");
    if (!surahRoot) return;

    // Button (we’ll add it in surah.html)
    const btn = document.getElementById("autoScrollBtn");
    if (!btn) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    let isOn = false;
    let rafId = 0;

    // Speed (px per second). Adjust ONE number if you want slower/faster.
    const SPEED = prefersReduced ? 0 : 55;

    let lastT = 0;

    function setUi() {
      btn.setAttribute("aria-pressed", String(isOn));
      btn.textContent = isOn ? "Pause" : "Auto";
    }

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
      const dt = (t - lastT) / 1000; // seconds
      lastT = t;

      // Scroll down
      window.scrollBy(0, SPEED * dt);

      // Stop automatically at bottom
      const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 2);
      if (atBottom) {
        stop();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (prefersReduced) return; // no auto scroll for reduced motion users
      if (isOn) return;
      isOn = true;
      setUi();
      rafId = requestAnimationFrame(tick);
    }

    function toggle() {
      isOn ? stop() : start();
    }

    // Stop on user intent (very important for “premium feel”)
    const stopEvents = ["wheel", "touchstart", "keydown", "mousedown"];
    const stopHandler = () => stop();
    stopEvents.forEach((ev) => window.addEventListener(ev, stopHandler, { passive: true }));

    btn.addEventListener("click", toggle);

    setUi();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initAutoScroll = initAutoScroll;
})();
