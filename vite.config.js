import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const kakaoKey = env.VITE_KAKAO_REST_KEY;

  return {
    plugins: [
      react(),
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
