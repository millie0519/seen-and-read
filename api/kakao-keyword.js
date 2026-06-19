export default async function handler(req, res) {
  const { query, size = 10 } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=${size}`,
    { headers: { Authorization: `KakaoAK ${process.env.VITE_KAKAO_REST_KEY}` } }
  );
  if (!response.ok) return res.status(response.status).json({ error: 'Kakao API error' });
  res.json(await response.json());
}
