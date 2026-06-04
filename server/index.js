import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedDatabase } from './seed.js';
import {
  authMiddleware,
  registerUser,
  loginUser,
  getMe,
  ensureDemoUser,
  requireAuth,
} from './auth.js';
import {
  listEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  getOrCreateGarden,
} from './entities.js';
import { readDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const APP_ID = process.env.VITE_BASE44_APP_ID || 'local-grow-verdant';

seedDatabase();
await ensureDemoUser();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'grow-verdant-api' });
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
app.get('/api/admin/stats', authMiddleware, (_req, res) => {
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

app.listen(PORT, () => {
  console.log(`Grow Verdant API running at http://localhost:${PORT}`);
  console.log(`Demo login: demo@garden.local / demo1234`);
});
