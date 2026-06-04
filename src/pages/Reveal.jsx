import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import FloatingParticles from '../components/shared/FloatingParticles';
import GlowButton from '../components/shared/GlowButton';
import { getQuizResult } from '@/lib/quizAccount';

export default function Reveal() {
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = getQuizResult();
    if (!stored) {
      navigate('/quiz');
      return;
    }
    setResult(stored);
    const timer = setTimeout(() => setRevealed(true), 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!result) return null;
  const { identity } = result;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <FloatingParticles count={40} color="bg-primary/25" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🌱
            </motion.div>
            <p className="font-body text-lg text-muted-foreground">Growing your identity...</p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 text-center max-w-lg"
          >
            {/* Glow ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center glow-green"
            >
              <span className="text-6xl animate-float">{identity.emoji}</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3"
            >
              You are
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-4 text-glow"
            >
              {identity.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="font-body text-lg text-foreground/70 leading-relaxed mb-4"
            >
              {identity.description}
            </motion.p>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap justify-center gap-2 mb-10"
            >
              {[result.mood, result.need, result.lifestyle, result.flavor].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-secondary border border-border/50 text-xs font-body text-foreground/70 capitalize">
                  {tag?.replace('_', ' ')}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link to="/recommendations">
                <GlowButton variant="primary" size="lg">
                  See My Greens
                </GlowButton>
              </Link>
              <Link to="/garden">
                <GlowButton variant="ghost" size="lg">
                  My Garden →
                </GlowButton>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}