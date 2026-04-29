(function () {
  "use strict";

  function initAutoScroll() {
    const surahRoot = document.querySelector(".surah-container");
    if (!surahRoot) return;

    const btn = document.getElementById("autoScrollBtn");
    if (!btn) return;

    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const scrollToBottomBtn = document.getElementById("scrollToBottomBtn");

    const scroller = document.scrollingElement || document.documentElement;

    let isOn = false;
    let isPausedByTap = false;
    let isUserScrolling = false;
    let rafId = 0;
    let lastTime = 0;
    let scrollPosition = 0;
    let userScrollTimer = 0;

    const SPEED_PX_PER_SECOND = 18;
    const USER_SCROLL_RESUME_DELAY = 650;
    const BOTTOM_THRESHOLD = 4;

    function getMaxScrollTop() {
      return Math.max(0, scroller.scrollHeight - window.innerHeight);
    }

    function setUi() {
      btn.setAttribute("aria-pressed", String(isOn));
      btn.classList.toggle("is-on", isOn);
      btn.classList.toggle("is-paused", isOn && isPausedByTap);

      document.body.classList.toggle("auto-scroll-active", isOn);

      btn.setAttribute(
        "aria-label",
        isOn ? "Stop auto scroll" : "Start auto scroll"
      );
    }

    function stopAutoScroll() {
      isOn = false;
      isPausedByTap = false;
      isUserScrolling = false;

      cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;

      clearTimeout(userScrollTimer);
      setUi();
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

    function handleUserScrollIntent() {
      if (!isOn || isPausedByTap) return;

      isUserScrolling = true;
      cancelAnimationFrame(rafId);
      rafId = 0;
      lastTime = 0;

      clearTimeout(userScrollTimer);

      userScrollTimer = setTimeout(() => {
        if (!isOn || isPausedByTap) return;

        isUserScrolling = false;
        scrollPosition = scroller.scrollTop;
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      }, USER_SCROLL_RESUME_DELAY);
    }

    function tick(currentTime) {
      if (!isOn || isPausedByTap || isUserScrolling) return;

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

      scroller.scrollTop = scrollPosition;

      if (maxScrollTop - scroller.scrollTop <= BOTTOM_THRESHOLD) {
        stopAutoScroll();
        return;
      }

      rafId = requestAnimationFrame(tick);
    }

    function startAutoScroll() {
      if (isOn) return;

      scrollPosition = scroller.scrollTop;
      lastTime = 0;

      isOn = true;
      isPausedByTap = false;
      isUserScrolling = false;

      setUi();
      rafId = requestAnimationFrame(tick);
    }

    function toggleAutoScroll() {
      isOn ? stopAutoScroll() : startAutoScroll();
    }

    function scrollToTop() {
      if (isOn) stopAutoScroll();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    function scrollToBottom() {
      if (isOn) stopAutoScroll();

      window.scrollTo({
        top: scroller.scrollHeight,
        behavior: "smooth"
      });
    }

    window.addEventListener("wheel", handleUserScrollIntent, { passive: true });
    window.addEventListener("touchmove", handleUserScrollIntent, { passive: true });
    window.addEventListener("keydown", handleUserScrollIntent);

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
      ".surah-bottom-controls",
      ".menu-toggle",
      ".search-toggle",
      ".theme-toggle",
      ".lang-switch",
      ".main-header",
      "#menu-placeholder",
      "#search-placeholder",
      "button",
      "a",
      "input",
      "textarea",
      "select",
      "[role='button']",
      "[role='link']"
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

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isOn) {
        stopAutoScroll();
      }
    });

    btn.addEventListener("click", toggleAutoScroll);

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
