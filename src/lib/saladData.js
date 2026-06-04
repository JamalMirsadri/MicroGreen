export const INGREDIENTS = [
  {
    id: 'sunflower',
    name: 'Sunflower Microgreens',
    price: 2.50,
    emoji: '🌻',
    category: 'base',
    flavor: { mild: 20, fresh: 60, spicy: 10, earthy: 10 },
    benefits: [
      { label: 'Protein', value: 85 },
      { label: 'Vitamin E', value: 90 },
      { label: 'Energy', value: 80 },
    ],
    tags: ['High Protein', 'Vitamin E', 'Energy'],
    color: 'border-yellow-600/40 bg-yellow-900/10',
    activeColor: 'border-yellow-500/70 bg-yellow-900/20',
  },
  {
    id: 'pea',
    name: 'Pea Shoots',
    price: 2.50,
    emoji: '🌱',
    category: 'base',
    flavor: { mild: 60, fresh: 30, spicy: 0, earthy: 10 },
    benefits: [
      { label: 'Vitamin C', value: 75 },
      { label: 'Folate', value: 70 },
      { label: 'Calm', value: 65 },
    ],
    tags: ['Vitamin C', 'Folate', 'Soothing'],
    color: 'border-green-600/40 bg-green-900/10',
    activeColor: 'border-green-500/70 bg-green-900/20',
  },
  {
    id: 'broccoli',
    name: 'Broccoli Microgreens',
    price: 2.00,
    emoji: '🥦',
    category: 'base',
    flavor: { mild: 40, fresh: 40, spicy: 5, earthy: 15 },
    benefits: [
      { label: 'Sulforaphane', value: 95 },
      { label: 'Detox', value: 90 },
      { label: 'Immunity', value: 85 },
    ],
    tags: ['Sulforaphane', 'Detox', 'Anti-cancer'],
    color: 'border-emerald-600/40 bg-emerald-900/10',
    activeColor: 'border-emerald-500/70 bg-emerald-900/20',
  },
  {
    id: 'radish',
    name: 'Radish Microgreens',
    price: 2.00,
    emoji: '🌶️',
    category: 'base',
    flavor: { mild: 5, fresh: 15, spicy: 70, earthy: 10 },
    benefits: [
      { label: 'Vitamin C', value: 80 },
      { label: 'Metabolism', value: 75 },
      { label: 'Circulation', value: 70 },
    ],
    tags: ['Bold Flavor', 'Metabolism', 'Vitamin C'],
    color: 'border-red-600/40 bg-red-900/10',
    activeColor: 'border-red-500/70 bg-red-900/20',
  },
  {
    id: 'basil',
    name: 'Basil Microgreens',
    price: 2.50,
    emoji: '🌿',
    category: 'base',
    flavor: { mild: 10, fresh: 30, spicy: 15, earthy: 45 },
    benefits: [
      { label: 'Antioxidants', value: 85 },
      { label: 'Anti-stress', value: 80 },
      { label: 'Brain Health', value: 75 },
    ],
    tags: ['Aromatic', 'Anti-stress', 'Antioxidants'],
    color: 'border-lime-600/40 bg-lime-900/10',
    activeColor: 'border-lime-500/70 bg-lime-900/20',
  },
  {
    id: 'kale',
    name: 'Baby Kale',
    price: 2.00,
    emoji: '🥬',
    category: 'greens',
    flavor: { mild: 20, fresh: 30, spicy: 5, earthy: 45 },
    benefits: [
      { label: 'Iron', value: 80 },
      { label: 'Calcium', value: 75 },
      { label: 'Vitamins', value: 90 },
    ],
    tags: ['Iron Rich', 'Calcium', 'K vitamins'],
    color: 'border-teal-600/40 bg-teal-900/10',
    activeColor: 'border-teal-500/70 bg-teal-900/20',
  },
  {
    id: 'spinach',
    name: 'Baby Spinach',
    price: 1.50,
    emoji: '🍃',
    category: 'greens',
    flavor: { mild: 50, fresh: 30, spicy: 0, earthy: 20 },
    benefits: [
      { label: 'Iron', value: 70 },
      { label: 'Magnesium', value: 75 },
      { label: 'Energy', value: 65 },
    ],
    tags: ['Magnesium', 'Iron', 'Gentle'],
    color: 'border-green-600/40 bg-green-900/10',
    activeColor: 'border-green-500/70 bg-green-900/20',
  },
  {
    id: 'avocado',
    name: 'Fresh Avocado',
    price: 3.00,
    emoji: '🥑',
    category: 'topping',
    flavor: { mild: 55, fresh: 20, spicy: 0, earthy: 25 },
    benefits: [
      { label: 'Healthy Fats', value: 95 },
      { label: 'Potassium', value: 80 },
      { label: 'Glow', value: 85 },
    ],
    tags: ['Healthy Fats', 'Potassium', 'Skin Glow'],
    color: 'border-lime-600/40 bg-lime-900/10',
    activeColor: 'border-lime-500/70 bg-lime-900/20',
  },
  {
    id: 'nuts',
    name: 'Toasted Walnuts',
    price: 2.00,
    emoji: '🌰',
    category: 'topping',
    flavor: { mild: 10, fresh: 0, spicy: 0, earthy: 90 },
    benefits: [
      { label: 'Omega-3', value: 90 },
      { label: 'Brain Health', value: 85 },
      { label: 'Crunch', value: 95 },
    ],
    tags: ['Omega-3', 'Brain Health', 'Crunchy'],
    color: 'border-amber-600/40 bg-amber-900/10',
    activeColor: 'border-amber-500/70 bg-amber-900/20',
  },
  {
    id: 'seeds',
    name: 'Hemp Seeds',
    price: 1.50,
    emoji: '✨',
    category: 'topping',
    flavor: { mild: 60, fresh: 10, spicy: 0, earthy: 30 },
    benefits: [
      { label: 'Protein', value: 70 },
      { label: 'Omega-3', value: 75 },
      { label: 'Balance', value: 70 },
    ],
    tags: ['Complete Protein', 'Omega-3', 'GLA'],
    color: 'border-yellow-600/40 bg-yellow-900/10',
    activeColor: 'border-yellow-500/70 bg-yellow-900/20',
  },
  {
    id: 'lemon',
    name: 'Lemon Vinaigrette',
    price: 1.00,
    emoji: '🍋',
    category: 'dressing',
    flavor: { mild: 10, fresh: 80, spicy: 5, earthy: 5 },
    benefits: [
      { label: 'Vitamin C', value: 60 },
      { label: 'Brightness', value: 90 },
      { label: 'Digestion', value: 65 },
    ],
    tags: ['Zesty', 'Digestive', 'Light'],
    color: 'border-yellow-500/40 bg-yellow-900/10',
    activeColor: 'border-yellow-400/70 bg-yellow-900/20',
  },
  {
    id: 'tahini',
    name: 'Tahini Dressing',
    price: 1.50,
    emoji: '🫘',
    category: 'dressing',
    flavor: { mild: 15, fresh: 5, spicy: 5, earthy: 75 },
    benefits: [
      { label: 'Calcium', value: 70 },
      { label: 'Healthy Fats', value: 75 },
      { label: 'Richness', value: 85 },
    ],
    tags: ['Calcium', 'Sesame', 'Creamy'],
    color: 'border-orange-600/40 bg-orange-900/10',
    activeColor: 'border-orange-500/70 bg-orange-900/20',
  },
];

