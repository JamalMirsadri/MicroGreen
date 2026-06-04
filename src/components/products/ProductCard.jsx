import React from 'react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, matchReason, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,139,34,0.1)]">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">{product.name}</h3>
          <p className="font-body text-sm text-muted-foreground mt-1">{product.tagline || product.short_description}</p>
          {matchReason && (
            <p className="font-body text-xs text-primary/80 mt-2 italic">{matchReason}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="font-display text-xl font-bold text-primary">${product.price}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-body font-medium hover:shadow-[0_0_20px_rgba(34,139,34,0.3)] transition-shadow"
            >
              Add to Box
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}