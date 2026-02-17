document.addEventListener("DOMContentLoaded", async () => {
  const surahId = getSurahIdFromURL();

  if (!surahId) {
    document.getElementById("surah-content").innerHTML =
      "<p>Invalid Surah ID</p>";
    return;
  }

  try {
    const surahData = await fetchSurah(surahId);
    renderSurah(surahData);
  } catch (error) {
    document.getElementById("surah-content").innerHTML =
      "<p>Failed to load Surah.</p>";
    console.error(error);
  }
});

function getSurahIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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
    <h1>${data.chapter.name_arabic}</h1>
    <p>${data.chapter.name_simple}</p>
  `;

  content.innerHTML = "";

  data.verses.forEach((verse) => {
    const ayah = document.createElement("p");
    ayah.classList.add("ayah");
    ayah.textContent = verse.text_uthmani;
    content.appendChild(ayah);
  });
}
