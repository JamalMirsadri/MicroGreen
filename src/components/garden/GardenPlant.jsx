import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GardenScene3D, { xpToStage } from './GardenScene3D';

const STAGE_META = {
  seed:        { label: 'Seed',                   emoji: '🌰', color: 'text-amber-400'  },
  germinating: { label: 'Germinating',             emoji: '🪴', color: 'text-lime-300'   },
  sprout:      { label: 'Sprout',                  emoji: '🌱', color: 'text-green-400'  },
  young:       { label: 'Young MicroGreen',        emoji: '🍀', color: 'text-emerald-400' },
  healthy:     { label: 'Healthy MicroGreen',      emoji: '🌿', color: 'text-green-300'  },
  golden:      { label: 'Premium Golden MicroGreen', emoji: '✨', color: 'text-yellow-300' },
};

export default function GardenPlant({ xp = 0 }) {
  const stage = xpToStage(xp);
  const meta  = STAGE_META[stage] || STAGE_META.seed;

  return (
    <div className="relative w-full">
      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/8 via-transparent to-emerald-950/30 pointer-events-none z-10" />

      {/* Quality badge */}
      <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-background/55 backdrop-blur-md border border-primary/25">
        <span className="font-body text-[10px] uppercase tracking-widest text-primary">4K · 3D</span>
      </div>

      {/* Stage pill */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.8, y: -4 }}
          animate={{ opacity: 1, scale: 1,   y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-background/55 backdrop-blur-md border border-primary/25 flex items-center gap-1.5"
        >
          <span className="text-xs">{meta.emoji}</span>
          <span className={`font-body text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
            {meta.label}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* 3D scene */}
      <GardenScene3D
        xp={xp}
        className="border border-primary/20 shadow-[0_0_70px_rgba(74,222,128,0.14)]"
      />

      {/* XP progress hint */}
      <motion.p
        key={stage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-display text-sm font-semibold text-primary mt-4 tracking-wide"
      >
        Growth Stage · {meta.label}
      </motion.p>
    </div>
  );
}
