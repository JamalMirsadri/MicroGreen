import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlowButton from '../shared/GlowButton';
import { api } from '@/api/apiClient';

const FALLBACK = [
  {
    name: 'Sunflower Microgreens',
    tagline: 'For energy & freshness',
    image: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/b547e2a64_generated_c681fa81.png',
    tags: ['Energy', 'Focus'],
    price: 8.99,
  },
  {
    name: 'Pea Shoot Medley',
    tagline: 'For lightness & balance',
    image: 'https://media.base44.com/images/public/6a0df0f9dbfc9532afb5c41c/ea9216c36_generated_947800ff.png',
    tags: ['Balance', 'Calm'],
    price: 9.99,
  },
];

function normalizeProduct(p) {
  return {
    ...p,
    image: p.image_url || p.image,
    tagline: p.short_description || p.tagline,
  };
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState(FALLBACK);

  useEffect(() => {
    api.entities
      .filter('Product', { filter: { is_featured: true }, limit: 4 })
      .then((items) => {
        if (items?.length) setProducts(items.map(normalizeProduct));
      })
      .catch(() => {
        api.entities.list('Product').then((items) => {
          if (items?.length) setProducts(items.slice(0, 4).map(normalizeProduct));
        }).catch(() => {});
      });
  }, []);

  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4">Curated for You</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Premium <span className="text-primary italic">Microgreens</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id || product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 transition-all duration-500">
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    {product.tags?.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium backdrop-blur-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-foreground">{product.name}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">{product.tagline}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-display text-xl font-bold text-primary">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <button className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                      Add to Box
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/quiz">
            <GlowButton variant="ghost" size="md">
              Get Personalized Picks →
            </GlowButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
