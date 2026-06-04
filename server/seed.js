import { readDb, writeDb, newId } from './db.js';

const PRODUCTS = [
  {
    name: 'Sunflower Microgreens',
    description: 'Bright and nutty microgreens bursting with energy and focus.',
    short_description: 'For energy & freshness',
    price: 8.99,
    image_url: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/b547e2a64_generated_c681fa81.png',
    category: 'microgreen',
    tags: ['Energy', 'Focus'],
    benefits: ['Energy boost', 'Vitamin E'],
    flavor_profile: 'fresh',
    mood_match: ['energetic', 'tired'],
    goal_match: ['energy', 'strength'],
    is_featured: true,
    stock_status: 'in_stock',
  },
  {
    name: 'Pea Shoot Medley',
    description: 'Light and sweet pea shoots for balance and calm.',
    short_description: 'For lightness & balance',
    price: 9.99,
    image_url: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/ea9216c36_generated_947800ff.png',
    category: 'mix',
    tags: ['Balance', 'Calm'],
    benefits: ['Iron', 'Folate'],
    flavor_profile: 'mild',
    mood_match: ['calm', 'stressed'],
    goal_match: ['calm', 'detox'],
    is_featured: true,
    stock_status: 'in_stock',
  },
  {
    name: 'Broccoli Microgreens',
    description: 'Packed with sulforaphane and wellness compounds.',
    short_description: 'For wellness support',
    price: 7.99,
    image_url: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/07a79e382_generated_1097796e.png',
    category: 'microgreen',
    tags: ['Detox', 'Glow'],
    benefits: ['Detox', 'Antioxidants'],
    flavor_profile: 'earthy',
    mood_match: ['calm', 'focused'],
    goal_match: ['detox', 'glow'],
    is_featured: true,
    stock_status: 'in_stock',
  },
  {
    name: 'Radish Microgreens',
    description: 'Bold and spicy microgreens for sharp vitality.',
    short_description: 'For sharpness & vitality',
    price: 8.49,
    image_url: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/320b82ee7_generated_aab9499a.png',
    category: 'microgreen',
    tags: ['Strength', 'Spicy'],
    benefits: ['Vitality', 'Spicy compounds'],
    flavor_profile: 'spicy',
    mood_match: ['energetic', 'focused'],
    goal_match: ['energy', 'strength'],
    is_featured: true,
    stock_status: 'in_stock',
  },
  {
    name: 'Basil Microgreens',
    description: 'Aromatic and calming greens to nourish your focus.',
    short_description: 'Aromatic focus support',
    price: 9.49,
    image_url: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/354c53419_generated_c2de60a2.png',
    category: 'microgreen',
    tags: ['Focus', 'Calm'],
    benefits: ['Focus', 'Calm'],
    flavor_profile: 'fresh',
    mood_match: ['focused', 'calm'],
    goal_match: ['calm', 'glow'],
    is_featured: false,
    stock_status: 'in_stock',
  },
  {
    name: 'Custom Salad Bowl',
    description: 'Your perfect blend crafted for your green identity profile.',
    short_description: 'Crafted for your profile',
    price: 14.99,
    image_url: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/d989c2aed_generated_c020f00d.png',
    category: 'salad',
    tags: ['Custom', 'Complete'],
    benefits: ['Complete nutrition'],
    flavor_profile: 'fresh',
    mood_match: ['all'],
    goal_match: ['all'],
    is_featured: false,
    stock_status: 'in_stock',
  },
  {
    name: 'Inner Garden Starter Box',
    description: 'Monthly curated microgreens subscription starter.',
    short_description: 'Monthly garden box',
    price: 29.99,
    image_url: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/15ec03790_generated_a7816631.png',
    category: 'subscription',
    tags: ['Subscription'],
    benefits: ['Monthly delivery'],
    flavor_profile: 'fresh',
    mood_match: ['all'],
    goal_match: ['all'],
    is_featured: true,
    stock_status: 'in_stock',
  },
];

export function seedDatabase() {
  const db = readDb();
  let changed = false;

  if (db.products.length === 0) {
    db.products = PRODUCTS.map((p) => ({
      id: newId(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      ...p,
    }));
    changed = true;
  }

  if (changed) writeDb(db);
  return db;
}
