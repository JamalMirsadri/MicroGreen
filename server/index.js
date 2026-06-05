import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import { seedDatabase } from './seed.js';
import {
  authMiddleware,
  registerUser,
  loginUser,
  getMe,
  ensureDemoUser,
  ensureAdminUser,
  requireAuth,
  requireAdmin,
} from './auth.js';
import {
  listEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  getOrCreateGarden,
} from './entities.js';
import { ADMIN_COLLECTIONS, newId, readDb, writeDb } from './db.js';
import { createCheckoutSession, getCheckoutSession, handleWebhook, isStripeEnabled } from './checkout.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT   = process.env.PORT || 3001;
const APP_ID = process.env.VITE_BASE44_APP_ID || 'local-grow-verdant';

// ── Multer: image uploads ──────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const safe = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
      cb(null, safe);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\//i.test(file.mimetype));
  },
});

seedDatabase();
await ensureDemoUser();
await ensureAdminUser();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Base44-compatible public settings (auth optional for local dev)
app.get('/api/apps/public/prod/public-settings/by-id/:appId', (req, res) => {
  res.json({
    id: req.params.appId || APP_ID,
    name: 'Inner Garden',
    public_settings: {
      auth_required: false,
      allow_guest: true,
    },
  });
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(req.user);
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true });
});

function sanitizeAdminDb(db) {
  return {
    ...db,
    users: db.users.map(({ password_hash, ...user }) => user),
  };
}

function ensureCollection(name) {
  if (!ADMIN_COLLECTIONS.includes(name)) {
    const err = new Error('Unknown admin collection');
    err.status = 404;
    throw err;
  }
}

function upsertCollectionRecord(collection, payload, id = null) {
  const db = readDb();
  ensureCollection(collection);
  if (!Array.isArray(db[collection])) {
    throw Object.assign(new Error('Collection is not record-based'), { status: 400 });
  }

  const now = new Date().toISOString();
  if (id) {
    const idx = db[collection].findIndex((item) => item.id === id);
    if (idx === -1) throw Object.assign(new Error('Record not found'), { status: 404 });
    db[collection][idx] = { ...db[collection][idx], ...payload, id, updated_date: now };
    writeDb(db);
    return db[collection][idx];
  }

  const record = {
    id: payload.id || newId(),
    created_date: now,
    updated_date: now,
    ...payload,
  };
  db[collection].push(record);
  writeDb(db);
  return record;
}

// Admin management API
app.get('/api/admin/me', authMiddleware, requireAdmin, (req, res) => {
  res.json(req.user);
});

app.get('/api/admin/overview', authMiddleware, requireAdmin, (_req, res) => {
  const db = sanitizeAdminDb(readDb());
  res.json({
    collections: ADMIN_COLLECTIONS,
    counts: {
      users: db.users.length,
      products: db.products.length,
      orders: db.orders.length,
      userGardens: db.userGardens.length,
      quizResults: db.quizResults.length,
    },
    siteContent: db.siteContent,
    integrations: db.integrations,
    gameConfig: db.gameConfig,
    quizQuestions: db.quizQuestions,
  });
});

