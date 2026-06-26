function getTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
}

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const apiUrl = `https://www.kopis.or.kr/openApi/restful/pblprfr/${id}?service=${process.env.VITE_KOPIS_KEY}`;
    const xml    = await fetch(apiUrl).then(r => r.text());
    const cast   = getTag(xml, 'prfcast');
    const poster = getTag(xml, 'poster');
    res.json({ cast: cast || null, poster: poster || null });
  } catch {
    res.status(500).json({ error: 'server error' });
  }
}
