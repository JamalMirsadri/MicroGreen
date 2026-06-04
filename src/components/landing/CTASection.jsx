import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlowButton from '../shared/GlowButton';
import FloatingParticles from '../shared/FloatingParticles';

export default function CTASection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-primary/5" />
      <FloatingParticles count={15} color="bg-primary/15" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">Ready?</p>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
          Your Garden
          <br />
          <span className="text-primary italic">Awaits</span>
        </h2>
        <p className="font-body text-lg text-foreground/60 mb-10 max-w-xl mx-auto">
          In just 2 minutes, discover the microgreens made for you. Grow your digital garden. Nourish your real life.
        </p>
        <Link to="/quiz">
          <GlowButton variant="primary" size="lg">
            Begin the Journey
          </GlowButton>
        </Link>
      </motion.div>
    </section>
  );
}