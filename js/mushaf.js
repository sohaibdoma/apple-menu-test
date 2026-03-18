(function () {
  "use strict";

  function createAyahBadge(number) {
    const badge = document.createElement("span");
    badge.className = "q-badge q-badge--ayah";
    badge.textContent = String(number).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
    return badge;
  }

  function renderTestPage() {
    const pagesRoot = document.getElementById("mushaf-pages");
    const navTitle = document.getElementById("nav-surah-title");

    if (!pagesRoot) return;

    if (navTitle) {
      navTitle.textContent = "الفاتحة";
    }

    const page = document.createElement("section");
    page.className = "mushaf-page";
    page.setAttribute("data-page-number", "1");
    page.setAttribute("data-surah-id", "1");
    page.setAttribute("data-surah-name", "الفاتحة");

    const text = document.createElement("div");
    text.className = "mushaf-text";

    const ayahs = [
      "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      "الرَّحْمَٰنِ الرَّحِيمِ",
      "مَالِكِ يَوْمِ الدِّينِ",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
    ];

    ayahs.forEach((ayahText, index) => {
      const inlineAyah = document.createElement("span");
      inlineAyah.className = "mushaf-ayah-inline";
      inlineAyah.textContent = ayahText + " ";

      inlineAyah.appendChild(createAyahBadge(index + 1));
      inlineAyah.appendChild(document.createTextNode(" "));

      text.appendChild(inlineAyah);
    });

    const pageNumber = document.createElement("div");
    pageNumber.className = "mushaf-page-number";
    pageNumber.textContent = "١";

    page.appendChild(text);
    page.appendChild(pageNumber);

    pagesRoot.innerHTML = "";
    pagesRoot.appendChild(page);
  }

  document.addEventListener("DOMContentLoaded", renderTestPage);
})();
