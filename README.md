# 보고 읽고 본것들 — Vite + React

독서·영화·드라마·OTT·전시·뮤지컬·연극을 한 곳에 기록하는 앱.
디자인 프로토타입을 **Vite + React (웹)** 프로젝트로 옮긴 시작점입니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

브라우저에서 열면 됩니다. 의존성은 `react`, `react-dom`, `vite`, `@vitejs/plugin-react`뿐입니다.

## 레이아웃

모바일 퍼스트 · 최대 너비 500px 고정 · 그 이하에서는 100% 반응형.
`src/index.css`의 `.app` 규칙에서 관리합니다.

```css
.app {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
  height: 100dvh;   /* 내부에서 .screen 이 스크롤 */
  ...
}
```

## 폴더 구조

```
src/
├── main.jsx              앱 진입점 (ReactDOM)
├── App.jsx               탭 전환 + 오버레이(상세/기록/검색) 라우팅
├── index.css             디자인 시스템 + 레이아웃 (CSS 변수 토큰)
├── data.js               샘플 데이터 + 카테고리 메타 (CATS, FEED …)
├── components/
│   └── ui.jsx            Icon, Stars, CatChip, Poster, Squiggle,
│                         SectionHead, StatusPills + 공유 스타일
└── screens/
    ├── Home.jsx          홈 — SNS형 피드
    ├── Library.jsx       책장 — 카테고리 그리드/책장
    ├── Record.jsx        기록 작성 (+ 장소·사람 시트)
    ├── Profile.jsx       마이페이지 + 상세 페이지(DetailPage)
    └── Search.jsx        검색
```

## 디자인 토큰

색·폰트·둥근모서리·그림자는 모두 `src/index.css`의 `:root` CSS 변수입니다.
상태 색(`--status-done/watching/dropped/times`)은 테마와 무관한 고정값이에요.

## 다음 단계 (연동 지점)

- **작품 정보 검색**: TMDB(영화·드라마), 알라딘/네이버(책), KOPIS(공연) — `Record.jsx`의 "제목으로 찾기"
- **장소 검색**: Apple MapKit / Google Places / 카카오맵 — `Record.jsx`의 `PlaceSheet`
- **저장·동기화**: Supabase 등 — 현재 `data.js`의 더미 데이터를 교체
- **로그인**: 로컬 우선, 계정은 선택 — `Profile.jsx`의 백업 권유 카드
- **결산**: 연간 통계 페이지 (미구현, `Profile.jsx`의 결산 티저에서 연결 예정)

## 참고

- 표지·포스터·일러스트는 색 블록 placeholder입니다. 실제 이미지(API/사진)로 교체하세요.
- 프로토타입의 Tweaks 패널은 제외했습니다(기본 테마가 `:root`에 적용됨).
- 모든 스타일은 인라인 객체 + CSS 변수라 그대로 동작합니다.
