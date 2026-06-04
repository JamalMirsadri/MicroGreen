// Quiz questions
export const QUIZ_QUESTIONS = [
  {
    id: 'mood',
    question: 'How do you feel right now?',
    subtitle: 'Listen to your body — step one',
    type: 'grid',
    options: [
      { value: 'calm', label: 'Calm', icon: '🌊', description: 'Peaceful, centred', color: 'from-blue-900/40 to-teal-900/40' },
      { value: 'tired', label: 'Tired', icon: '🌙', description: 'Low energy, drained', color: 'from-indigo-900/40 to-purple-900/40' },
      { value: 'stressed', label: 'Stressed', icon: '⚡', description: 'Tense, overwhelmed', color: 'from-orange-900/40 to-red-900/40' },
      { value: 'energetic', label: 'Energetic', icon: '☀️', description: 'Alive, motivated', color: 'from-yellow-900/40 to-amber-900/40' },
      { value: 'focused', label: 'Focused', icon: '🎯', description: 'Sharp, in the zone', color: 'from-emerald-900/40 to-green-900/40' },
    ]
  },
  {
    id: 'energy_level',
    question: 'What is your current energy level?',
    subtitle: 'Be honest — your greens will meet you here',
    type: 'scale',
    options: [
      { value: 'very_low', label: 'Very Low', icon: '🪫', description: 'Running on empty', color: 'from-slate-900/40 to-gray-900/40' },
      { value: 'low', label: 'Low', icon: '🔋', description: 'Sluggish, need a lift', color: 'from-indigo-900/40 to-blue-900/40' },
      { value: 'moderate', label: 'Moderate', icon: '⚡', description: 'Getting through the day', color: 'from-teal-900/40 to-cyan-900/40' },
      { value: 'high', label: 'High', icon: '🔥', description: 'Feeling strong', color: 'from-orange-900/40 to-amber-900/40' },
      { value: 'very_high', label: 'Peak', icon: '💥', description: 'Unstoppable today', color: 'from-yellow-900/40 to-green-900/40' },
    ]
  },
  {
    id: 'goal',
    question: 'What is your primary wellness goal?',
    subtitle: 'Set your deepest intention',
    type: 'grid',
    options: [
      { value: 'more_energy', label: 'More Energy', icon: '⚡', description: 'Power through every day', color: 'from-orange-900/40 to-red-900/40' },
      { value: 'better_mood', label: 'Better Mood', icon: '😊', description: 'Lift your spirits naturally', color: 'from-yellow-900/40 to-amber-900/40' },
      { value: 'detox_reset', label: 'Detox & Reset', icon: '💧', description: 'Cleanse and restore', color: 'from-teal-900/40 to-emerald-900/40' },
      { value: 'strength_build', label: 'Build Strength', icon: '💪', description: 'Fuel muscle & recovery', color: 'from-red-900/40 to-orange-900/40' },
      { value: 'glow_skin', label: 'Skin Glow', icon: '✨', description: 'Radiate from within', color: 'from-amber-900/40 to-yellow-900/40' },
      { value: 'focus_clarity', label: 'Mental Clarity', icon: '🧠', description: 'Sharpen your mind', color: 'from-emerald-900/40 to-teal-900/40' },
    ]
  },
  {
    id: 'need',
    question: 'What does your body need most?',
    subtitle: 'Your body whispers its needs',
    type: 'grid',
    options: [
      { value: 'energy', label: 'Energy Boost', icon: '🔥', description: 'Ignite your fire', color: 'from-orange-900/40 to-yellow-900/40' },
      { value: 'calm', label: 'Inner Calm', icon: '🧘', description: 'Find your stillness', color: 'from-blue-900/40 to-cyan-900/40' },
      { value: 'detox', label: 'Deep Detox', icon: '💧', description: 'Purify and refresh', color: 'from-teal-900/40 to-emerald-900/40' },
      { value: 'strength', label: 'Strength', icon: '💪', description: 'Power and resilience', color: 'from-red-900/40 to-orange-900/40' },
      { value: 'glow', label: 'Natural Glow', icon: '✨', description: 'Radiance from within', color: 'from-amber-900/40 to-yellow-900/40' },
    ]
  },
  {
    id: 'lifestyle',
    question: 'What describes your lifestyle?',
    subtitle: 'Every rhythm has its greens',
    type: 'grid',
    options: [
      { value: 'active', label: 'Active', icon: '🏃', description: 'Always on the move', color: 'from-green-900/40 to-emerald-900/40' },
      { value: 'balanced', label: 'Balanced', icon: '⚖️', description: 'Mindful & steady', color: 'from-teal-900/40 to-blue-900/40' },
      { value: 'busy', label: 'Busy', icon: '🚀', description: 'Hustle mode daily', color: 'from-purple-900/40 to-pink-900/40' },
      { value: 'athletic', label: 'Athletic', icon: '🏋️', description: 'Training & performance', color: 'from-red-900/40 to-orange-900/40' },
      { value: 'relaxed', label: 'Relaxed', icon: '🌿', description: 'Slow & intentional', color: 'from-emerald-900/40 to-lime-900/40' },
    ]
  },
  {
    id: 'flavor',
    question: 'What flavor speaks to you?',
    subtitle: 'Taste is a language your body understands',
    type: 'grid',
    options: [
      { value: 'mild', label: 'Mild & Gentle', icon: '🍃', description: 'Soft, delicate notes', color: 'from-green-900/40 to-lime-900/40' },
      { value: 'fresh', label: 'Fresh & Bright', icon: '🌱', description: 'Crisp, clean, vibrant', color: 'from-emerald-900/40 to-teal-900/40' },
      { value: 'spicy', label: 'Spicy & Bold', icon: '🌶️', description: 'Fiery, intense kick', color: 'from-red-900/40 to-orange-900/40' },
      { value: 'earthy', label: 'Earthy & Rich', icon: '🍄', description: 'Deep, grounding warmth', color: 'from-amber-900/40 to-yellow-900/40' },
    ]
  },
  {
    id: 'stress_level',
    question: 'How do you typically handle stress?',
    subtitle: 'Know yourself — grow stronger',
    type: 'grid',
    options: [
      { value: 'meditation', label: 'Meditation', icon: '🧘', description: 'Find inner peace', color: 'from-blue-900/40 to-cyan-900/40' },
      { value: 'exercise', label: 'Exercise', icon: '🏃', description: 'Burn it off with movement', color: 'from-red-900/40 to-orange-900/40' },
      { value: 'nature', label: 'Nature Time', icon: '🌿', description: 'Reconnect outdoors', color: 'from-green-900/40 to-emerald-900/40' },
      { value: 'social', label: 'Social Connection', icon: '👥', description: 'Talk it through', color: 'from-purple-900/40 to-pink-900/40' },
      { value: 'sleep', label: 'Rest & Sleep', icon: '😴', description: 'Let time heal', color: 'from-indigo-900/40 to-blue-900/40' },
    ]
  },
  {
    id: 'stress_level',
    question: 'How do you typically handle stress?',
    subtitle: 'Know yourself — grow stronger',
    type: 'grid',
    options: [
      { value: 'meditation', label: 'Meditation', icon: '🧘', description: 'Find inner peace', color: 'from-blue-900/40 to-cyan-900/40' },
      { value: 'exercise', label: 'Exercise', icon: '🏃', description: 'Burn it off with movement', color: 'from-red-900/40 to-orange-900/40' },
      { value: 'nature', label: 'Nature Time', icon: '🌿', description: 'Reconnect outdoors', color: 'from-green-900/40 to-emerald-900/40' },
      { value: 'social', label: 'Social Connection', icon: '👥', description: 'Talk it through', color: 'from-purple-900/40 to-pink-900/40' },
      { value: 'sleep', label: 'Rest & Sleep', icon: '😴', description: 'Let time heal', color: 'from-indigo-900/40 to-blue-900/40' },
    ]
  },
  {
    id: 'element',
    question: 'What element feels like you?',
    subtitle: 'Connect with your nature — final step',
    type: 'grid',
    options: [
      { value: 'forest', label: 'Forest', icon: '🌳', description: 'Grounded & ancient', color: 'from-green-900/40 to-emerald-900/40' },
      { value: 'ocean', label: 'Ocean', icon: '🌊', description: 'Fluid & vast', color: 'from-blue-900/40 to-cyan-900/40' },
      { value: 'mountain', label: 'Mountain', icon: '🏔️', description: 'Strong & enduring', color: 'from-slate-800/40 to-stone-900/40' },
      { value: 'sunlight', label: 'Sunlight', icon: '🌞', description: 'Radiant & warming', color: 'from-yellow-900/40 to-amber-900/40' },
      { value: 'rain', label: 'Rain', icon: '🌧️', description: 'Cleansing & renewing', color: 'from-indigo-900/40 to-blue-900/40' },
    ]
  },
  ];

