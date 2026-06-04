import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import FloatingParticles from '../components/shared/FloatingParticles';
import GlowButton from '../components/shared/GlowButton';
import { Share2, Copy } from 'lucide-react';
import { getQuizResult } from '@/lib/quizAccount';

export default function Share() {
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setResult(getQuizResult());
  }, []);

  const handleCopy = () => {
    const text = result
      ? `I discovered my Inner Garden identity: ${result.identity?.name}! 🌱 Find yours at Inner Garden.`
      : 'Discover your Inner Garden identity! 🌱';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-body text-muted-foreground mb-4">Take the quiz first to get your shareable identity card</p>
          <Link to="/quiz"><GlowButton variant="primary">Start Quiz</GlowButton></Link>
        </div>
      </div>
    );
  }

  const { identity } = result;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <FloatingParticles count={30} color="bg-primary/20" />
      <div className="max-w-md w-full relative z-10">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl overflow-hidden bg-gradient-to-br from-card via-secondary to-card border border-border/50 glow-green"
        >
          <div className="relative p-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
              >
                <span className="text-5xl">{identity.emoji}</span>
              </motion.div>

              <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-2">I am</p>
              <h2 className="font-display text-4xl font-bold text-foreground mb-3 text-glow">{identity.name}</h2>
              <p className="font-body text-sm text-foreground/60 leading-relaxed mb-6">{identity.description}</p>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {[result.mood, result.need, result.element].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-body text-primary capitalize">
                    {tag?.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span className="font-body">🌱 Inner Garden</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col gap-3"
        >
          <GlowButton onClick={handleCopy} variant="primary" size="md" className="w-full flex items-center justify-center gap-2">
            {copied ? '✓ Copied!' : <><Copy className="w-4 h-4" /> Copy Share Text</>}
          </GlowButton>
          <Link to="/recommendations">
            <GlowButton variant="ghost" size="md" className="w-full">
              See My Greens →
            </GlowButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}