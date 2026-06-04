import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, SlidersHorizontal, X } from 'lucide-react';
import { api } from '@/api/apiClient';
import { useCart } from '@/lib/CartContext';

const CATEGORIES = [
  { key: 'all',          label: 'All Products' },
  { key: 'microgreen',   label: 'Microgreens' },
  { key: 'mix',          label: 'Mixes' },
  { key: 'salad',        label: 'Salads' },
  { key: 'subscription', label: 'Bundles' },
];

const SORT_OPTIONS = [
  { key: 'featured', label: 'Featured First' },
  { key: 'price_asc', label: 'Price: Low → High' },
  { key: 'price_desc', label: 'Price: High → Low' },
  { key: 'name', label: 'Name A–Z' },
];

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=600&q=80';

function StockBadge({ status }) {
  if (status === 'in_stock')
    return <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">In Stock</span>;
  if (status === 'low_stock')
    return <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Low Stock</span>;
  return <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Out of Stock</span>;
}

function ShopCard({ product, index }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const img = product.image_url || product.image || PLACEHOLDER_IMAGE;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <Link to={`/shop/${product.id}`} className="group block h-full">
        <div className="h-full rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-primary/40 transition-all duration-400 hover:shadow-[0_0_48px_rgba(34,197,94,0.1)] flex flex-col">
          {/* Image */}
          <div className="relative overflow-hidden aspect-[4/3]">
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

            {product.is_featured && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                Featured
              </div>
            )}

            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-background/70 backdrop-blur-sm border border-border/40 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground capitalize">
              {product.category}
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col flex-1 p-5 gap-3">
            <div className="flex-1">
              <h3 className="font-display text-base font-semibold text-foreground leading-tight">{product.name}</h3>
              <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.short_description || product.description}
              </p>

              {/* Tags */}
              {product.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {product.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div>
                <p className="font-display text-xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>
                <StockBadge status={product.stock_status} />
              </div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAdd}
                disabled={product.stock_status === 'out_of_stock'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  added
                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : product.stock_status === 'out_of_stock'
                    ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? 'Added!' : 'Add'}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Shop() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [category, setCategory]     = useState('all');
  const [sort, setSort]             = useState('featured');
  const [search, setSearch]         = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    api.products.list()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (category !== 'all') list = list.filter((p) => p.category === category);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sort === 'featured') list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    else if (sort === 'price_asc') list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price_desc') list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, category, sort, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative pt-24 pb-14 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.12), transparent 60%)' }} />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3"
          >
            Our Collection
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Fresh <span className="text-primary italic">MicroGreens</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-body text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Grown with care. Harvested at peak nutrition. Delivered to your door.
          </motion.p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-border/40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-secondary border border-border/40 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  category === c.key
                    ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(34,197,94,0.35)]'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-secondary border border-border/40 text-sm font-body text-foreground rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/50"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card/50 border border-border/30 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🌱</p>
            <p className="font-display text-xl font-semibold text-foreground mb-2">Nothing found</p>
            <p className="font-body text-muted-foreground mb-6">Try a different category or search term</p>
            <button
              onClick={() => { setCategory('all'); setSearch(''); }}
              className="px-6 py-2.5 rounded-full bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              {category !== 'all' && ` in ${CATEGORIES.find((c) => c.key === category)?.label}`}
            </p>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p, i) => (
                  <ShopCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
