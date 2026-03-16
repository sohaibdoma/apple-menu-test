window.Wahyollah = window.Wahyollah || {};

(() => {
  if (window.Wahyollah.api) return;

  const API_BASE = "https://api.quran.com/api/v4";
  const requestCache = new Map();
  const inflightRequests = new Map();

  const chapterCache = new Map();
  let allChaptersPromise = null;
  let allAyahsPromise = null;
  let allTajweedAyahsPromise = null;

  const REQUEST_TIMEOUT_MS = 10000;

  function buildError(message, extra = {}) {
    const error = new Error(message);
    Object.assign(error, extra);
    return error;
  }

  async function fetchJson(url, options = {}) {
    const cached = requestCache.get(url);
    if (cached) return cached;

    const inflight = inflightRequests.get(url);
    if (inflight) return inflight;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const requestPromise = fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal,
      ...options
    })
      .then(async (res) => {
        if (!res.ok) {
          throw buildError(`Request failed with HTTP ${res.status}`, {
            status: res.status,
            url
          });
        }

        const data = await res.json();
        requestCache.set(url, data);
        return data;
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          throw buildError("Request timed out", {
            url,
            code: "TIMEOUT"
          });
        }

        throw error;
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        inflightRequests.delete(url);
      });

    inflightRequests.set(url, requestPromise);
    return requestPromise;
  }

  async function getChapter(id) {
    const cached = chapterCache.get(id);
    if (cached) return { chapter: cached };

    const data = await fetchJson(`${API_BASE}/chapters/${id}?language=en`);

    if (data?.chapter) {
      chapterCache.set(id, data.chapter);
    }

    return data;
  }

  async function getAllChapters() {
    if (allChaptersPromise) return allChaptersPromise;

    allChaptersPromise = (async () => {
      const requests = [];

      for (let id = 1; id <= 114; id += 1) {
        requests.push(getChapter(id));
      }

      const responses = await Promise.all(requests);

      return responses
        .map((res) => res?.chapter)
        .filter(Boolean)
        .sort((a, b) => a.id - b.id);
    })();

    return allChaptersPromise;
  }

  async function getUthmaniVersesByChapter(chapterNumber) {
    const perPage = 50;
    let page = 1;
    let verses = [];

    while (true) {
      const url =
        `${API_BASE}/verses/by_chapter/${chapterNumber}` +
        `?fields=text_uthmani,page_number,verse_number,verse_key,chapter_id` +
        `&per_page=${perPage}&page=${page}`;

      const data = await fetchJson(url);

      if (Array.isArray(data?.verses) && data.verses.length) {
        verses = verses.concat(data.verses);
      }

      const next = data?.pagination?.next_page;
      if (!next) break;

      page = next;
    }

    return { verses };
  }

  async function getTajweedVersesByChapter(chapterNumber) {
    const perPage = 50;
    let page = 1;
    let verses = [];

    while (true) {
      const url =
        `${API_BASE}/verses/by_chapter/${chapterNumber}` +
        `?fields=text_uthmani_tajweed,page_number,verse_number,verse_key,chapter_id` +
        `&per_page=${perPage}&page=${page}`;

      const data = await fetchJson(url);

      if (Array.isArray(data?.verses) && data.verses.length) {
        verses = verses.concat(data.verses);
      }

      const next = data?.pagination?.next_page;
      if (!next) break;

      page = next;
    }

    return { verses };
  }

  async function getMushafVersesByChapter(chapterNumber) {
    const perPage = 50;
    let page = 1;
    let verses = [];

    while (true) {
      const url =
        `${API_BASE}/verses/by_chapter/${chapterNumber}` +
        `?fields=text_uthmani,code_v2,page_number,v2_page,verse_key,verse_number,chapter_id` +
        `&per_page=${perPage}&page=${page}`;

      const data = await fetchJson(url);

      if (Array.isArray(data?.verses) && data.verses.length) {
        verses = verses.concat(data.verses);
      }

      const next = data?.pagination?.next_page;
      if (!next) break;

      page = next;
    }

    return { verses };
  }

  async function getAllAyahs() {
    if (allAyahsPromise) return allAyahsPromise;

    allAyahsPromise = (async () => {
      const chapterRequests = [];

      for (let chapterNumber = 1; chapterNumber <= 114; chapterNumber += 1) {
        chapterRequests.push(getUthmaniVersesByChapter(chapterNumber));
      }

      const chapterResponses = await Promise.all(chapterRequests);
      const allAyahs = [];

      chapterResponses.forEach((response) => {
        const verses = Array.isArray(response?.verses) ? response.verses : [];

        verses.forEach((verse) => {
          const verseKey = verse?.verse_key || "";
          const chapterIdFromKey = Number.parseInt(String(verseKey).split(":")[0], 10);

          allAyahs.push({
            type: "ayah",
            surahId: Number.isInteger(verse?.chapter_id)
              ? verse.chapter_id
              : chapterIdFromKey,
            ayahNumber: verse?.verse_number ?? null,
            verseKey,
            pageNumber: verse?.page_number ?? null,
            textArabic: verse?.text_uthmani || "",
            href: verseKey
              ? `surah.html?surah=${Number.parseInt(String(verseKey).split(":")[0], 10)}#ayah-${String(verseKey).replace(":", "-")}`
              : ""
          });
        });
      });

      return allAyahs;
    })();

    return allAyahsPromise;
  }

  async function getAllTajweedAyahs() {
    if (allTajweedAyahsPromise) return allTajweedAyahsPromise;

    allTajweedAyahsPromise = (async () => {
      const chapterRequests = [];

      for (let chapterNumber = 1; chapterNumber <= 114; chapterNumber += 1) {
        chapterRequests.push(getTajweedVersesByChapter(chapterNumber));
      }

      const chapterResponses = await Promise.all(chapterRequests);
      const allAyahs = [];

      chapterResponses.forEach((response) => {
        const verses = Array.isArray(response?.verses) ? response.verses : [];

        verses.forEach((verse) => {
          const verseKey = verse?.verse_key || "";
          const chapterIdFromKey = Number.parseInt(String(verseKey).split(":")[0], 10);

          allAyahs.push({
            type: "ayah",
            surahId: Number.isInteger(verse?.chapter_id)
              ? verse.chapter_id
              : chapterIdFromKey,
            ayahNumber: verse?.verse_number ?? null,
            verseKey,
            pageNumber: verse?.page_number ?? null,
            textTajweed: verse?.text_uthmani_tajweed || "",
            href: verseKey
              ? `surah.html?surah=${Number.parseInt(String(verseKey).split(":")[0], 10)}#ayah-${String(verseKey).replace(":", "-")}`
              : ""
          });
        });
      });

      return allAyahs;
    })();

    return allTajweedAyahsPromise;
  }

  window.Wahyollah.api = {
    getChapter,
    getAllChapters,
    getUthmaniVersesByChapter,
    getTajweedVersesByChapter,
    getMushafVersesByChapter,
    getAllAyahs,
    getAllTajweedAyahs
  };
})();