export const CATEGORIES = [
  { id: 'base', label: 'Microgreen Base', icon: '🌿' },
  { id: 'greens', label: 'Extra Greens', icon: '🥬' },
  { id: 'topping', label: 'Toppings', icon: '🌰' },
  { id: 'dressing', label: 'Dressing', icon: '🍋' },
];

export function computeFlavorProfile(selectedIds) {
  const totals = { mild: 0, fresh: 0, spicy: 0, earthy: 0 };
  let count = 0;
  for (const id of selectedIds) {
    const ing = INGREDIENTS.find(i => i.id === id);
    if (!ing) continue;
    totals.mild += ing.flavor.mild;
    totals.fresh += ing.flavor.fresh;
    totals.spicy += ing.flavor.spicy;
    totals.earthy += ing.flavor.earthy;
    count++;
  }
  if (!count) return totals;
  return {
    mild: Math.round(totals.mild / count),
    fresh: Math.round(totals.fresh / count),
    spicy: Math.round(totals.spicy / count),
    earthy: Math.round(totals.earthy / count),
  };
}

export function computeTopBenefits(selectedIds) {
  const map = {};
  for (const id of selectedIds) {
    const ing = INGREDIENTS.find(i => i.id === id);
    if (!ing) continue;
    for (const b of ing.benefits) {
      if (!map[b.label] || map[b.label] < b.value) map[b.label] = b.value;
    }
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));
}