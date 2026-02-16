function initMenu() {
  const menuButton = document.querySelector('.menu-button');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuNav = document.getElementById('main-menu');

  if (!menuButton || !menuOverlay || !menuNav) {
    console.warn('Menu elements not found');
    return;
  }

/* ===============================
   Generate Surah List
   =============================== */

const surahs = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة",
  "يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

const menuList = menuNav.querySelector(".menu-list");

if (menuList) {
  surahs.forEach((name, index) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = `${index + 1}. ${name}`;
    a.href = `surah${index + 1}.html`;
    a.dataset.surah = index + 1;

    li.appendChild(a);
    menuList.appendChild(li);
  });
}
  
  let lastFocusedElement = null;

  function openMenu() {
    lastFocusedElement = document.activeElement;

    menuOverlay.classList.add('open');
    menuButton.classList.add('open');

    menuOverlay.setAttribute('aria-hidden', 'false');
    menuButton.setAttribute('aria-expanded', 'true');

    document.body.classList.add('menu-open');

    menuNav.querySelector('a')?.focus();
  }

  function closeMenu() {
    menuOverlay.classList.remove('open');
    menuButton.classList.remove('open');

    menuOverlay.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');

    document.body.classList.remove('menu-open');

    lastFocusedElement?.focus();
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  menuOverlay.addEventListener('click', e => {
    if (e.target === menuOverlay) closeMenu();
  });

  const currentSurah = document.body.dataset.surah;
  if (currentSurah) {
    menuNav
      .querySelector(`[data-surah="${currentSurah}"]`)
      ?.setAttribute('aria-current', 'page');
  }
}

// expose globally
window.initMenu = initMenu;
