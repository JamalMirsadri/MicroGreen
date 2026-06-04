import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import FloatingParticles from '../components/shared/FloatingParticles';
import GlowButton from '../components/shared/GlowButton';
import { api } from '@/api/apiClient';
import { getQuizResult } from '@/lib/quizAccount';

function normalizeProduct(p) {
  return {
    ...p,
    image: p.image_url || p.image,
    tagline: p.short_description,
    mood_match: p.mood_match || [],
    need_match: p.goal_match || p.need_match || [],
  };
}

export default function Recommendations() {
  const [result, setResult] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setResult(getQuizResult());
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (result) {
          const items = await api.recommendations({
            mood: result.mood,
            goal: result.goal,
            need: result.need,
          });
          setProducts(items.map(normalizeProduct));
        } else {
          const items = await api.entities.list('Product');
          setProducts(items.map(normalizeProduct));
        }
      } catch {
        setProducts([]);
      }
    };
    load();
  }, [result]);

  const getMatchReason = (product) => {
    if (!result) return null;
    if (product.mood_match?.includes('all')) return 'Crafted for your inner garden';
    const matches = [];
    if (product.mood_match?.includes(result.mood)) matches.push(`your ${result.mood} energy`);
    if (product.need_match?.includes(result.need)) matches.push(`your ${result.need} goals`);
    if (matches.length) return `Best for ${matches.join(' & ')}`;
    return null;
  };

  return (
    <div className="min-h-screen px-4 py-24 relative overflow-hidden">
      <FloatingParticles count={12} color="bg-primary/10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3">
            {result ? `Curated for ${result.identity?.name || 'You'}` : 'Our Collection'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Your <span className="text-primary italic">Recommended Greens</span>
          </h1>
          {result && (
            <p className="font-body text-lg text-foreground/60 max-w-xl mx-auto">
              Based on your {result.mood} mood, {result.need} goals, and {result.lifestyle} lifestyle.
            </p>
          )}
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <ProductCard
              key={product.id || product.name}
              product={product}
              matchReason={getMatchReason(product)}
              index={i}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16"
        >
          <Link to="/garden">
            <GlowButton variant="primary" size="lg">Grow Your Garden →</GlowButton>
          </Link>
          <GlowButton variant="ghost" size="md" onClick={() => navigate('/quiz')}>
            Retake Quiz
          </GlowButton>
        </motion.div>
      </div>
    </div>
  );
}
