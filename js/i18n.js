/* ===============================
   i18n – Language System
   =============================== */

const DEFAULT_LANG = 'ar';
let i18nInitialized = false;
let currentLang = null;

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
   Load language
   =============================== */
function loadLanguage(lang) {
  if (lang === currentLang) return;
  currentLang = lang;

  fetch(`lang/${lang}.json`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      // Set <html> language & direction
      document.documentElement.lang = data.lang || lang;
      document.documentElement.dir  = data.dir  || 'ltr';

      // Translate text
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (data[key]) {
          el.textContent = data[key];
        }
      });

      // Save preference
      localStorage.setItem('lang', lang);

      // Update language buttons
      updateActiveButton(lang);
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
