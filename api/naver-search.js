export default async function handler(req, res) {
  const { query, display = 6 } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });

  const response = await fetch(
    `https://openapi.naver.com/v1/search/book.json?query=${encodeURIComponent(query)}&display=${display}`,
    {
      headers: {
        'X-Naver-Client-Id':     process.env.VITE_NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.VITE_NAVER_CLIENT_SECRET,
      },
    }
  );

  if (!response.ok) return res.status(response.status).json({ error: 'Naver API error' });
  const data = await response.json();
  res.json(data);
}
