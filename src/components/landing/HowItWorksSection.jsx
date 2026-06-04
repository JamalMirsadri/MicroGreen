import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Leaf, Package, Trophy } from 'lucide-react';

const STEPS = [
  { icon: Sparkles, title: 'Discover', description: 'Answer playful questions about your mood, energy, and goals.', color: 'text-accent' },
  { icon: Leaf, title: 'Reveal', description: 'Uncover your unique green identity and personalized profile.', color: 'text-primary' },
  { icon: Package, title: 'Receive', description: 'Get microgreens crafted specifically for your body and mind.', color: 'text-emerald-400' },
  { icon: Trophy, title: 'Grow', description: 'Build your garden, earn rewards, and watch your wellness bloom.', color: 'text-accent' },
];

export default function HowItWorksSection() {
  return (
    <section className="py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">Your Journey</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            How It <span className="text-primary italic">Works</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mx-auto mb-6 group-hover:border-primary/40 transition-colors">
                <step.icon className={`w-7 h-7 ${step.color}`} />
              </div>
              <div className="font-body text-xs text-muted-foreground mb-2">Step {i + 1}</div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}