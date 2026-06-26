import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const kakaoKey = env.VITE_KAKAO_REST_KEY;
  const kopisKey = env.VITE_KOPIS_KEY;

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

  return {
    plugins: [
      react(),
      {
        name: 'kopis-detail-middleware',
        configureServer(server) {
          server.middlewares.use('/api/kopis-detail', async (req, res) => {
            const url = new URL(req.url, 'http://localhost');
            const id  = url.searchParams.get('id') || '';
            try {
              const apiUrl = `https://www.kopis.or.kr/openApi/restful/pblprfr/${id}?service=${kopisKey}`;
              const xml    = await fetch(apiUrl).then(r => r.text());
              const cast   = getTag(xml, 'prfcast');
              const poster = getTag(xml, 'poster');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ cast: cast || null, poster: poster || null }));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'server error' }));
            }
          });
        },
      },
      {
        name: 'kopis-search-middleware',
        configureServer(server) {
          server.middlewares.use('/api/kopis-search', async (req, res) => {
            const url   = new URL(req.url, 'http://localhost');
            const query  = url.searchParams.get('query')  || '';
            const page   = url.searchParams.get('page')   || '1';
            const rows   = url.searchParams.get('rows')   || '20';
            try {
              const apiUrl = `https://www.kopis.or.kr/openApi/restful/pblprfr?service=${kopisKey}&stdate=20000101&eddate=20991231&shprfnm=${encodeURIComponent(query)}&rows=${rows}&cpage=${page}`;
              const xml = await fetch(apiUrl).then(r => r.text());
              const items = parseKopisXml(xml);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ items }));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'server error' }));
            }
          });
        },
      },
      {
        name: 'kakao-category-middleware',
        configureServer(server) {
          server.middlewares.use('/api/kakao-category', async (req, res) => {
            const url  = new URL(req.url, 'http://localhost');
            const x      = url.searchParams.get('x');
            const y      = url.searchParams.get('y');
            const radius = url.searchParams.get('radius') || '2000';
            const headers = { Authorization: `KakaoAK ${kakaoKey}` };
            const base = `https://dapi.kakao.com/v2/local/search/category.json?x=${x}&y=${y}&radius=${radius}&sort=distance&size=10`;
            try {
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
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ documents }));
            } catch {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'server error' }));
            }
          });
        },
      },
    ],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api/naver-search': {
          target: 'https://openapi.naver.com',
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/naver-search', '/v1/search/book.json'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-Naver-Client-Id',     env.VITE_NAVER_CLIENT_ID);
              proxyReq.setHeader('X-Naver-Client-Secret', env.VITE_NAVER_CLIENT_SECRET);
            });
          },
        },
        '/api/kakao-keyword': {
          target: 'https://dapi.kakao.com',
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/kakao-keyword', '/v2/local/search/keyword.json'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `KakaoAK ${kakaoKey}`);
            });
          },
        },
        '/api/kakao-geo': {
          target: 'https://dapi.kakao.com',
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/kakao-geo', '/v2/local/geo/coord2address.json'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `KakaoAK ${kakaoKey}`);
            });
          },
        },
      },
    },
  };
});
