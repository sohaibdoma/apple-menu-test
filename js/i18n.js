/* ===============================
   i18n – Language System
   =============================== */

const DEFAULT_LANG = 'ar';

/* ===============================
   UI: Active language button
   =============================== */
function updateActiveButton(lang) {
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/* ===============================
   Load language
   =============================== */
function loadLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      // Set <html> language & direction
      document.documentElement.lang = data.lang;
      document.documentElement.dir = data.dir;

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
document.addEventListener('DOMContentLoaded', () => {
  // Attach language button handlers
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      loadLanguage(btn.dataset.lang);
    });
  });

  // Load saved or default language
  const savedLang = localStorage.getItem('lang') || DEFAULT_LANG;
  loadLanguage(savedLang);
});
