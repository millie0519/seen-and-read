export async function searchByCategory(cat, query) {
  if (!query || query.trim().length < 2) return [];
  switch (cat) {
    case 'book':  return searchBooks(query.trim());
    case 'movie': return searchMovies(query.trim());
    case 'drama': return searchTV(query.trim());
    default:      return [];
  }
}

async function searchBooks(query) {
  try {
    const res = await fetch(
      `/naver-api/v1/search/book.json?query=${encodeURIComponent(query)}&display=6`
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
    return (data.results || []).slice(0, 6).map(item => ({
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
    return (data.results || []).slice(0, 6).map(item => ({
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

function strip(str) {
  return str ? str.replace(/<[^>]+>/g, '').trim() : '';
}
