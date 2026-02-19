window.Wahyollah = window.Wahyollah || {};

window.Wahyollah.config = {
  defaultLang: "ar",
  supportedLangs: ["ar", "en", "tr"],

  // Used by i18n loader
  langPath: (lang) => `lang/${lang}.json`,

  // Used by menu loader
  menuPath: "components/menu.html",
};