// Identity mappings
export const IDENTITIES = {
  calm_energy: { name: 'Calm Leaf', emoji: '🍃', description: 'You carry a quiet strength. Your greens should nurture your serene energy with gentle vitality.' },
  calm_calm: { name: 'Zen Root', emoji: '🌿', description: 'Deep stillness lives within you. Root vegetables and calming greens honor your meditative nature.' },
  calm_detox: { name: 'Fresh Bloom', emoji: '🌸', description: 'Purity flows through you. Light, cleansing microgreens will refresh your already peaceful spirit.' },
  tired_energy: { name: 'Energy Sprout', emoji: '🌱', description: 'You need a spark to reignite your fire. Vibrant, nutrient-dense greens will fuel your comeback.' },
  tired_calm: { name: 'Moon Petal', emoji: '🌙', description: 'Rest is your superpower. Soothing, mineral-rich greens will restore your body gently.' },
  stressed_energy: { name: 'Power Kale', emoji: '💪', description: 'Transform your tension into unstoppable drive. Bold, powerful greens match your intensity.' },
  stressed_calm: { name: 'Peace Mint', emoji: '🌿', description: 'Breathe out the chaos. Cool, aromatic greens will bring you back to center.' },
  energetic_energy: { name: 'Wild Garden', emoji: '🌻', description: 'You are a force of nature. Diverse, bold microgreens fuel your unstoppable momentum.' },
  energetic_strength: { name: 'Blaze Radish', emoji: '🔥', description: 'Raw power runs through you. Spicy, nutrient-packed greens amplify your natural fire.' },
  focused_energy: { name: 'Focus Basil', emoji: '🎯', description: 'Precision is your gift. Aromatic, brain-boosting greens sharpen your clarity even further.' },
  focused_glow: { name: 'Glow Mint', emoji: '✨', description: 'You radiate clarity and light. Fresh, vibrant greens enhance your natural luminosity.' },
};

