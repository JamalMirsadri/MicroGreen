import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { BADGES, LEVELS, DAILY_CHALLENGES, getLevel, getNextLevel } from '../lib/gameData';
import FloatingParticles from '../components/shared/FloatingParticles';
import { Link } from 'react-router-dom';

const XP_COLOR = 'rgba(50,200,70,1)';

function XPRing({ xp, nextLevel, currentLevel }) {
  const max = nextLevel ? nextLevel.minXp : currentLevel.minXp + 400;
  const pct = nextLevel ? Math.min(1, (xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) : 1;
  const r = 54; const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
      <svg width="160" height="160" viewBox="0 0 160 160" className="absolute inset-0 -rotate-90">
        {/* Track */}
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        {/* Progress */}
        <motion.circle
          cx="80" cy="80" r={r} fill="none"
          stroke="url(#xpgrad)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        <defs>
          <linearGradient id="xpgrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3aaa50" />
            <stop offset="100%" stopColor="#7de840" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center relative z-10">
        <motion.p
          className="font-display text-3xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          {xp}
        </motion.p>
        <p className="font-body text-[10px] uppercase tracking-widest text-white/40 mt-0.5">XP</p>
      </div>
    </div>
  );
}

export default function Rewards() {
  const [xp, setXp] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);

  useEffect(() => {
    api.garden.get().then((g) => {
      setXp(g.xp || 0);
      setEarnedBadges(g.badges || []);
      sessionStorage.setItem('gardenXP', String(g.xp));
    }).catch(() => {});
  }, []);

  const currentLevel = getLevel(xp);
  const nextLevel    = getNextLevel(xp);
  const nextXp       = nextLevel ? nextLevel.minXp - xp : 0;

  return (
    <div className="min-h-screen px-4 py-20 relative overflow-hidden">
      <FloatingParticles count={18} color="bg-primary/10" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(40,140,40,0.08), transparent 65%)'
      }} />

      <div className="max-w-4xl mx-auto relative z-10 space-y-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="font-body text-[10px] uppercase tracking-[0.30em] text-primary/60 mb-3">Your Progress</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white/90">
            Rewards & <span className="text-primary italic">Growth</span>
          </h1>
        </motion.div>

        {/* XP Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(20,60,20,0.6) 0%, rgba(10,30,10,0.4) 100%)',
            borderColor: 'rgba(50,200,70,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* XP ring */}
              <div className="shrink-0">
                <XPRing xp={xp} nextLevel={nextLevel} currentLevel={currentLevel} />
                <p className="text-center mt-3 font-body text-sm font-semibold text-primary">{currentLevel.icon} {currentLevel.name}</p>
              </div>

              {/* Stats */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Total XP', value: xp, icon: '⭐' },
                    { label: 'Badges', value: earnedBadges.length, icon: '🏅' },
                    { label: 'Level', value: currentLevel.name, icon: currentLevel.icon },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                      className="rounded-2xl text-center py-4 px-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="font-display text-lg font-bold text-white">{s.value}</div>
                      <div className="font-body text-[10px] uppercase tracking-wider text-white/35 mt-0.5">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress to next level */}
                {nextLevel && (
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-body text-xs text-white/40">{currentLevel.name}</span>
                      <span className="font-body text-xs text-white/40">{nextLevel.icon} {nextLevel.name} in {nextXp} XP</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #3aaa50, #7de840)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100)}%` }}
                        transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shareable banner strip */}
          <div className="px-8 py-4 border-t flex items-center justify-between gap-4" style={{ borderColor: 'rgba(50,200,70,0.12)', background: 'rgba(50,200,70,0.04)' }}>
            <p className="font-body text-xs text-white/40">Share your garden journey with the world</p>
            <Link to="/share">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-4 py-1.5 rounded-full text-xs font-semibold font-body"
                style={{ background: 'rgba(50,200,70,0.18)', border: '1px solid rgba(50,200,70,0.35)', color: '#7de840' }}
              >
                Share ↗
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Growth Levels */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-display text-xl font-semibold text-white/80 mb-5">Growth Levels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {LEVELS.map((level, i) => {
              const reached = xp >= level.minXp;
              return (
                <motion.div
                  key={level.name}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="rounded-2xl p-5 text-center transition-all"
                  style={{
                    background: reached ? 'rgba(40,140,40,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${reached ? 'rgba(50,200,70,0.28)' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: reached ? '0 0 20px rgba(50,200,70,0.08)' : 'none',
                  }}
                >
                  <span className={`text-3xl block mb-2 ${!reached ? 'grayscale opacity-40' : ''}`}>{level.icon}</span>
                  <p className={`font-body text-xs font-semibold ${reached ? 'text-primary' : 'text-white/30'}`}>{level.name}</p>
                  <p className="font-body text-[10px] text-white/20 mt-0.5">{level.minXp} XP</p>
                  {reached && <div className="mt-2 w-2 h-2 rounded-full bg-primary mx-auto" style={{ boxShadow: '0 0 8px rgba(50,200,70,0.7)' }} />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-xl font-semibold text-white/80 mb-5">Badge Collection</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {BADGES.map((badge, i) => {
              const earned = earnedBadges.includes(badge.id);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="rounded-2xl p-5 text-center relative overflow-hidden"
                  style={{
                    background: earned ? 'rgba(40,140,40,0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${earned ? 'rgba(50,200,70,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  {earned && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                      background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(50,200,70,0.08), transparent 70%)'
                    }} />
                  )}
                  <span className={`text-4xl block mb-3 relative ${!earned ? 'grayscale opacity-30' : ''}`}>{badge.icon}</span>
                  <p className={`font-body text-sm font-semibold relative ${earned ? 'text-white/90' : 'text-white/25'}`}>{badge.name}</p>
                  <p className={`font-body text-xs mt-1 relative ${earned ? 'text-white/40' : 'text-white/15'}`}>{badge.description}</p>
                  {earned && (
                    <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-semibold font-body relative"
                      style={{ background: 'rgba(50,200,70,0.2)', color: '#7de840', border: '1px solid rgba(50,200,70,0.3)' }}>
                      ✓ Earned
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Back CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center pb-4">
          <Link to="/garden">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-full font-body font-semibold text-sm"
              style={{ background: 'rgba(50,200,70,0.14)', border: '1px solid rgba(50,200,70,0.3)', color: '#7de840' }}
            >
              ← Back to Garden
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}