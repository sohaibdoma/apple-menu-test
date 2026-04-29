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
    let lastTime = 0;
    let scrollPosition = 0;
    let programmaticScroll = false;
    let wakeLock = null;

    const SPEED_PX_PER_SECOND = prefersReduced ? 0 : 18;
    const BOTTOM_THRESHOLD = 3;

    function getMaxScrollTop() {
      return Math.max(0, scroller.scrollHeight - window.innerHeight);
    }

    async function requestWakeLock() {
      if (!isOn) return;

      if (
        !("wakeLock" in navigator) ||
        typeof navigator.wakeLock?.request !== "function"
      ) {
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
      lastTime = 0;

      setUi();
      releaseWakeLock();
    }

    function pauseForTap() {
      if (!isOn || isPausedByTap) return;

      isPausedByTap = true;

      cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;

      setUi();
    }

    function resumeFromTap() {
      if (!isOn || !isPausedByTap) return;

      isPausedByTap = false;
      scrollPosition = scroller.scrollTop;
      lastTime = 0;

      setUi();
      rafId = requestAnimationFrame(tick);
    }

    function tick(currentTime) {
      if (!isOn || isPausedByTap) return;

      if (!lastTime) {
        lastTime = currentTime;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const deltaSeconds = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const maxScrollTop = getMaxScrollTop();

      scrollPosition = Math.min(
        scrollPosition + SPEED_PX_PER_SECOND * deltaSeconds,
        maxScrollTop
      );

      programmaticScroll = true;
      scroller.scrollTop = scrollPosition;
      requestAnimationFrame(() => {
        programmaticScroll = false;
      });

      const atBottom = maxScrollTop - scroller.scrollTop <= BOTTOM_THRESHOLD;

      if (atBottom) {
        stopAll();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    async function start() {
      if (prefersReduced || isOn) return;

      scrollPosition = scroller.scrollTop;
      lastTime = 0;

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
      "wheel",
      () => {
        if (isOn) stopAll();
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      () => {
        if (isOn) stopAll();
      },
      { passive: true }
    );

    window.addEventListener("keydown", (event) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " "
      ];

      if (isOn && scrollKeys.includes(event.key)) {
        stopAll();
      }
    });

    window.addEventListener(
      "resize",
      () => {
        if (!isOn) return;

        scrollPosition = Math.min(scroller.scrollTop, getMaxScrollTop());
        lastTime = 0;
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
      return EXCLUDE_SELECTORS.some((selector) => target.closest(selector));
    }

    document.addEventListener("click", (event) => {
      if (!isOn) return;
      if (isExcludedTarget(event.target)) return;

      isPausedByTap ? resumeFromTap() : pauseForTap();
    });

    const menuBtn = document.querySelector(".menu-toggle");
    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        if (isOn) stopAll();
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isOn) {
        stopAll();
        return;
      }

      if (!document.hidden && isOn) {
        requestWakeLock();
      }
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
