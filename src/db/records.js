import { db } from './index.js';

// ── 날짜 헬퍼 ────────────────────────────────────────────────

function relativeDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dayMs   = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (dayMs === todayMs) return '오늘';
  if (dayMs === todayMs - 86400000) return '어제';
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function whenString(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtIso(iso) {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── 뷰 빌더 ──────────────────────────────────────────────────
// DB 행(log + title + quotes + siblings)을 UI RecordView 객체로 변환

function buildView(log, title, quotes, siblings) {
  const longForm = ['book', 'drama', 'etc'].includes(title.category);

  const view = {
    id:       log.id,
    titleId:  title.id,
    cat:      title.category,
    title:    title.title,
    creator:  title.creator,
    cover:    title.cover_color,
    coverFg:  title.cover_fg,
    coverUrl: title.meta?.coverUrl || null,
    status:   log.status,
    rating:   log.rating,
    n:        log.n,
    times:    siblings.length,
    place:    log.place   || null,
    note:     log.one_liner || null,
    with:     log.companions?.length ? log.companions.join(', ') : null,
    tags:     log.tags    || [],
    quote:    quotes.sort((a,b) => (a.seq??0)-(b.seq??0))[0]?.text || null,
    quotes:   quotes.sort((a,b) => (a.seq??0)-(b.seq??0)).map(q => q.text),
    when:      fmtIso(log.date_single) || fmtIso(log.date_start) || log.date_start || whenString(log.created_at),
    date:      relativeDate(log.created_at),
    rawSingle: log.date_single || null,
    rawStart:  log.date_start  || null,
    rawEnd:    log.date_end    || null,
  };

  if (longForm && (log.date_start || log.date_end)) {
    view.span = {
      start: fmtIso(log.date_start) || log.date_start || null,
      end:   fmtIso(log.date_end)   || log.date_end   || null,
      days:  null,
      current: log.progress || null,
    };
  }

  // 2차 이상 기록이면 회차 타임라인 추가 (최신순)
  if (siblings.length > 1) {
    view.logs = [...siblings]
      .sort((a, b) => b.n - a.n)
      .map(l => ({
        id:     l.id,
        n:      l.n,
        date:   l.date_single
          ? fmtIso(l.date_single)
          : l.date_start
            ? (l.date_end ? `${l.date_start} ~ ${l.date_end}` : `${l.date_start} ~ 진행 중`)
            : whenString(l.created_at),
        place:  l.place,
        rating: l.rating,
        note:   l.one_liner,
      }));
  }

  return view;
}

// ── 읽기 ─────────────────────────────────────────────────────

// 피드 전체 (title당 최신 log 1개, 최신순)
export async function fetchAllRecordViews() {
  const allLogs = await db.logs.orderBy('created_at').reverse().toArray();

  // title당 가장 최신 log만 추출
  const seen = new Set();
  const latestLogs = allLogs.filter(l => {
    if (seen.has(l.title_id)) return false;
    seen.add(l.title_id);
    return true;
  });

  if (latestLogs.length === 0) return [];

  // 배치 조회 (N+1 방지)
  const titleIds = latestLogs.map(l => l.title_id);
  const titles   = await db.titles.bulkGet(titleIds);
  const titleMap = new Map(titles.filter(Boolean).map(t => [t.id, t]));

  const logIds    = latestLogs.map(l => l.id);
  const allQuotes = await db.quotes.where('log_id').anyOf(logIds).toArray();
  const quoteMap  = new Map();
  allQuotes.forEach(q => {
    if (!quoteMap.has(q.log_id)) quoteMap.set(q.log_id, []);
    quoteMap.get(q.log_id).push(q);
  });

  const siblingMap = new Map();
  allLogs.forEach(l => {
    if (!siblingMap.has(l.title_id)) siblingMap.set(l.title_id, []);
    siblingMap.get(l.title_id).push(l);
  });

  return latestLogs
    .map(log => {
      const title = titleMap.get(log.title_id);
      if (!title) return null;
      return buildView(
        log,
        title,
        quoteMap.get(log.id) || [],
        siblingMap.get(log.title_id) || [log],
      );
    })
    .filter(Boolean);
}

// 단일 log 뷰 (DetailPage용)
export async function fetchRecordView(logId) {
  const log = await db.logs.get(logId);
  if (!log) return null;
  const title = await db.titles.get(log.title_id);
  if (!title) return null;
  const quotes   = await db.quotes.where('log_id').equals(logId).toArray();
  const siblings = await db.logs.where('title_id').equals(log.title_id).toArray();
  return buildView(log, title, quotes, siblings);
}

// ── 카테고리 색상 ─────────────────────────────────────────────

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

// ── 쓰기 ─────────────────────────────────────────────────────

// RecordScreen handleSave의 base 객체를 받아 DB에 저장
export async function findExistingByRef(externalRef) {
  if (!externalRef) return null;
  const title = await db.titles.where('external_ref').equals(externalRef).first();
  if (!title) return null;
  const logs = await db.logs.where('title_id').equals(title.id).toArray();
  return { ...title, logCount: logs.length };
}

export async function saveNewRecord(base) {
  const { cat, title, creator, status, rating, note, quotes, tags, with: withStr, place, span, dateSingle, externalRef, coverUrl, times } = base;
  const colors   = CAT_COLORS[cat] || {};
  const longForm = ['book', 'drama', 'etc'].includes(cat);
  const now      = Date.now();
  const titleId  = crypto.randomUUID();
  const logId    = crypto.randomUUID();

  await db.transaction('rw', db.titles, db.logs, db.quotes, async () => {
    await db.titles.add({
      id: titleId,
      category:    cat,
      title:       title?.trim() || '',
      creator:     creator?.trim() || null,
      cover_color: colors.cover_color,
      cover_fg:    colors.cover_fg,
      external_ref: externalRef || null,
      meta:         coverUrl ? { coverUrl } : null,
      created_at:   now,
    });

    await db.logs.add({
      id:          logId,
      title_id:    titleId,
      n:           times ?? 1,
      status:      status || null,
      rating:      rating ?? 0,
      date_single: !longForm ? (dateSingle || null) : null,
      date_start:  longForm ? (span?.start || null) : null,
      date_end:    longForm ? (span?.end   || null) : null,
      progress:    null,
      one_liner:   note?.trim() || null,
      note:        null,
      place:       place || null,
      place_geo:   null,
      companions:  withStr ? withStr.split(', ').filter(Boolean) : [],
      tags:        tags || [],
      created_at:  now,
    });

    let seq = 0;
    for (const q of (quotes || [])) {
      if (q?.trim()) await db.quotes.add({ id: crypto.randomUUID(), log_id: logId, text: q.trim(), seq: seq++, page: null });
    }
  });
}

// 기존 log + title 수정
export async function updateRecord(logId, patch) {
  const log = await db.logs.get(logId);
  if (!log) return;

  const { cat, title, creator, status, rating, note, quotes, tags, with: withStr, place, span, dateSingle, externalRef, coverUrl } = patch;
  const colors   = cat ? CAT_COLORS[cat] : {};
  const longForm = ['book', 'drama', 'etc'].includes(cat);

  await db.transaction('rw', db.titles, db.logs, db.quotes, async () => {
    const titlePatch = {
      ...(cat      && { category: cat }),
      ...(title    && { title: title.trim() }),
      ...(creator !== undefined && { creator: creator?.trim() || null }),
      ...(colors.cover_color && { cover_color: colors.cover_color }),
      ...(colors.cover_fg    && { cover_fg:    colors.cover_fg    }),
      ...(externalRef !== undefined && { external_ref: externalRef || null }),
      ...(coverUrl    !== undefined && { meta: coverUrl ? { coverUrl } : null }),
    };
    if (Object.keys(titlePatch).length) await db.titles.update(log.title_id, titlePatch);

    await db.logs.update(logId, {
      status,
      rating,
      one_liner:   note?.trim() || null,
      place:       place || null,
      companions:  withStr ? withStr.split(', ').filter(Boolean) : [],
      tags:        tags || [],
      date_single: !longForm ? (dateSingle || null) : null,
      date_start:  longForm ? (span?.start || null) : null,
      date_end:    longForm ? (span?.end   || null) : null,
    });

    await db.quotes.where('log_id').equals(logId).delete();
    let seq = 0;
    for (const q of (quotes || [])) {
      if (q?.trim()) await db.quotes.add({ id: crypto.randomUUID(), log_id: logId, text: q.trim(), seq: seq++, page: null });
    }
  });
}

// log 삭제 (마지막 log면 title도 삭제)
export async function deleteRecord(logId) {
  const log = await db.logs.get(logId);
  if (!log) return;
  const count = await db.logs.where('title_id').equals(log.title_id).count();

  await db.transaction('rw', db.titles, db.logs, db.quotes, async () => {
    await db.quotes.where('log_id').equals(logId).delete();
    await db.logs.delete(logId);
    if (count === 1) await db.titles.delete(log.title_id);
  });
}

// 새 회차 추가 (LogSheet 저장)
export async function addReplayLog(titleId, currentTimes, logData) {
  await db.logs.add({
    id:          crypto.randomUUID(),
    title_id:    titleId,
    n:           currentTimes + 1,
    status:      'done',
    rating:      logData.rating ?? 0,
    date_single: logData.date   || null,
    date_start:  null,
    date_end:    null,
    progress:    null,
    one_liner:   logData.note?.trim() || null,
    note:        null,
    place:       logData.place?.trim() || null,
    place_geo:   null,
    companions:  [],
    tags:        [],
    created_at:  Date.now(),
  });
}

export async function fetchRecentPeople() {
  return db.people.orderBy('used_at').reverse().limit(10).toArray();
}

export async function searchPeople(q) {
  return db.people.orderBy('used_at').reverse().filter(p => p.name.includes(q)).toArray();
}

export async function touchPerson(name) {
  const existing = await db.people.where('name').equals(name).first();
  if (existing) {
    await db.people.update(existing.id, { used_at: Date.now() });
  } else {
    await db.people.add({ id: crypto.randomUUID(), name, used_at: Date.now() });
    const count = await db.people.count();
    if (count > 50) {
      const oldest = await db.people.orderBy('used_at').limit(count - 50).toArray();
      await db.people.bulkDelete(oldest.map(p => p.id));
    }
  }
}

export async function deletePerson(name) {
  await db.people.where('name').equals(name).delete();
}
