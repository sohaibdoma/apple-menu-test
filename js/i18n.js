/* ===============================
   i18n – Language System
   =============================== */

const DEFAULT_LANG = 'ar';

let currentLang = null;
let i18nInitialized = false;

// Cache loaded language files
const cache = {};

// Optional fallback dictionary
const fallback = {};

/* ===============================
   UI: Active language button
   =============================== */
function updateActiveButton(lang) {
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/* ===============================
   Apply language
   =============================== */
function applyLanguage(data, lang) {
  document.documentElement.lang = data.lang || lang;
  document.documentElement.dir  = data.dir  || 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = data[key] ?? fallback[key] ?? '';
  });

  localStorage.setItem('lang', lang);
  updateActiveButton(lang);
}

/* ===============================
   Load language
   =============================== */
function loadLanguage(lang) {
  if (lang === currentLang) return;
  currentLang = lang;

  if (cache[lang]) {
    applyLanguage(cache[lang], lang);
    return;
  }

  fetch(`lang/${lang}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      cache[lang] = data;
      applyLanguage(data, lang);
    })
    .catch(err => {
      console.error('Language load error:', err);
    });
}

/* ===============================
   Init (delegated, dynamic-safe)
   =============================== */
function initI18n() {
  if (i18nInitialized) return;
  i18nInitialized = true;

  // 🔹 ONE delegated listener
  document.addEventListener('click', e => {
    const btn = e.target.closest('.lang-switch button');
    if (!btn) return;

    const lang = btn.dataset.lang;
    if (lang) loadLanguage(lang);
  });

  const savedLang = localStorage.getItem('lang') || DEFAULT_LANG;
  loadLanguage(savedLang);
}

// expose globally
window.initI18n = initI18n;
