import { db } from './index.js';

const LEGACY_KEY = 'seen-and-read-records';

const CAT_COLORS = {
  book:     { cover_color: '#E9DCC0', cover_fg: '#221C14' },
  movie:    { cover_color: '#C97A4A', cover_fg: '#fff' },
  drama:    { cover_color: '#7E6BA8', cover_fg: '#fff' },
  exhibit:  { cover_color: '#5E6B5A', cover_fg: '#fff' },
  stage:    { cover_color: '#B5483C', cover_fg: '#FBBE2C' },
  concert:  { cover_color: '#C97A7A', cover_fg: '#fff' },
  festival: { cover_color: '#7FBFA0', cover_fg: '#221C14' },
  sports:   { cover_color: '#6E80D8', cover_fg: '#fff' },
  etc:      { cover_color: '#8A7F72', cover_fg: '#fff' },
};

const CAT_REMAP = { musical: 'stage', play: 'stage', ott: 'drama' };

export async function migrateFromLocalStorage() {
  const already = await db.titles.count();
  if (already > 0) return;

  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return;

  let records;
  try { records = JSON.parse(raw); }
  catch { return; }

  const now = Date.now();

  for (const rec of records) {
    const titleId = crypto.randomUUID();
    const cat = CAT_REMAP[rec.cat] ?? rec.cat;
    const colors = CAT_COLORS[cat] || { cover_color: '#ccc', cover_fg: '#000' };

    await db.transaction('rw', db.titles, db.logs, db.quotes, async () => {
      await db.titles.add({
        id: titleId,
        category: cat,
        title: rec.title,
        creator: rec.creator || null,
        cover_color: rec.cover || colors.cover_color,
        cover_fg: rec.coverFg || colors.cover_fg,
        external_ref: null,
        meta: null,
        created_at: now,
      });

      // 회차 기록이 있으면 각각 log로, 없으면 단일 log 1개
      const srcLogs = rec.logs?.length > 0
        ? [...rec.logs].sort((a, b) => a.n - b.n)   // 오래된 순
        : [{ n: 1, place: rec.place, rating: rec.rating, note: rec.note }];

      for (let i = 0; i < srcLogs.length; i++) {
        const lg = srcLogs[i];
        const logId = crypto.randomUUID();

        await db.logs.add({
          id: logId,
          title_id: titleId,
          n: lg.n ?? i + 1,
          status: rec.status || 'done',
          rating: lg.rating ?? rec.rating ?? 0,
          date_single: null,
          date_start: rec.span?.start || null,
          date_end: rec.span?.end || null,
          progress: rec.span?.current || null,
          one_liner: lg.note || rec.note || null,
          note: null,
          place: lg.place || rec.place || null,
          place_geo: null,
          companions: rec.with ? rec.with.split(', ').filter(Boolean) : [],
          tags: rec.tags || [],
          created_at: now - (srcLogs.length - 1 - i) * 1000,
        });

        if ((lg.n ?? i + 1) === 1 && rec.quote) {
          await db.quotes.add({
            id: crypto.randomUUID(),
            log_id: logId,
            text: rec.quote,
            page: null,
          });
        }
      }
    });
  }

  console.log(`[seen-and-read] localStorage → IndexedDB 마이그레이션 완료 (${records.length}개)`);
}
