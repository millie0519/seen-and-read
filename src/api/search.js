const PAGE_SIZE = 15;

export async function searchByCategory(cat, query) {
  if (!query || query.trim().length < 1) return [];
  switch (cat) {
    case 'book':  return searchBooks(query.trim());
    case 'movie': return searchMovies(query.trim());
    case 'drama': return searchTV(query.trim());
    case 'stage':   return searchStage(query.trim());
    case 'concert': return searchConcert(query.trim());
    default:        return [];
  }
}

export async function searchMoreByCategory(cat, query, page = 1) {
  if (!query || !query.trim()) return { items: [], hasMore: false };
  switch (cat) {
    case 'book':  return searchBooksPage(query.trim(), page);
    case 'movie': return searchMoviesPage(query.trim(), page);
    case 'drama': return searchTVPage(query.trim(), page);
    case 'stage':   return searchStagePage(query.trim(), page);
    case 'concert': return searchConcertPage(query.trim(), page);
    default:        return { items: [], hasMore: false };
  }
}

async function searchBooks(query) {
  try {
    const variants = spaceVariants(query);
    const all = await Promise.all(variants.map(async q => {
      const res = await fetch(`/api/naver-search?query=${encodeURIComponent(q)}&display=5`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.items || []).map(item => ({
        title:       strip(item.title),
        creator:     strip(item.author),
        coverUrl:    item.image || null,
        externalRef: `naver:book:${item.isbn}`,
        sub:         item.publisher || null,
      }));
    }));
    return dedup(all.flat());
  } catch {
    return [];
  }
}

async function searchMovies(query) {
  try {
    const variants = spaceVariants(query);
    const all = await Promise.all(variants.map(async q => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&language=ko-KR`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).slice(0, 5).map(item => ({
        title:       item.title,
        creator:     null,
        coverUrl:    item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        externalRef: `tmdb:movie:${item.id}`,
        sub:         item.release_date?.slice(0, 4) || null,
      }));
    }));
    return dedup(all.flat());
  } catch {
    return [];
  }
}

async function searchTV(query) {
  try {
    const variants = spaceVariants(query);
    const all = await Promise.all(variants.map(async q => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(q)}&language=ko-KR`,
        { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data.results || []).slice(0, 5).map(item => ({
        title:       item.name,
        creator:     null,
        coverUrl:    item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        externalRef: `tmdb:tv:${item.id}`,
        sub:         item.first_air_date?.slice(0, 4) || null,
      }));
    }));
    return dedup(all.flat());
  } catch {
    return [];
  }
}

async function searchBooksPage(query, page) {
  try {
    const start = (page - 1) * PAGE_SIZE + 1;
    const res = await fetch(
      `/api/naver-search?query=${encodeURIComponent(query)}&display=${PAGE_SIZE}&start=${start}`
    );
    if (!res.ok) return { items: [], hasMore: false };
    const data = await res.json();
    const items = (data.items || []).map(item => ({
      title:       strip(item.title),
      creator:     strip(item.author),
      coverUrl:    item.image || null,
      externalRef: `naver:book:${item.isbn}`,
      sub:         item.publisher || null,
    }));
    return { items, hasMore: items.length === PAGE_SIZE };
  } catch {
    return { items: [], hasMore: false };
  }
}

async function searchMoviesPage(query, page) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=ko-KR&page=${page}`,
      { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` } }
    );
    if (!res.ok) return { items: [], hasMore: false };
    const data = await res.json();
    const items = (data.results || []).map(item => ({
      title:       item.title,
      creator:     null,
      coverUrl:    item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      externalRef: `tmdb:movie:${item.id}`,
      sub:         item.release_date?.slice(0, 4) || null,
    }));
    return { items, hasMore: page < (data.total_pages || 1) };
  } catch {
    return { items: [], hasMore: false };
  }
}

