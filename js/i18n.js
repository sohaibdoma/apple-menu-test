const DEFAULT_LANG = 'ar';

function loadLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      document.documentElement.lang = data.lang;
      document.documentElement.dir = data.dir;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (data[key]) el.textContent = data[key];
      });

      localStorage.setItem('lang', lang);
      updateActiveButton(lang);
    });
}
const savedLang = localStorage.getItem('lang') || DEFAULT_LANG;
loadLanguage(savedLang);
