(function () {
  "use strict";

  function initAutoScroll() {
    const surahRoot = document.querySelector(".surah-container");
    if (!surahRoot) return;

    const btn = document.getElementById("autoScrollBtn");
    if (!btn) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // =========================
    // STATE
    // =========================
    let isOn = false;                 // TRUE ON/OFF (only auto button or menu/page exit changes this)
    let isPausedByTap = false;        // temporary pause/resume by tapping the page
    let isPausedByOverlay = false;    // temporary pause while notification overlay is open

    let rafId = 0;
    let lastT = 0;
    let scrollYFloat = 0;             // float scroll position for smooth slow speeds
    let programmaticScroll = false;

    // Set speed here (7 / 10 / 15 etc.)
    const SPEED = prefersReduced ? 0 : 10;

    // =========================
    // WAKE LOCK (Stop screen timeout)
    // =========================
    let wakeLock = null;

    async function requestWakeLock() {
      // Only when ON
      if (!isOn) return;

      // Wake Lock API (works on many mobile browsers, not all)
      if (!("wakeLock" in navigator) || typeof navigator.wakeLock?.request !== "function") {
        return;
      }

      try {
        // Release old lock if any
        if (wakeLock) {
          try { await wakeLock.release(); } catch (_) {}
          wakeLock = null;
        }

        wakeLock = await navigator.wakeLock.request("screen");

        // If the lock is released by the system, keep our state consistent
        wakeLock.addEventListener("release", () => {
          wakeLock = null;
        });
      } catch (_) {
        // If it fails (permissions / not supported), we just ignore safely.
        wakeLock = null;
      }
    }

    async function releaseWakeLock() {
      if (!wakeLock) return;
      try {
        await wakeLock.release();
      } catch (_) {}
      wakeLock = null;
    }

    // Re-acquire wake lock after returning to the tab (common Wake Lock behavior)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      if (isOn) requestWakeLock();
    });

    // =========================
    // UI
    // =========================
    function setUi() {
      btn.setAttribute("aria-pressed", String(isOn));
      btn.classList.toggle("is-on", isOn);

      // Optional: if you ever want a visual paused state in CSS
      btn.classList.toggle("is-paused", isOn && (isPausedByTap || isPausedByOverlay));

      btn.setAttribute(
        "aria-label",
        isOn ? "Pause auto scroll" : "Start auto scroll"
      );
    }

    // =========================
    // CORE
    // =========================
    function stopAll() {
      // TRUE OFF
      isOn = false;
      isPausedByTap = false;
      isPausedByOverlay = false;

      cancelAnimationFrame(rafId);
      rafId = 0;
      lastT = 0;

      setUi();
      releaseWakeLock();
    }

    function pauseForTap() {
      if (!isOn || isPausedByTap) return;
      isPausedByTap = true;

      cancelAnimationFrame(rafId);
      rafId = 0;
      lastT = 0;

      setUi();
      // Keep Wake Lock ON while paused (video behavior)
      requestWakeLock();
    }

    function resumeFromTap() {
      if (!isOn || !isPausedByTap) return;

      isPausedByTap = false;

      // Only resume if overlay is not active
      if (!isPausedByOverlay) {
        scrollYFloat = window.scrollY;
        lastT = 0;
        rafId = requestAnimationFrame(tick);
      }

      setUi();
      requestWakeLock();
    }

    function pauseForOverlay() {
      if (!isOn || isPausedByOverlay) return;
      isPausedByOverlay = true;

      cancelAnimationFrame(rafId);
      rafId = 0;
      lastT = 0;

      setUi();
      // Keep Wake Lock ON while paused (video behavior)
      requestWakeLock();
    }

    function resumeFromOverlay() {
      if (!isOn || !isPausedByOverlay) return;

      isPausedByOverlay = false;

      // Only resume if user-tap pause is not active
      if (!isPausedByTap) {
        scrollYFloat = window.scrollY;
        lastT = 0;
        rafId = requestAnimationFrame(tick);
      }

      setUi();
      requestWakeLock();
    }

    function tick(t) {
      if (!isOn) return;
      if (isPausedByTap || isPausedByOverlay) return;

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

    async function start() {
      if (prefersReduced || isOn) return;

      scrollYFloat = window.scrollY;
      lastT = 0;

      isOn = true;
      isPausedByTap = false;
      isPausedByOverlay = false;

      setUi();
      await requestWakeLock();
      rafId = requestAnimationFrame(tick);
    }

    function toggleAutoButton() {
      // Only auto button can turn ON/OFF
      isOn ? stopAll() : start();
    }

    // =========================
    // 1) Normal scroll must work, must not stop auto.
    //    Auto must "follow" manual scroll position.
    // =========================
    window.addEventListener(
      "scroll",
      () => {
        if (!isOn) return;
        if (isPausedByTap || isPausedByOverlay) return;
        if (programmaticScroll) return;

        // User scrolled manually → continue auto from here
        scrollYFloat = window.scrollY;
        lastT = 0;
      },
      { passive: true }
    );

    // =========================
    // 2) Tap/click ANYWHERE toggles pause/resume
    //    EXCEPT excluded controls.
    // =========================

    // Exclude: auto button, menu button, any button/link/form control, and anything inside header/menu UI.
    const EXCLUDE_SELECTORS = [
      "#autoScrollBtn",
      ".menu-toggle",
      ".main-header",
      "#menu-placeholder",

      // generic interactive stuff
      "button",
      "a",
      "input",
      "textarea",
      "select",
      "[role='button']",
      "[role='link']",
      "[data-no-autopause='true']",
    ];

    function isExcludedTarget(target) {
      if (!target || !target.closest) return false;
      return EXCLUDE_SELECTORS.some((sel) => target.closest(sel));
    }

    document.addEventListener("click", (e) => {
      if (!isOn) return;
      if (isExcludedTarget(e.target)) return;

      // Toggle pause/resume like tapping a video
      isPausedByTap ? resumeFromTap() : pauseForTap();
    });

    // =========================
    // 3) Menu button click = TRUE STOP (OFF)
    // =========================
    const menuBtn = document.querySelector(".menu-toggle");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        if (isOn) stopAll();
      });
    }

    // =========================
    // 4) Page exited = TRUE STOP (OFF)
    // =========================
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isOn) stopAll();
    });

    window.addEventListener("beforeunload", () => {
      if (isOn) stopAll();
    });

    // =========================
    // 5) Notification overlay open = TEMP PAUSE
    //    overlay close = RESUME (if not paused by tap)
    //
    // IMPORTANT: Put your real overlay selector(s) here.
    // =========================
    const OVERLAY_SELECTORS = [
      "#notification-overlay",
      ".notification-overlay",
      ".notification-panel",
      ".notification-drawer",
      ".notification-sheet",
    ];

    function findOverlayEl() {
      for (const sel of OVERLAY_SELECTORS) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    }

    function isOverlayVisible(el) {
      if (!el) return false;

      if (el.getAttribute("aria-hidden") === "true") return false;
      if (el.hidden) return false;

      const cs = window.getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") {
        return false;
      }

      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }

    function updateOverlayPause() {
      if (!isOn) return;

      const el = findOverlayEl();
      const open = isOverlayVisible(el);

      if (open) pauseForOverlay();
      else resumeFromOverlay();
    }

    const mo = new MutationObserver(() => {
      updateOverlayPause();
    });

    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "aria-hidden"],
      subtree: true,
      childList: true,
    });

    window.addEventListener("resize", updateOverlayPause, { passive: true });

    // =========================
    // INIT
    // =========================
    btn.addEventListener("click", toggleAutoButton);

    // Initial UI
    setUi();

    // Initial overlay state
    updateOverlayPause();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initAutoScroll = initAutoScroll;
})();