app.get('/api/admin/collections/:collection', authMiddleware, requireAdmin, (req, res) => {
  try {
    const { collection } = req.params;
    ensureCollection(collection);
    const db = sanitizeAdminDb(readDb());
    res.json(db[collection]);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app.put('/api/admin/collections/:collection', authMiddleware, requireAdmin, (req, res) => {
  try {
    const { collection } = req.params;
    ensureCollection(collection);
    const db = readDb();
    db[collection] = req.body;
    writeDb(db);
    res.json(sanitizeAdminDb(readDb())[collection]);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/admin/collections/:collection', authMiddleware, requireAdmin, (req, res) => {
  try {
    const record = upsertCollectionRecord(req.params.collection, req.body);
    const { password_hash, ...safeRecord } = record;
    res.status(201).json(safeRecord);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app.patch('/api/admin/collections/:collection/:id', authMiddleware, requireAdmin, (req, res) => {
  try {
    const record = upsertCollectionRecord(req.params.collection, req.body, req.params.id);
    const { password_hash, ...safeRecord } = record;
    res.json(safeRecord);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app.delete('/api/admin/collections/:collection/:id', authMiddleware, requireAdmin, (req, res) => {
  try {
    const { collection, id } = req.params;
    ensureCollection(collection);
    const db = readDb();
    if (!Array.isArray(db[collection])) {
      return res.status(400).json({ message: 'Collection is not record-based' });
    }
    const before = db[collection].length;
    db[collection] = db[collection].filter((item) => item.id !== id);
    if (db[collection].length === before) return res.status(404).json({ message: 'Record not found' });
    writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

app.post('/api/admin/ai/test', authMiddleware, requireAdmin, (req, res) => {
  const { provider, prompt } = req.body || {};
  res.json({
    ok: true,
    provider: provider || 'mock',
    message: 'AI provider configuration saved. Add API keys in Render environment variables before enabling live calls.',
    preview: `Configured prompt: ${(prompt || '').slice(0, 160)}`,
  });
});

app.post('/api/admin/payments/test', authMiddleware, requireAdmin, (_req, res) => {
  res.json({
    ok: true,
    message: 'Payment configuration saved. Add Stripe keys and webhook handling before charging real customers.',
  });
});

// Garden helpers (account required)
app.get('/api/garden', authMiddleware, requireAuth, (req, res) => {
  const garden = getOrCreateGarden(req.user.id, null);
  res.json(garden);
});

app.patch('/api/garden', authMiddleware, requireAuth, (req, res) => {
  const garden = getOrCreateGarden(req.user.id, null);
  const updated = updateEntity('UserGarden', garden.id, req.body, req.user.id);
  if (!updated || updated.forbidden) {
    return res.status(updated?.forbidden ? 403 : 404).json({ message: 'Update failed' });
  }
  res.json(updated);
});

// Entity CRUD
const entityNames = ['Product', 'Order', 'UserGarden', 'QuizResult', 'User'];

entityNames.forEach((name) => {
  const slug = name.toLowerCase();

  app.get(`/api/entities/${slug}`, authMiddleware, (req, res) => {
    const items = listEntities(name, {
      filter: req.query,
      userId: req.user?.id,
      sort: req.query.sort,
      limit: req.query.limit,
    });
    if (items === null) return res.status(404).json({ message: 'Unknown entity' });
    res.json(items);
  });

  app.post(`/api/entities/${slug}/filter`, authMiddleware, (req, res) => {
    const { filter, sort, limit } = req.body || {};
    const items = listEntities(name, { filter, userId: req.user?.id, sort, limit });
    if (items === null) return res.status(404).json({ message: 'Unknown entity' });
    res.json(items);
  });

  app.get(`/api/entities/${slug}/:id`, authMiddleware, (req, res) => {
    const item = getEntity(name, req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  });

  app.post(`/api/entities/${slug}`, authMiddleware, (req, res) => {
    const item = createEntity(name, req.body, req.user?.id);
    if (!item) return res.status(404).json({ message: 'Unknown entity' });
    res.status(201).json(item);
  });

  app.patch(`/api/entities/${slug}/:id`, authMiddleware, (req, res) => {
    const item = updateEntity(name, req.params.id, req.body, req.user?.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    if (item.forbidden) return res.status(403).json({ message: 'Forbidden' });
    res.json(item);
  });

  app.delete(`/api/entities/${slug}/:id`, authMiddleware, (req, res) => {
    const ok = deleteEntity(name, req.params.id, req.user?.id);
    if (!ok) return res.status(404).json({ message: 'Not found' });
    if (ok.forbidden) return res.status(403).json({ message: 'Forbidden' });
    res.json({ success: true });
  });
});

// Admin stats
app.get('/api/admin/stats', authMiddleware, requireAdmin, (_req, res) => {
  const db = readDb();
  const identityCounts = {};
  db.quizResults.forEach((q) => {
    const name = q.identity_name || 'Unknown';
    identityCounts[name] = (identityCounts[name] || 0) + 1;
  });
  const identityData = Object.entries(identityCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    const count = db.quizResults.filter((q) => q.created_date?.startsWith(day)).length;
    last7.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      completions: count,
    });
  }

  res.json({
    stats: {
      totalUsers: db.users.length,
      orders: db.orders.length,
      quizCompletions: db.quizResults.length,
      subscriptions: db.orders.filter((o) => o.subscription_tier).length,
      badgesEarned: db.userGardens.reduce((sum, g) => sum + (g.badges?.length || 0), 0),
      avgStreak:
        db.userGardens.length > 0
          ? (
              db.userGardens.reduce((s, g) => s + (g.streak_days || 0), 0) /
              db.userGardens.length
            ).toFixed(1)
          : '0',
    },
    quizData: last7,
    identityData: identityData.length ? identityData : [
      { name: 'Energy Sprout', value: 1 },
      { name: 'Calm Leaf', value: 1 },
    ],
    revenueData: [
      { name: 'Week 1', revenue: db.orders.slice(0, 3).reduce((s, o) => s + (o.total || 0), 0) },
      { name: 'Week 2', revenue: db.orders.slice(3, 6).reduce((s, o) => s + (o.total || 0), 0) },
      { name: 'Week 3', revenue: db.orders.slice(6, 9).reduce((s, o) => s + (o.total || 0), 0) },
      { name: 'Week 4', revenue: db.orders.slice(9).reduce((s, o) => s + (o.total || 0), 0) },
    ],
  });
});

// ─── Uploads: serve static + upload endpoint ──────────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR));

app.post('/api/upload/image', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// ─── Profile: client shipping details ─────────────────────────────────────────
app.get('/api/profile', requireAuth, (req, res) => {
  const db   = readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password_hash, ...safe } = user;
  res.json(safe);
});

app.patch('/api/profile', requireAuth, (req, res) => {
  const ALLOWED = [
    'full_name', 'phone', 'nif', 'birthday',
    'shipping_address',  // object: street, city, state, postal_code, country
    'billing_address',
  ];
  const db  = readDb();
  const idx = db.users.findIndex((u) => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });

  const update = {};
  for (const key of ALLOWED) {
    if (key in req.body) update[key] = req.body[key];
  }
  db.users[idx] = { ...db.users[idx], ...update, updated_date: new Date().toISOString() };
  writeDb(db);

  const { password_hash, ...safe } = db.users[idx];
  res.json(safe);
});

// ─── Stripe Checkout ──────────────────────────────────────────────────────────
// Webhook must receive raw body for signature verification
app.post('/api/checkout/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Stripe availability check
app.get('/api/checkout/status', (_req, res) => {
  res.json({ stripe_enabled: isStripeEnabled() });
});

// Create checkout session (cart → Stripe hosted page)
app.post('/api/checkout/create-session', authMiddleware, createCheckoutSession);

// Retrieve session (success page verification)
app.get('/api/checkout/session/:sessionId', authMiddleware, getCheckoutSession);

// ─── Recommendations ──────────────────────────────────────────────────────────
// Recommend products by quiz mood/goal
app.post('/api/recommendations', authMiddleware, (req, res) => {
  const { mood, goal, need } = req.body || {};
  const products = listEntities('Product', {}) || [];
  const scored = products.map((p) => {
    let score = 0;
    if (mood && p.mood_match?.some((m) => m === mood || m === 'all')) score += 2;
    if (goal && p.goal_match?.some((g) => g === goal || g === 'all')) score += 2;
    if (need && p.goal_match?.some((g) => g === need || g === 'all')) score += 1;
    if (p.is_featured) score += 1;
    return { ...p, _score: score };
  });
  scored.sort((a, b) => b._score - a._score);
  res.json(scored.slice(0, 6).map(({ _score, ...p }) => p));
});

// Serve Vite build in production (Render single Web Service)
const distPath = path.join(__dirname, '..', 'dist');
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !fs.existsSync(path.join(distPath, 'index.html'))) {
  console.error('ERROR: dist/index.html missing. Run "npm run build" before start.');
}
if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath, { index: false }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Grow Verdant running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Demo login: demo@garden.local / demo1234`);
  }
});
