import React from 'react';
import { motion } from 'framer-motion';

const FLAVOR_CONFIG = [
  { key: 'mild', label: 'Mild', icon: '🍃', color: 'bg-green-500' },
  { key: 'fresh', label: 'Fresh', icon: '🌱', color: 'bg-teal-400' },
  { key: 'spicy', label: 'Spicy', icon: '🌶️', color: 'bg-red-500' },
  { key: 'earthy', label: 'Earthy', icon: '🍄', color: 'bg-amber-600' },
];

export default function FlavorProfile({ profile }) {
  const isEmpty = Object.values(profile).every(v => v === 0);

  return (
    <div className="space-y-3">
      {FLAVOR_CONFIG.map(({ key, label, icon, color }) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-base w-5 shrink-0">{icon}</span>
          <span className="font-body text-xs text-muted-foreground w-10 shrink-0">{label}</span>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${color}`}
              initial={{ width: 0 }}
              animate={{ width: isEmpty ? '0%' : `${profile[key]}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="font-body text-xs text-muted-foreground w-8 text-right shrink-0">
            {isEmpty ? '—' : `${profile[key]}%`}
          </span>
        </div>
      ))}
    </div>
  );
}