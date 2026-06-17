// data.jsx — sample records + category meta for the prototype

const CATS = {
  book:     { ko: '책',          en: 'Book',     icon: 'book',        color: 'var(--coral)' },
  movie:    { ko: '영화',        en: 'Movie',    icon: 'film',        color: 'var(--sky)' },
  drama:    { ko: '시리즈',      en: 'Series',   icon: 'tv',          color: 'var(--grape)' },
  exhibit:  { ko: '전시',        en: 'Exhibit',  icon: 'frame',       color: 'var(--yellow)' },
  stage:    { ko: '연극/뮤지컬', en: 'Stage',    icon: 'mask',        color: 'var(--pink)' },
  concert:  { ko: '음악',        en: 'Concert',  icon: 'music',       color: 'var(--coral-d)' },
  sports:   { ko: '스포츠',      en: 'Sports',   icon: 'stadium',     color: 'var(--sky-d)' },
  festival: { ko: '축제',        en: 'Festival', icon: 'celebration', color: 'var(--mint)' },
  etc:      { ko: '기타',        en: 'Etc',      icon: 'more',        color: 'var(--ink-soft)' },
};

// cover = solid placeholder color (real art comes from API later)
const FEED = [
  {
    id: 'r1', cat: 'book', title: '작별인사', creator: '김영하',
    cover: '#E9DCC0', coverFg: '#221C14', date: '오늘', when: '5월 26일 · 밤 11:20',
    span: { start: '5월 19일', end: '5월 26일', days: 8 }, status: 'done', times: 1,
    rating: 5, place: '집',
    note: '마지막 장에서 한참을 멈춰있었다. 책을 덮고도 한참.\nSF지만 결국 가장 인간적인 소설.',
    quote: '사람은 결국 자기가 살아온 방식으로 떠나간다.',
    tags: ['SF', '한국문학', '올해최고'], with: null,
  },
  {
    id: 'r2', cat: 'movie', title: '듄: 파트 투', creator: '드니 빌뇌브',
    cover: '#C97A4A', coverFg: '#fff', date: '오늘', when: '5월 26일 · 저녁 7:30',
    status: 'done', times: 3,
    rating: 5, place: 'CGV 용산 IMAX',
    note: 'IMAX로 또 봤다. 세 번째인데도 사막의 소리가 온몸을 흔든다.',
    quote: null, tags: ['SF', '재관람'], with: '혼자',
    // 반자동으로 묶인 회차 기록 (최신순)
    logs: [
      { n: 3, date: '2026.05.26', place: 'CGV 용산 IMAX', rating: 5, note: 'IMAX로 또. 세 번째인데도 사막의 소리가 온몸을 흔든다.' },
      { n: 2, date: '2025.11.02', place: '집 · 넷플릭스', rating: 4, note: '집에서 복습. 역시 큰 화면이 그립다.' },
      { n: 1, date: '2024.03.15', place: '메가박스 코엑스', rating: 4, note: '첫 관람. 스케일에 압도당함.' },
    ],
  },
  {
    id: 'r3', cat: 'exhibit', title: '김창열 회고전', creator: '국립현대미술관',
    cover: '#5E6B5A', coverFg: '#fff', date: '어제', when: '5월 25일 · 오후 2:00',
    status: 'done', times: 1,
    rating: 4, place: '국립현대미술관 서울',
    note: '물방울 하나에 평생을 담은 사람. 가까이서 보면 진짜 물 같다.',
    quote: null, tags: ['현대미술', '회고전'], with: '엄마',
  },
  {
    id: 'r4', cat: 'drama', title: '폭싹 속았수다', creator: '넷플릭스 · 16부작',
    cover: '#7E6BA8', coverFg: '#fff', date: '5월 23일', when: '5월 23일 · 밤',
    span: { start: '5월 10일', end: null, days: 14, current: 11 }, status: 'watching', times: 1,
    rating: 5, place: '넷플릭스',
    note: '4화에서 결국 울었다. 제주 사투리가 이렇게 다정할 일인가.',
    quote: null, tags: ['한국드라마', '인생작'], with: null,
  },
  {
    id: 'r6', cat: 'book', title: '워앤더 폴드', creator: '한강',
    cover: '#3E5C8A', coverFg: '#fff', date: '5월 20일', when: '5월 20일 · 저녁',
    span: { start: '5월 12일', end: null, days: 9 }, status: 'dropped', times: 1,
    rating: 3, place: '카페',
    note: '문장은 아름다운데 지금은 손이 안 가서 잠시 멈춤. 나중에 다시.',
    quote: null, tags: ['한국문학'], with: null,
  },
  {
    id: 'r5', cat: 'stage', title: '하데스타운', creator: '블루스퀘어',
    cover: '#B5483C', coverFg: '#FBBE2C', date: '5월 18일', when: '5월 18일 · 오후 3:00',
    status: 'done', times: 3,
    rating: 5, place: '블루스퀘어 신한카드홀',
    note: 'Way Down Hadestown 떼창. 라이브의 압도적인 에너지.',
    quote: null, tags: ['뮤지컬', '재관람각'], with: '친구 둘',
  },
];

// library shelves
const SHELF_COUNTS = [
  { cat: 'book', n: 89 }, { cat: 'movie', n: 64 }, { cat: 'drama', n: 38 },
  { cat: 'exhibit', n: 18 }, { cat: 'stage', n: 14 },
  { cat: 'concert', n: 0 }, { cat: 'festival', n: 0 }, { cat: 'sports', n: 0 }, { cat: 'etc', n: 0 },
];

const SHELF_BOOKS = [
  { t: '작별인사', c: '#E9DCC0', fg:'#221C14' }, { t: '시선으로부터', c: '#C7506A', fg:'#fff' },
  { t: '달까지 가자', c: '#3E5C8A', fg:'#fff' }, { t: '소년이 온다', c: '#5E6B5A', fg:'#fff' },
  { t: '아주 희미한 빛', c: '#E0A53C', fg:'#221C14' }, { t: '파친코', c: '#8A4B3A', fg:'#fff' },
  { t: '불편한 편의점', c: '#6DB8DF', fg:'#221C14' }, { t: '7년의 밤', c: '#2E2A28', fg:'#fff' },
];
const SHELF_MOVIES = [
  { t: '듄2', c: '#C97A4A', fg:'#fff' }, { t: '패스트 라이브즈', c: '#3A4A6B', fg:'#fff' },
  { t: '추락의 해부', c: '#6B5A8A', fg:'#fff' }, { t: '존 오브 인터레스트', c: '#5E6B5A', fg:'#fff' },
];

export { CATS, FEED, SHELF_COUNTS, SHELF_BOOKS, SHELF_MOVIES };
