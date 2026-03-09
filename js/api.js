window.Wahyollah = window.Wahyollah || {};

(() => {
  if (window.Wahyollah.api) return;

  const API_BASE = "https://api.quran.com/api/v4";
  const requestCache = new Map();
  const inflightRequests = new Map();
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
        "Accept": "application/json"
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
          throw buildError("Request timed out", { url, code: "TIMEOUT" });
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

      if (Array.isArray(data?.verses) && data.verses.length) {
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
