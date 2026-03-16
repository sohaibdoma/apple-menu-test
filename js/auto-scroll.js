(function () {
  "use strict";

  function initAutoScroll() {
    const surahRoot = document.querySelector(".surah-container");
    if (!surahRoot) return;

    const btn = document.getElementById("autoScrollBtn");
    if (!btn) return;

    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const scrollToBottomBtn = document.getElementById("scrollToBottomBtn");

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const scroller = document.scrollingElement || document.documentElement;

    let isOn = false;
    let isPausedByTap = false;

    let rafId = 0;
    let lastT = 0;
    let scrollYFloat = 0;
    let programmaticScroll = false;

    const SPEED = prefersReduced ? 0 : 0.2;

    let wakeLock = null;

    async function requestWakeLock() {
      if (!isOn) return;

      if (!("wakeLock" in navigator) || typeof navigator.wakeLock?.request !== "function") {
        return;
      }

      try {
        if (wakeLock) {
          try {
            await wakeLock.release();
          } catch (_) {}
          wakeLock = null;
        }

        wakeLock = await navigator.wakeLock.request("screen");

        wakeLock.addEventListener("release", () => {
          wakeLock = null;
        });
      } catch (_) {
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

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) return;
      if (isOn) requestWakeLock();
    });

    function setUi() {
      btn.setAttribute("aria-pressed", String(isOn));
      btn.classList.toggle("is-on", isOn);
      btn.classList.toggle("is-paused", isOn && isPausedByTap);

      btn.setAttribute(
        "aria-label",
        isOn ? "Pause auto scroll" : "Start auto scroll"
      );
    }

    function stopAll() {
      isOn = false;
      isPausedByTap = false;

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
      requestWakeLock();
    }

    function resumeFromTap() {
      if (!isOn || !isPausedByTap) return;

      isPausedByTap = false;

      scrollYFloat = scroller.scrollTop;
      lastT = 0;
      rafId = requestAnimationFrame(tick);

      setUi();
      requestWakeLock();
    }

    function tick(t) {
      if (!isOn) return;
      if (isPausedByTap) return;

      if (!lastT) lastT = t;
      const dt = t - lastT;
      lastT = t;

      scrollYFloat += (SPEED * dt) / 16;

      programmaticScroll = true;
      scroller.scrollTop = scrollYFloat;
      programmaticScroll = false;

      const atBottom =
        window.innerHeight + scroller.scrollTop >=
        scroller.scrollHeight - 2;

      if (atBottom) {
        stopAll();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    async function start() {
      if (prefersReduced || isOn) return;

      scrollYFloat = scroller.scrollTop;
      lastT = 0;

      isOn = true;
      isPausedByTap = false;

      setUi();
      await requestWakeLock();
      rafId = requestAnimationFrame(tick);
    }

    function toggleAutoButton() {
      isOn ? stopAll() : start();
    }

    function scrollToTop() {
      if (isOn) stopAll();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    function scrollToBottom() {
      if (isOn) stopAll();

      window.scrollTo({
        top: scroller.scrollHeight,
        behavior: "smooth"
      });
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!isOn) return;
        if (isPausedByTap) return;
        if (programmaticScroll) return;

        scrollYFloat = scroller.scrollTop;
        lastT = 0;
      },
      { passive: true }
    );

    const EXCLUDE_SELECTORS = [
      "#autoScrollBtn",
      "#scrollToTopBtn",
      "#scrollToBottomBtn",
      "#leftUtilityBtn",
      ".menu-toggle",
      ".main-header",
      "#menu-placeholder",
      "button",
      "a",
      "input",
      "textarea",
      "select",
      "[role='button']",
      "[role='link']",
      "[data-no-autopause='true']"
    ];

    function isExcludedTarget(target) {
      if (!target || !target.closest) return false;
      return EXCLUDE_SELECTORS.some((sel) => target.closest(sel));
    }

    document.addEventListener("click", (e) => {
      if (!isOn) return;
      if (isExcludedTarget(e.target)) return;

      isPausedByTap ? resumeFromTap() : pauseForTap();
    });

    const menuBtn = document.querySelector(".menu-toggle");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        if (isOn) stopAll();
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isOn) stopAll();
    });

    window.addEventListener("beforeunload", () => {
      if (isOn) stopAll();
    });

    btn.addEventListener("click", toggleAutoButton);

    if (scrollToTopBtn) {
      scrollToTopBtn.addEventListener("click", scrollToTop);
    }

    if (scrollToBottomBtn) {
      scrollToBottomBtn.addEventListener("click", scrollToBottom);
    }

    setUi();
  }

  window.Wahyollah = window.Wahyollah || {};
  window.Wahyollah.initAutoScroll = initAutoScroll;

  document.addEventListener("DOMContentLoaded", initAutoScroll);
})();
