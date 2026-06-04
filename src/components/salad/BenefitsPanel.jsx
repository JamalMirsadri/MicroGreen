import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BenefitsPanel({ benefits, tags }) {
  if (!benefits.length) {
    return (
      <p className="font-body text-sm text-muted-foreground text-center py-4">
        Add ingredients to see health benefits
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <AnimatePresence>
          {benefits.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="font-body text-xs text-foreground/80 w-24 shrink-0">{b.label}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${b.value}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="font-body text-xs text-primary w-8 text-right shrink-0">{b.value}%</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-body text-primary">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}