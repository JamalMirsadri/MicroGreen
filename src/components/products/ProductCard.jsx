import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=600&q=80';

export default function ProductCard({ product, matchReason, index = 0 }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const img = product.image_url || product.image || PLACEHOLDER;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <Link to={`/shop/${product.id}`} className="block h-full">
        <div className="h-full rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,139,34,0.1)] flex flex-col">
          <div className="relative overflow-hidden aspect-square">
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { e.target.src = PLACEHOLDER; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            {matchReason && (
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-body font-medium backdrop-blur-sm">
                ✨ Matched for you
              </div>
            )}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              {product.tags?.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-full bg-background/70 text-foreground/80 text-xs font-body backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground">{product.name}</h3>
            <p className="font-body text-sm text-muted-foreground mt-1 flex-1">
              {product.tagline || product.short_description}
            </p>
            {matchReason && (
              <p className="font-body text-xs text-primary/80 mt-2 italic">{matchReason}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <span className="font-display text-xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body font-medium transition-all ${
                  added
                    ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(34,139,34,0.3)]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? 'Added!' : 'Add to Cart'}
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
