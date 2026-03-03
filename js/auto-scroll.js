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
    const SPEED = prefersReduced ? 0 : 25;

    /* ===============================
       UI State (CSS handles icon easing)
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
       (but NOT when clicking the auto button itself)
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

    // Ensure initial UI state is correct (prevents 1-frame mismatch)
    setUi();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initAutoScroll = initAutoScroll;
})();
