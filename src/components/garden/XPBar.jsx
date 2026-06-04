import React from 'react';
import { motion } from 'framer-motion';
import { getLevel, getNextLevel } from '../../lib/gameData';

export default function XPBar({ xp = 0 }) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  const progress = next ? ((xp - current.minXp) / (next.minXp - current.minXp)) * 100 : 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{current.icon}</span>
          <span className="font-body text-sm font-semibold text-foreground">{current.name}</span>
        </div>
        <span className="font-body text-xs text-muted-foreground">
          {next ? `${xp} / ${next.minXp} XP` : `${xp} XP — Max Level!`}
        </span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {next && (
        <p className="font-body text-xs text-muted-foreground mt-1">
          {next.minXp - xp} XP to {next.icon} {next.name}
        </p>
      )}
    </div>
  );
}