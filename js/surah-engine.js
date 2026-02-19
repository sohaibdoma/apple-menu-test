document.addEventListener("DOMContentLoaded", async () => {
  const headerEl = document.getElementById("surah-header");
  const contentEl = document.getElementById("surah-content");

  if (!headerEl || !contentEl) return;

  const surahId = getSurahIdFromURL();

  if (!surahId) {
    contentEl.innerHTML = "<p>Invalid Surah ID</p>";
    return;
  }

  document.body.dataset.surah = String(surahId);

  try {
    const surahData = await fetchSurah(surahId);
    renderSurah(surahData);
  } catch (error) {
    contentEl.innerHTML = "<p>Failed to load Surah.</p>";
    console.error(error);
  }
});


function getSurahIdFromURL() {
  const params = new URLSearchParams(window.location.search);

  const surahParam = params.get("surah");
  if (surahParam) {
    const num = Number.parseInt(surahParam, 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  const idParam = params.get("id");
  if (idParam) {
    const num = Number.parseInt(idParam, 10);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  return 1;
}


async function fetchSurah(id) {
  const response = await fetch(
    `https://api.quran.com/api/v4/chapters/${id}?language=en`
  );

  if (!response.ok) throw new Error("API error");

  const chapter = await response.json();

  const versesResponse = await fetch(
    `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`
  );

  if (!versesResponse.ok) throw new Error("Verses API error");

  const verses = await versesResponse.json();

  return {
    chapter: chapter.chapter,
    verses: verses.verses
  };
}

function renderSurah(data) {
  const header = document.getElementById("surah-header");
  const content = document.getElementById("surah-content");

  header.innerHTML = `
    <div class="surah-title">
      <h1>${data.chapter.name_arabic}</h1>
      <p class="surah-meta">
        ${data.chapter.name_simple} • ${data.chapter.revelation_place} • ${data.chapter.verses_count} Ayahs
      </p>
    </div>
  `;

  content.innerHTML = "";
  
if (data.chapter.id !== 9) {
  const bismillah = document.createElement("div");
  bismillah.classList.add("bismillah");
  bismillah.textContent = "﷽";
  content.appendChild(bismillah);
}

  data.verses.forEach((verse, index) => {
    const ayah = document.createElement("div");
    ayah.classList.add("ayah");

    ayah.innerHTML = `
      <span class="ayah-text">${verse.text_uthmani}</span>
      <span class="ayah-number">﴿${index + 1}﴾</span>
    `;

    content.appendChild(ayah);
  });
}