async function searchTVPage(query, page) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=ko-KR&page=${page}`,
      { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` } }
    );
    if (!res.ok) return { items: [], hasMore: false };
    const data = await res.json();
    const items = (data.results || []).map(item => ({
      title:       item.name,
      creator:     null,
      coverUrl:    item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      externalRef: `tmdb:tv:${item.id}`,
      sub:         item.first_air_date?.slice(0, 4) || null,
    }));
    return { items, hasMore: page < (data.total_pages || 1) };
  } catch {
    return { items: [], hasMore: false };
  }
}

const STAGE_GENRES   = ['연극', '뮤지컬'];
const CONCERT_GENRES = ['음악', '오페라'];

async function searchStage(query) {
  try {
    const res = await fetch(`/api/kopis-search?query=${encodeURIComponent(query)}&rows=50`);
    if (!res.ok) return [];
    const data = await res.json();
    const filtered = (data.items || []).filter(i => STAGE_GENRES.includes(i.genre));
    return dedupByTitle(filtered);
  } catch {
    return [];
  }
}

async function searchStagePage(query, page) {
  try {
    const res = await fetch(`/api/kopis-search?query=${encodeURIComponent(query)}&rows=50&page=${page}`);
    if (!res.ok) return { items: [], hasMore: false };
    const data = await res.json();
    const items = dedupByTitle((data.items || []).filter(i => STAGE_GENRES.includes(i.genre)));
    return { items, hasMore: (data.items || []).length === 50 };
  } catch {
    return { items: [], hasMore: false };
  }
}

async function searchConcert(query) {
  try {
    const res = await fetch(`/api/kopis-search?query=${encodeURIComponent(query)}&rows=50`);
    if (!res.ok) return [];
    const data = await res.json();
    const filtered = (data.items || []).filter(i => CONCERT_GENRES.some(g => i.genre?.includes(g)));
    return dedupByTitle(filtered);
  } catch {
    return [];
  }
}

async function searchConcertPage(query, page) {
  try {
    const res = await fetch(`/api/kopis-search?query=${encodeURIComponent(query)}&rows=50&page=${page}`);
    if (!res.ok) return { items: [], hasMore: false };
    const data = await res.json();
    const items = dedupByTitle((data.items || []).filter(i => CONCERT_GENRES.some(g => i.genre?.includes(g))));
    return { items, hasMore: (data.items || []).length === 50 };
  } catch {
    return { items: [], hasMore: false };
  }
}

export async function fetchKopisDetail(externalRef) {
  if (!externalRef?.startsWith('kopis:')) return null;
  const id = externalRef.split(':')[1];
  try {
    const res  = await fetch(`/api/kopis-detail?id=${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchKopisCredits(externalRef) {
  const detail = await fetchKopisDetail(externalRef);
  return detail?.cast || null;
}

export async function fetchCredits(externalRef) {
  if (!externalRef?.startsWith('tmdb:')) return null;
  const [, type, id] = externalRef.split(':');
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/credits?language=ko-KR`,
      { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const director = (data.crew || []).find(c => c.job === 'Director')?.name || null;
    const actors   = (data.cast || []).slice(0, 4).map(c => c.name);
    if (!director && !actors.length) return null;
    const parts = [];
    if (director) parts.push(director);
    if (actors.length) parts.push(actors.join(', '));
    return parts.join(' / ');
  } catch {
    return null;
  }
}

function strip(str) {
  return str ? str.replace(/<[^>]+>/g, '').trim() : '';
}

function dedup(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.externalRef)) return false;
    seen.add(item.externalRef);
    return true;
  });
}

function dedupByTitle(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.title?.toLowerCase().replace(/\s+/g, '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function spaceVariants(query) {
  const variants = new Set([query]);
  const stripped = query.replace(/\s+/g, '');

  if (stripped !== query) {
    // 공백 있는 쿼리 → 공백 제거 버전도 추가
    variants.add(stripped);
  } else if (stripped.length <= 8) {
    // 공백 없는 짧은 쿼리 → 모든 위치에 공백 삽입 시도
    for (let i = 1; i < stripped.length; i++) {
      variants.add(stripped.slice(0, i) + ' ' + stripped.slice(i));
    }
  }

  return [...variants];
}