export const DEFAULT_IDENTITY = { name: 'Green Spirit', emoji: '🌱', description: 'You are connected to nature in your own unique way. A balanced mix of microgreens will nourish your journey.' };

// Resolve identity from quiz answers
export function resolveIdentity(answers) {
  const key = `${answers.mood}_${answers.need}`;
  return IDENTITIES[key] || DEFAULT_IDENTITY;
}

// Levels
export const LEVELS = [
  { name: 'Seed', minXp: 0, icon: '🌰', color: 'from-amber-900 to-yellow-900' },
  { name: 'Sprout', minXp: 100, icon: '🌱', color: 'from-lime-900 to-green-900' },
  { name: 'Leaf', minXp: 300, icon: '🍃', color: 'from-green-900 to-emerald-900' },
  { name: 'Bloom', minXp: 600, icon: '🌸', color: 'from-emerald-900 to-teal-900' },
  { name: 'Forest Master', minXp: 1000, icon: '🌳', color: 'from-teal-900 to-cyan-900' },
];

export function getLevel(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level;
    else break;
  }
  return current;
}

export function getNextLevel(xp) {
  for (const level of LEVELS) {
    if (xp < level.minXp) return level;
  }
  return null;
}

// Challenges
export const DAILY_CHALLENGES = [
  { id: 'water', title: 'Drink 8 glasses of water', xp: 10, icon: '💧' },
  { id: 'greens', title: 'Eat your greens today', xp: 15, icon: '🥬' },
  { id: 'walk', title: 'Take a 15 minute walk', xp: 10, icon: '🚶' },
  { id: 'mood', title: 'Log your mood', xp: 5, icon: '😊' },
  { id: 'meal', title: 'Prepare a healthy meal', xp: 20, icon: '🥗' },
  { id: 'streak', title: 'Stay consistent for 7 days', xp: 50, icon: '🔥' },
];

// Badges
export const BADGES = [
  { id: 'first_quiz', name: 'Self Discovery', description: 'Completed your first quiz', icon: '🔮' },
  { id: 'first_order', name: 'First Harvest', description: 'Placed your first order', icon: '🛒' },
  { id: 'week_streak', name: 'Week Warrior', description: '7-day streak achieved', icon: '🔥' },
  { id: 'green_lover', name: 'Green Lover', description: 'Ordered 5 different greens', icon: '💚' },
  { id: 'garden_bloom', name: 'Garden Bloom', description: 'Reached Bloom level', icon: '🌸' },
  { id: 'forest_master', name: 'Forest Master', description: 'Reached the highest level', icon: '🌳' },
];

// Subscription tiers
export const SUBSCRIPTION_TIERS = [
  {
    id: 'seed',
    name: 'Seed',
    price: 19,
    icon: '🌰',
    features: ['2 microgreen varieties/month', 'Basic recipes', 'Garden dashboard access', 'Weekly tips'],
    color: 'from-amber-900/30 to-yellow-900/30',
    borderColor: 'border-amber-700/30',
  },
  {
    id: 'sprout',
    name: 'Sprout',
    price: 34,
    icon: '🌱',
    features: ['4 microgreen varieties/month', 'Personalized mixes', 'All recipes unlocked', '2x XP rewards', 'Seasonal specials'],
    color: 'from-lime-900/30 to-green-900/30',
    borderColor: 'border-lime-700/30',
    popular: true,
  },
  {
    id: 'leaf',
    name: 'Leaf',
    price: 49,
    icon: '🍃',
    features: ['6 microgreen varieties/month', 'Custom salad box', 'Priority delivery', '3x XP rewards', 'Exclusive challenges', 'Monthly surprise item'],
    color: 'from-green-900/30 to-emerald-900/30',
    borderColor: 'border-green-700/30',
  },
  {
    id: 'bloom',
    name: 'Bloom',
    price: 79,
    icon: '🌸',
    features: ['All varieties unlimited', 'Full custom salad builder', 'Free shipping always', '5x XP rewards', 'VIP community access', 'Quarterly gift box', 'Personal wellness coach chat'],
    color: 'from-emerald-900/30 to-teal-900/30',
    borderColor: 'border-emerald-700/30',
  },
];