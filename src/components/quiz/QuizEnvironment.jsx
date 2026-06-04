import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Background gradient transitions across all 7 steps
const BG_STOPS = [
  ['#1a0c04', '#100804', '#080503'],  // 0 Seed — warm dark earth
  ['#060f05', '#040c04', '#030703'],  // 1 Germinating
  ['#051108', '#030d05', '#020804'],  // 2 Sprouting
  ['#04140a', '#031006', '#020904'],  // 3 Growing
  ['#041808', '#031206', '#020a04'],  // 4 Maturing
  ['#041c08', '#031508', '#020c04'],  // 5 Flourishing
  ['#052208', '#031a06', '#021005'],  // 6 Fully Grown
];

export default function QuizEnvironment({ step, children }) {
  const [a, b, c] = BG_STOPS[Math.min(step, BG_STOPS.length - 1)];

  return (
    <div className="relative overflow-hidden">
      {/* Animated deep background */}
      <AnimatePresence>
        <motion.div
          key={`bg-${step}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 130% 90% at 30% 100%, ${a} 0%, ${b} 45%, ${c} 100%)`,
            zIndex: 0,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </AnimatePresence>

      {/* Cinematic vignette — dark edges focus the eye */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 115% 115% at 50% 50%, transparent 38%, rgba(0,0,0,0.48) 72%, rgba(0,0,0,0.75) 100%)',
          zIndex: 1,
        }}
      />

      {/* Subtle light shaft from top — like a greenhouse beam */}
      <motion.div
        key={`beam-${step}`}
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '220px',
          height: '55%',
          background: `linear-gradient(to bottom, rgba(180,240,140,${0.02 + step * 0.012}) 0%, transparent 100%)`,
          clipPath: 'polygon(30% 0%, 70% 0%, 90% 100%, 10% 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3.0, ease: 'easeInOut' }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.022,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
          zIndex: 1,
        }}
      />

      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}