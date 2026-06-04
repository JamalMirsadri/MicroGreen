import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '../lib/gameData';
import FloatingParticles from '../components/shared/FloatingParticles';
import GlowButton from '../components/shared/GlowButton';
import { api } from '@/api/apiClient';
import { toast } from '@/components/ui/use-toast';

export default function Subscribe() {
  const [selected, setSelected] = useState('sprout');
  const [submitting, setSubmitting] = useState(false);
  const BOX_IMAGE = 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/15ec03790_generated_a7816631.png';

  const handleSubscribe = async () => {
    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === selected);
    if (!tier || submitting) return;
    setSubmitting(true);
    try {
      await api.entities.create('Order', {
        items: [{ product_name: `Inner Garden ${tier.name}`, quantity: 1, price: tier.price }],
        total: tier.price,
        status: 'pending',
        subscription_tier: tier.id,
      });
      toast({ title: `Subscribed to ${tier.name}!` });
    } catch {
      toast({ title: 'Could not save subscription', description: 'Is the API running?', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-24 relative overflow-hidden">
      <FloatingParticles count={15} color="bg-accent/10" />
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3">Monthly Delivery</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Your Inner <span className="text-primary italic">Garden Box</span>
          </h1>
          <p className="font-body text-lg text-foreground/60 max-w-xl mx-auto">
            Personalized microgreens delivered monthly. Grow your garden, nourish your body.
          </p>
        </motion.div>

        {/* Box image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-16"
        >
          <img src={BOX_IMAGE} alt="Inner Garden subscription box" className="w-full rounded-2xl glow-green" />
        </motion.div>

        {/* Tiers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUBSCRIPTION_TIERS.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => setSelected(tier.id)}
              className={`relative cursor-pointer rounded-2xl border p-6 transition-all duration-300 ${
                selected === tier.id
                  ? 'border-primary/60 bg-primary/5 shadow-[0_0_30px_rgba(34,139,34,0.15)]'
                  : `${tier.borderColor} bg-card/60 hover:border-primary/30`
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-body font-semibold">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <span className="text-4xl block mb-2">{tier.icon}</span>
                <h3 className="font-display text-xl font-semibold text-foreground">{tier.name}</h3>
                <div className="mt-3">
                  <span className="font-display text-4xl font-bold text-primary">${tier.price}</span>
                  <span className="font-body text-sm text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="font-body text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
              <GlowButton
                variant={selected === tier.id ? 'primary' : 'ghost'}
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(tier.id);
                  if (selected === tier.id) handleSubscribe();
                }}
              >
                {selected === tier.id ? (submitting ? 'Saving...' : 'Subscribe Now') : 'Choose Plan'}
              </GlowButton>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}