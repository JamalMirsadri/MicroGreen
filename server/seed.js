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

const DEFAULT_SITE_CONTENT = {
  brandName: 'Inner Garden',
  homeHeroTitle: 'Discover your inner garden',
  homeHeroSubtitle: 'Take a personalized journey to discover the microgreens crafted for your unique body, mood, and goals.',
  ctaTitle: 'Ready to grow?',
  ctaSubtitle: 'In just 2 minutes, discover the microgreens made for you.',
  footerText: 'Premium microgreens for your body, mood, and goals.',
  supportEmail: 'support@innergarden.local',
};

const DEFAULT_QUIZ_QUESTIONS = [
  {
    id: 'mood',
    question: 'How do you feel right now?',
    subtitle: 'Listen to your body - step one',
    type: 'grid',
    options: [
      { value: 'calm', label: 'Calm', icon: '🌊', description: 'Peaceful, centred' },
      { value: 'tired', label: 'Tired', icon: '🌙', description: 'Low energy, drained' },
      { value: 'stressed', label: 'Stressed', icon: '⚡', description: 'Tense, overwhelmed' },
      { value: 'energetic', label: 'Energetic', icon: '☀️', description: 'Alive, motivated' },
      { value: 'focused', label: 'Focused', icon: '🎯', description: 'Sharp, in the zone' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary wellness goal?',
    subtitle: 'Set your deepest intention',
    type: 'grid',
    options: [
      { value: 'more_energy', label: 'More Energy', icon: '⚡', description: 'Power through every day' },
      { value: 'better_mood', label: 'Better Mood', icon: '😊', description: 'Lift your spirits naturally' },
      { value: 'detox_reset', label: 'Detox & Reset', icon: '💧', description: 'Cleanse and restore' },
      { value: 'strength_build', label: 'Build Strength', icon: '💪', description: 'Fuel muscle & recovery' },
      { value: 'focus_clarity', label: 'Mental Clarity', icon: '🧠', description: 'Sharpen your mind' },
    ],
  },
  {
    id: 'need',
    question: 'What does your body need most?',
    subtitle: 'Your body whispers its needs',
    type: 'grid',
    options: [
      { value: 'energy', label: 'Energy Boost', icon: '🔥', description: 'Ignite your fire' },
      { value: 'calm', label: 'Inner Calm', icon: '🧘', description: 'Find your stillness' },
      { value: 'detox', label: 'Deep Detox', icon: '💧', description: 'Purify and refresh' },
      { value: 'strength', label: 'Strength', icon: '💪', description: 'Power and resilience' },
      { value: 'glow', label: 'Natural Glow', icon: '✨', description: 'Radiance from within' },
    ],
  },
];

const DEFAULT_GAME_CONFIG = {
  levels: [
    { name: 'Seed', minXp: 0, icon: '🌰' },
    { name: 'Sprout', minXp: 100, icon: '🌱' },
    { name: 'Leaf', minXp: 300, icon: '🍃' },
    { name: 'Bloom', minXp: 600, icon: '🌸' },
    { name: 'Forest Master', minXp: 1000, icon: '🌳' },
  ],
  dailyChallenges: [
    { id: 'water', title: 'Drink 8 glasses of water', xp: 10, icon: '💧' },
    { id: 'greens', title: 'Eat your greens today', xp: 15, icon: '🥬' },
    { id: 'walk', title: 'Take a 15 minute walk', xp: 10, icon: '🚶' },
    { id: 'mood', title: 'Log your mood', xp: 5, icon: '😊' },
    { id: 'meal', title: 'Prepare a healthy meal', xp: 20, icon: '🥗' },
  ],
  badges: [
    { id: 'first_quiz', name: 'Self Discovery', description: 'Completed your first quiz', icon: '🔮' },
    { id: 'first_order', name: 'First Harvest', description: 'Placed your first order', icon: '🛒' },
    { id: 'week_streak', name: 'Week Warrior', description: '7-day streak achieved', icon: '🔥' },
  ],
  subscriptionTiers: [
    { id: 'seed', name: 'Seed', price: 19, icon: '🌰', features: ['2 microgreen varieties/month', 'Basic recipes'] },
    { id: 'sprout', name: 'Sprout', price: 34, icon: '🌱', features: ['4 microgreen varieties/month', 'Personalized mixes'], popular: true },
    { id: 'leaf', name: 'Leaf', price: 49, icon: '🍃', features: ['6 microgreen varieties/month', 'Custom salad box'] },
    { id: 'bloom', name: 'Bloom', price: 79, icon: '🌸', features: ['All varieties unlimited', 'VIP community access'] },
  ],
  identities: {
    calm_energy: { name: 'Calm Leaf', emoji: '🍃', description: 'Quiet strength and gentle vitality.' },
    tired_energy: { name: 'Energy Sprout', emoji: '🌱', description: 'A spark to reignite your fire.' },
    stressed_calm: { name: 'Peace Mint', emoji: '🌿', description: 'Cool greens to bring you back to center.' },
  },
};

const DEFAULT_INTEGRATIONS = {
  payments: {
    provider: 'stripe',
    enabled: false,
    mode: 'test',
    publicKey: '',
    webhookConfigured: false,
    currency: 'usd',
    checkoutSuccessUrl: '/garden',
    checkoutCancelUrl: '/subscribe',
  },
  ai: {
    enabled: false,
    providers: [
      { name: 'OpenAI', enabled: false, model: 'gpt-4o-mini', envKey: 'OPENAI_API_KEY' },
      { name: 'Anthropic', enabled: false, model: 'claude-3-5-sonnet-latest', envKey: 'ANTHROPIC_API_KEY' },
    ],
    recommendationPrompt: 'Recommend microgreens based on mood, goals, lifestyle, and flavor preferences.',
    contentPrompt: 'Generate wellness and microgreen content in the Inner Garden brand voice.',
    supportPrompt: 'Help customers with subscriptions, orders, product recommendations, and garden progress.',
  },
};

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

  if (!db.siteContent || Object.keys(db.siteContent).length === 0) {
    db.siteContent = DEFAULT_SITE_CONTENT;
    changed = true;
  }

  if (!Array.isArray(db.quizQuestions) || db.quizQuestions.length === 0) {
    db.quizQuestions = DEFAULT_QUIZ_QUESTIONS;
    changed = true;
  }

  if (!db.gameConfig || !Array.isArray(db.gameConfig.levels) || db.gameConfig.levels.length === 0) {
    db.gameConfig = DEFAULT_GAME_CONFIG;
    changed = true;
  }

  if (!db.integrations || !db.integrations.payments || !db.integrations.ai) {
    db.integrations = DEFAULT_INTEGRATIONS;
    changed = true;
  }

  if (changed) writeDb(db);
  return db;
}
