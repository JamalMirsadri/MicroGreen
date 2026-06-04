import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDb, writeDb, newId } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'grow-verdant-local-dev-secret';
const JWT_EXPIRES = '7d';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-access-token'];
  if (!token) {
    req.user = null;
    return next();
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  const db = readDb();
  const user = db.users.find((u) => u.id === payload.sub);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  req.user = sanitizeUser(user);
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

export async function registerUser({ email, password, full_name }) {
  const db = readDb();
  const normalized = email?.toLowerCase().trim();
  if (!normalized || !password) {
    throw Object.assign(new Error('Email and password are required'), { status: 400 });
  }
  if (db.users.some((u) => u.email === normalized)) {
    throw Object.assign(new Error('Email already registered'), { status: 409 });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const user = {
    id: newId(),
    email: normalized,
    full_name: full_name || normalized.split('@')[0],
    password_hash,
    role: 'user',
    created_date: new Date().toISOString(),
  };
  db.users.push(user);
  const garden = {
    id: newId(),
    user_id: user.id,
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
  return { user: sanitizeUser(user), token: signToken(user) };
}

export async function loginUser({ email, password }) {
  const db = readDb();
  const normalized = email?.toLowerCase().trim();
  const user = db.users.find((u) => u.email === normalized);
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }
  return { user: sanitizeUser(user), token: signToken(user) };
}

export function getMe(userId) {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  return sanitizeUser(user);
}

export async function ensureDemoUser() {
  const db = readDb();
  const email = 'demo@garden.local';
  if (db.users.some((u) => u.email === email)) return;
  const password_hash = await bcrypt.hash('demo1234', 10);
  const user = {
    id: newId(),
    email,
    full_name: 'Demo Gardener',
    password_hash,
    role: 'user',
    created_date: new Date().toISOString(),
  };
  db.users.push(user);
  db.userGardens.push({
    id: newId(),
    user_id: user.id,
    xp: 45,
    level: 'sprout',
    streak_days: 3,
    badges: ['first_quiz'],
    completed_challenges: [],
    plants_grown: 1,
    total_orders: 0,
    identity_name: 'Energy Sprout',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  });
  writeDb(db);
}
