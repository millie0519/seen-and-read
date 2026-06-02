import Dexie from 'dexie';

export const db = new Dexie('seen-and-read');

db.version(1).stores({
  titles:  'id, category, created_at',
  logs:    'id, title_id, created_at, status, *tags',
  quotes:  'id, log_id',
  people:  'id, &name',
});
