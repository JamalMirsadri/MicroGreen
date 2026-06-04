import React from 'react';
import { motion } from 'framer-motion';
import GardenScene3D from './GardenScene3D';

const STAGE_LABELS = {
  seed: 'Seed',
  sprout: 'Sprout',
  leaf: 'Leaf',
  bloom: 'Bloom',
  forest_master: 'Forest Master',
};

export default function GardenPlant({ level = 'seed' }) {
  const label = STAGE_LABELS[level] || 'Seed';

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 via-transparent to-emerald-950/40 pointer-events-none" />
      <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-background/60 backdrop-blur-md border border-primary/25">
        <span className="font-body text-[10px] uppercase tracking-widest text-primary">4K · 3D</span>
      </div>
      <GardenScene3D level={level} className="border border-primary/20 shadow-[0_0_60px_rgba(74,222,128,0.12)]" />
      <motion.p
        key={level}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-display text-sm font-semibold text-primary mt-4 tracking-wide"
      >
        Growth stage · {label}
      </motion.p>
    </div>
  );
}
