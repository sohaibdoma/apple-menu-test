window.Wahyollah = window.Wahyollah || {};

(() => {
  if (window.Wahyollah.api) return;

  const API_BASE = "https://api.quran.com/api/v4";
  const requestCache = new Map();

  async function fetchJson(url) {
    const cached = requestCache.get(url);
    if (cached) return cached;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    requestCache.set(url, data);
    return data;
  }

  async function getChapter(id) {
    return fetchJson(`${API_BASE}/chapters/${id}?language=en`);
  }

 async function getUthmaniVersesByChapter(chapterNumber) {
  const perPage = 50;
  let page = 1;
  let verses = [];

  while (true) {
    const url =
      `${API_BASE}/verses/by_chapter/${chapterNumber}` +
      `?fields=text_uthmani,page_number,verse_number,verse_key` +
      `&per_page=${perPage}&page=${page}`;

    const data = await fetchJson(url);

    if (data?.verses?.length) {
      verses = verses.concat(data.verses);
    }

    const next = data?.pagination?.next_page;
    if (!next) break;

    page = next;
  }

  return { verses };
}

  window.Wahyollah.api = {
    getChapter,
    getUthmaniVersesByChapter
  };
})();
