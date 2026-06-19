export default async function handler(req, res) {
  const { x, y } = req.query;
  if (!x || !y) return res.status(400).json({ error: 'x and y required' });

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${x}&y=${y}`,
    { headers: { Authorization: `KakaoAK ${process.env.VITE_KAKAO_REST_KEY}` } }
  );
  if (!response.ok) return res.status(response.status).json({ error: 'Kakao API error' });
  res.json(await response.json());
}
