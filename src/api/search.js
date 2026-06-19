const PAGE_SIZE = 15;

export async function searchByCategory(cat, query) {
  if (!query || query.trim().length < 1) return [];
  switch (cat) {
    case 'book':  return searchBooks(query.trim());
    case 'movie': return searchMovies(query.trim());
    case 'drama': return searchTV(query.trim());
    default:      return [];
  }
}

export async function searchMoreByCategory(cat, query, page = 1) {
  if (!query || !query.trim()) return { items: [], hasMore: false };
  switch (cat) {
    case 'book':  return searchBooksPage(query.trim(), page);
    case 'movie': return searchMoviesPage(query.trim(), page);
    case 'drama': return searchTVPage(query.trim(), page);
    default:      return { items: [], hasMore: false };
  }
}

async function searchBooks(query) {
  try {
    const res = await fetch(
      `/api/naver-search?query=${encodeURIComponent(query)}&display=5`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(item => ({
      title:       strip(item.title),
      creator:     strip(item.author),
      coverUrl:    item.image || null,
      externalRef: `naver:book:${item.isbn}`,
      sub:         item.publisher || null,
    }));
  } catch {
    return [];
  }
}

async function searchMovies(query) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=ko-KR`,
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
  } catch {
    return [];
  }
}

async function searchTV(query) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&language=ko-KR`,
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
    const actors   = (data.cast || []).slice(0, 2).map(c => c.name);
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
