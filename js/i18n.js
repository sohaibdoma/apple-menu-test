/* ===============================
   i18n – Language System
   =============================== */

const DEFAULT_LANG = 'ar';

let i18nInitialized = false;
let currentLang = null;

// cache loaded language files
const cache = {};

// optional fallback dictionary (can be empty or expanded)
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
   Apply language data to DOM
   =============================== */
function applyLanguage(data, lang) {
  // Set <html> language & direction
  document.documentElement.lang = data.lang || lang;
  document.documentElement.dir  = data.dir  || 'ltr';

  // Translate text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = data[key] ?? fallback[key] ?? '';
  });

  // Save preference
  localStorage.setItem('lang', lang);

  // Update language buttons
  updateActiveButton(lang);
}

/* ===============================
   Load language
   =============================== */
function loadLanguage(lang) {
  if (lang === currentLang) return;
  currentLang = lang;

  // use cached version if available
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
      cache[lang] = data; // store in cache
      applyLanguage(data, lang);
    })
    .catch(err => {
      console.error('Language load error:', err);
    });
}

/* ===============================
   Init
   =============================== */
function initI18n() {
  if (i18nInitialized) return;
  i18nInitialized = true;

  // Attach language button handlers (only once)
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      loadLanguage(btn.dataset.lang);
    });
  });

  // Load saved or default language
  const savedLang = localStorage.getItem('lang') || DEFAULT_LANG;
  loadLanguage(savedLang);
}

// expose globally
window.initI18n = initI18n;
