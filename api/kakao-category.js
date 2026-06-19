export default async function handler(req, res) {
  const { x, y, radius = 2000 } = req.query;
  if (!x || !y) return res.status(400).json({ error: 'x and y required' });

  const key = process.env.VITE_KAKAO_REST_KEY;
  const headers = { Authorization: `KakaoAK ${key}` };
  const base = `https://dapi.kakao.com/v2/local/search/category.json?x=${x}&y=${y}&radius=${radius}&sort=distance&size=10`;

  const [ct1, at4, ce7, fd6] = await Promise.all([
    fetch(`${base}&category_group_code=CT1`, { headers }).then(r => r.json()),
    fetch(`${base}&category_group_code=AT4`, { headers }).then(r => r.json()),
    fetch(`${base}&category_group_code=CE7`, { headers }).then(r => r.json()),
    fetch(`${base}&category_group_code=FD6`, { headers }).then(r => r.json()),
  ]);

  const documents = [
    ...(ct1.documents || []),
    ...(at4.documents || []),
    ...(ce7.documents || []),
    ...(fd6.documents || []),
  ];
  res.json({ documents });
}
