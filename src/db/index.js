import Dexie from 'dexie';

export const db = new Dexie('seen-and-read');

db.version(1).stores({
  titles:  'id, category, created_at',
  logs:    'id, title_id, created_at, status, *tags',
  quotes:  'id, log_id',
  people:  'id, &name',
});

db.version(2).stores({
  titles:  'id, category, created_at',
  logs:    'id, title_id, created_at, status, *tags',
  quotes:  'id, log_id, seq',
  people:  'id, &name',
});

db.version(3).stores({
  titles:  'id, category, created_at',
  logs:    'id, title_id, created_at, status, *tags',
  quotes:  'id, log_id, seq',
  people:  'id, &name, used_at',
});

db.version(4).stores({
  titles:  'id, category, created_at, external_ref',
  logs:    'id, title_id, created_at, status, *tags',
  quotes:  'id, log_id, seq',
  people:  'id, &name, used_at',
});
