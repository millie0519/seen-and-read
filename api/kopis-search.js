function getTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
}

function fmtDate(d) { return d ? d.slice(0, 7) : ''; }
function dateRange(from, to) {
  const f = fmtDate(from), t = fmtDate(to);
  if (!f) return '';
  return f === t ? f : `${f}~${t}`;
}

function parseKopisXml(xml) {
  const items = [];
  const re = /<db>([\s\S]*?)<\/db>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const b = m[1];
    const genre = getTag(b, 'genrenm');
    const range = dateRange(getTag(b, 'prfpdfrom'), getTag(b, 'prfpdto'));
    items.push({
      title:       getTag(b, 'prfnm'),
      creator:     null,
      coverUrl:    getTag(b, 'poster') || null,
      externalRef: `kopis:${getTag(b, 'mt20id')}`,
      sub:         range || null,
      genre,
    });
  }
  return items;
}

export default async function handler(req, res) {
  const { query, page = '1', rows = '20' } = req.query;
  if (!query) return res.status(400).json({ error: 'query required' });

  try {
    const apiUrl = `https://www.kopis.or.kr/openApi/restful/pblprfr?service=${process.env.VITE_KOPIS_KEY}&stdate=20000101&eddate=20991231&shprfnm=${encodeURIComponent(query)}&rows=${rows}&cpage=${page}`;
    const xml = await fetch(apiUrl).then(r => r.text());
    res.json({ items: parseKopisXml(xml) });
  } catch {
    res.status(500).json({ error: 'server error' });
  }
}
