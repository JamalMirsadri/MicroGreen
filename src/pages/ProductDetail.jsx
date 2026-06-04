import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Check, ChevronDown, ChevronUp,
  Leaf, Minus, Plus, ShoppingCart, Star, Truck,
} from 'lucide-react';
import { api } from '@/api/apiClient';
import { useCart } from '@/lib/CartContext';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800&q=80';

const BENEFIT_ICONS = {
  Energy: '⚡', Strength: '💪', Detox: '💧', Glow: '✨',
  Calm: '🧘', Focus: '🎯', default: '🌿',
};

function benefitIcon(b) {
  return BENEFIT_ICONS[b] || BENEFIT_ICONS.default;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct]         = useState(null);
  const [related, setRelated]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [qty, setQty]                 = useState(1);
  const [added, setAdded]             = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAdded(false);
    setQty(1);
    api.products.get(id)
      .then((p) => {
        setProduct(p);
        // Load related (same category)
        return api.products.list().then((all) =>
          setRelated(all.filter((r) => r.id !== id && r.category === p.category).slice(0, 3))
        );
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <p className="text-5xl">🌱</p>
        <h2 className="font-display text-2xl font-bold text-foreground">Product not found</h2>
        <Link to="/shop" className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
          Back to Shop
        </Link>
      </div>
    );
  }

  const img = product.image_url || product.image || PLACEHOLDER;
  const inStock = product.stock_status !== 'out_of_stock';

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Back nav */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>
      </div>

      {/* Main section */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* ── Left: Image ───────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-24"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-card border border-border/30 shadow-2xl">
              <img
                src={img}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />

              {product.is_featured && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                  <Star className="w-3 h-3" /> Featured
                </div>
              )}

              {/* Stock pill */}
              <div className="absolute bottom-4 right-4">
                {product.stock_status === 'in_stock' && (
                  <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                    ✓ In Stock
                  </span>
                )}
                {product.stock_status === 'low_stock' && (
                  <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
                    ⚠ Low Stock
                  </span>
                )}
                {product.stock_status === 'out_of_stock' && (
                  <span className="px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Details ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Category + name */}
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-3 capitalize">
                {product.category}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>
              <p className="font-body text-muted-foreground mt-2 text-base">
                {product.short_description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-primary">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="font-body text-sm text-muted-foreground">per pack</span>
            </div>

            {/* Flavor profile */}
            {product.flavor_profile && (
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary shrink-0" />
                <span className="font-body text-sm text-muted-foreground">
                  Flavor: <span className="text-foreground font-medium capitalize">{product.flavor_profile}</span>
                </span>
              </div>
            )}

            {/* Benefits */}
            {product.benefits?.length > 0 && (
              <div>
                <p className="font-body text-sm font-semibold text-foreground mb-3">Key Benefits</p>
                <div className="grid grid-cols-2 gap-2">
                  {product.benefits.map((b) => (
                    <div key={b} className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/30">
                      <span className="text-lg">{benefitIcon(b)}</span>
                      <span className="font-body text-sm text-foreground">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-secondary border border-border/40 text-xs font-body text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description toggle */}
            {product.description && (
              <div className="rounded-2xl bg-card/60 border border-border/30 p-5">
                <button
                  onClick={() => setShowFullDesc((v) => !v)}
                  className="flex items-center justify-between w-full"
                >
                  <span className="font-body text-sm font-semibold text-foreground">About this product</span>
                  {showFullDesc ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {showFullDesc && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="font-body text-sm text-muted-foreground mt-3 leading-relaxed"
                  >
                    {product.description}
                  </motion.p>
                )}
              </div>
            )}

            {/* Delivery info */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <p className="font-body text-sm text-foreground">
                <span className="font-semibold">Free delivery</span> on orders over $30 · Harvested fresh to order
              </p>
            </div>

            {/* Qty + Add to Cart */}
            {inStock ? (
              <div className="flex items-center gap-4 pt-2">
                {/* Qty selector */}
                <div className="flex items-center gap-0 rounded-xl border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-12 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center font-display font-bold text-foreground text-lg bg-card">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-12 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-bold text-base transition-all ${
                    added
                      ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.5)]'
                      : 'bg-primary text-primary-foreground hover:shadow-[0_0_30px_rgba(34,197,94,0.35)]'
                  }`}
                >
                  {added ? (
                    <><Check className="w-5 h-5" /> Added to Cart!</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Add to Cart — ${(Number(product.price) * qty).toFixed(2)}</>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="py-4 rounded-xl bg-secondary/50 text-center text-muted-foreground font-body text-sm">
                Currently out of stock — check back soon
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Related products ─────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} to={`/shop/${p.id}`} className="group block">
                  <div className="rounded-2xl overflow-hidden bg-card border border-border/40 hover:border-primary/40 transition-all duration-400">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={p.image_url || p.image || PLACEHOLDER}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER; }}
                      />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">{p.short_description}</p>
                      </div>
                      <p className="font-display text-base font-bold text-primary ml-4">${Number(p.price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
