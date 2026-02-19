window.Wahyollah = window.Wahyollah || {};

const API_BASE = "https://api.quran.com/api/v4";

const cache = new Map();

async function fetchJson(url) {
  const cached = cache.get(url);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  cache.set(url, data);
  return data;
}

async function getChapter(id) {
  return fetchJson(`${API_BASE}/chapters/${id}?language=en`);
}

async function getUthmaniVersesByChapter(id) {
  return fetchJson(`${API_BASE}/quran/verses/uthmani?chapter_number=${id}`);
}

window.Wahyollah.api = {
  getChapter,
  getUthmaniVersesByChapter
};
