export default async function handler(req, res) {
  const { query, x, y } = req.query;
  const key = process.env.VITE_KAKAO_REST_KEY;

  try {
    let url;
    if (x && y) {
      url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${x}&y=${y}`;
    } else if (query) {
      url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`;
    } else {
      return res.status(400).json({ error: 'query or coordinates required' });
    }

    const response = await fetch(url, {
      headers: { Authorization: `KakaoAK ${key}` },
    });
    if (!response.ok) return res.status(response.status).json({ error: 'Kakao API error' });
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ error: 'server error' });
  }
}
