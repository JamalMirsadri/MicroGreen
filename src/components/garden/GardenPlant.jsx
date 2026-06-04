import React from 'react';
import { motion } from 'framer-motion';

const PLANT_STAGES = {
  seed: { emoji: '🌰', size: 'text-4xl', label: 'Seed', soilHeight: '20%' },
  sprout: { emoji: '🌱', size: 'text-5xl', label: 'Sprout', soilHeight: '25%' },
  leaf: { emoji: '🌿', size: 'text-6xl', label: 'Leaf', soilHeight: '30%' },
  bloom: { emoji: '🌸', size: 'text-7xl', label: 'Bloom', soilHeight: '35%' },
  forest_master: { emoji: '🌳', size: 'text-8xl', label: 'Forest Master', soilHeight: '40%' },
};

export default function GardenPlant({ level = 'seed' }) {
  const stage = PLANT_STAGES[level] || PLANT_STAGES.seed;

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square flex items-center justify-center">
      {/* Glow circle */}
      <div className="absolute w-48 h-48 rounded-full bg-primary/10 animate-pulse-glow" />
      <div className="absolute w-64 h-64 rounded-full bg-primary/5 animate-pulse-glow" style={{ animationDelay: '1s' }} />
      
      {/* Soil */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-3xl bg-gradient-to-t from-amber-900/40 to-transparent"
        style={{ height: stage.soilHeight }}
      />

      {/* Plant */}
      <motion.div
        key={level}
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative z-10"
      >
        <motion.span
          className={`${stage.size} block`}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {stage.emoji}
        </motion.span>
      </motion.div>
    </div>
  );
}