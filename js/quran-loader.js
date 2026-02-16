document.addEventListener("DOMContentLoaded", () => {
  const surahId = document.body.dataset.surah;
  const ayahsContainer = document.querySelector(".ayahs");

  if (!surahId || !ayahsContainer) return;

  fetch("data/quran-structure.json")
    .then(response => response.json())
    .then(data => {
      const surah = data.surahs.find(s => s.id == surahId);

      if (!surah) return;

      // Update title
      document.querySelector(".surah-title").textContent =
        "سورة " + surah.arabic_name;

      document.title = "سورة " + surah.arabic_name;

      // Clear placeholder ayah
      ayahsContainer.innerHTML = "";

      // Render ayahs
      surah.ayahs.forEach((ayahText, index) => {
        const ayah = document.createElement("p");
        ayah.className = "ayah";

        ayah.innerHTML = `
          <span class="ayah-text">${ayahText}</span>
          <span class="ayah-number">${index + 1}</span>
        `;

        ayahsContainer.appendChild(ayah);
      });
    })
    .catch(error => console.error("Error loading Qur'an:", error));
});
