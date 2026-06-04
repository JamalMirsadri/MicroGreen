import React from 'react';
import { motion } from 'framer-motion';
import FloatingParticles from '../shared/FloatingParticles';

const SPROUT_IMAGE = 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/60f01ff72_generated_6cbfe028.png';

export default function StorySection() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <FloatingParticles count={10} color="bg-accent/20" />
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">
            The Experience
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Not a Store.
            <br />
            <span className="text-primary italic">A Living World.</span>
          </h2>
          <p className="font-body text-foreground/60 text-lg leading-relaxed mb-6">
            Forget scrolling through endless product pages. Here, you embark on a personal discovery — answering playful questions, watching your digital garden grow, and receiving microgreens crafted specifically for your unique energy.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '6', label: 'Quiz Steps' },
              { num: '12+', label: 'Identities' },
              { num: '∞', label: 'Combinations' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-secondary/50 border border-border/50">
                <div className="font-display text-2xl font-bold text-primary">{stat.num}</div>
                <div className="font-body text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden glow-green">
            <img src={SPROUT_IMAGE} alt="Growing microgreen sprouts" className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}