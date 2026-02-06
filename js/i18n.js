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
      // HTML language & direction
      document.documentElement.lang = data.lang;
      document.documentElement.dir = data.dir;

      // Text translations
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (data[key]) el.textContent = data[key];
      });

      // Save preference
      localStorage.setItem('lang', lang);

      // Update UI
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
  // Language switch buttons
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      loadLanguage(btn.dataset.lang);
    });
  });

  // Initial language
  const savedLang = localStorage.getItem('lang') || DEFAULT_LANG;
  loadLanguage(savedLang);
});
document.querySelectorAll('.lang-switch button').forEach(button => {
  button.addEventListener('click', () => {
    const lang = button.dataset.lang;

    setLanguage(lang);
    updateActiveButton(lang);
  });
});
