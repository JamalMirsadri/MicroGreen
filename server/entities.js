import { readDb, writeDb, newId, ENTITY_MAP } from './db.js';

function getCollection(db, entityName) {
  const key = ENTITY_MAP[entityName];
  if (!key) return null;
  return { key, items: db[key] };
}

function withTimestamps(data, isNew) {
  const now = new Date().toISOString();
  return {
    ...data,
    ...(isNew ? { created_date: now } : {}),
    updated_date: now,
  };
}

function coerceValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !Number.isNaN(Number(value)) && typeof value === 'string') {
    return Number(value);
  }
  return value;
}

function matchesFilter(item, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    value = coerceValue(value);
    if (Array.isArray(value)) {
      const field = item[key];
      if (Array.isArray(field)) return value.some((v) => field.includes(v));
      return value.includes(field);
    }
    return item[key] === value;
  });
}

export function listEntities(entityName, { filter, userId, sort, limit } = {}) {
  const db = readDb();
  const col = getCollection(db, entityName);
  if (!col) return null;

  let items = [...col.items];
  if (userId && ['orders', 'userGardens', 'quizResults'].includes(col.key)) {
    items = items.filter((i) => i.user_id === userId || !i.user_id);
  }
  if (filter && Object.keys(filter).length) {
    items = items.filter((i) => matchesFilter(i, filter));
  }
  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    items.sort((a, b) => {
      const av = a[field] ?? '';
      const bv = b[field] ?? '';
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
      return 0;
    });
  }
  if (limit) items = items.slice(0, Number(limit));
  return items;
}

export function getEntity(entityName, id) {
  const db = readDb();
  const col = getCollection(db, entityName);
  if (!col) return null;
  return col.items.find((i) => i.id === id) || null;
}

export function createEntity(entityName, data, userId) {
  const db = readDb();
  const col = getCollection(db, entityName);
  if (!col) return null;

  const record = withTimestamps(
    {
      id: newId(),
      ...(userId ? { user_id: userId } : {}),
      ...data,
    },
    true
  );
  db[col.key].push(record);
  writeDb(db);
  return record;
}

export function updateEntity(entityName, id, data, userId) {
  const db = readDb();
  const col = getCollection(db, entityName);
  if (!col) return null;

  const idx = col.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const existing = col.items[idx];
  if (userId && existing.user_id && existing.user_id !== userId) {
    return { forbidden: true };
  }
  const updated = withTimestamps({ ...existing, ...data }, false);
  db[col.key][idx] = updated;
  writeDb(db);
  return updated;
}

export function deleteEntity(entityName, id, userId) {
  const db = readDb();
  const col = getCollection(db, entityName);
  if (!col) return null;

  const idx = col.items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const existing = col.items[idx];
  if (userId && existing.user_id && existing.user_id !== userId) {
    return { forbidden: true };
  }
  db[col.key].splice(idx, 1);
  writeDb(db);
  return true;
}

export function getOrCreateGarden(userId, guestId) {
  const db = readDb();
  const ownerId = userId || guestId;
  if (!ownerId) return null;

  let garden = db.userGardens.find((g) => g.user_id === ownerId);
  if (!garden) {
    garden = {
      id: newId(),
      user_id: ownerId,
      xp: 0,
      level: 'seed',
      streak_days: 0,
      badges: [],
      completed_challenges: [],
      plants_grown: 0,
      total_orders: 0,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
    db.userGardens.push(garden);
    writeDb(db);
  }
  return garden;
}
