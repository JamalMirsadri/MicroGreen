import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'db.json');

const DEFAULT_DB = {
  users: [],
  products: [],
  orders: [],
  userGardens: [],
  quizResults: [],
  siteContent: {},
  quizQuestions: [],
  gameConfig: {
    levels: [],
    dailyChallenges: [],
    badges: [],
    subscriptionTiers: [],
    identities: {},
  },
  integrations: {
    payments: {
      provider: 'stripe',
      enabled: false,
      mode: 'test',
      publicKey: '',
      webhookConfigured: false,
      currency: 'usd',
    },
    ai: {
      enabled: false,
      providers: [],
      recommendationPrompt: '',
      contentPrompt: '',
      supportPrompt: '',
    },
  },
};

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

export function readDb() {
  ensureDbFile();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

export function writeDb(db) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function newId() {
  return randomUUID();
}

export const ENTITY_MAP = {
  Product: 'products',
  Order: 'orders',
  UserGarden: 'userGardens',
  QuizResult: 'quizResults',
  User: 'users',
};

export const ADMIN_COLLECTIONS = [
  'users',
  'products',
  'orders',
  'userGardens',
  'quizResults',
  'siteContent',
  'quizQuestions',
  'gameConfig',
  'integrations',
];
