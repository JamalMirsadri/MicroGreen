import React from 'react';
import { motion } from 'framer-motion';

export default function GlowButton({ children, onClick, variant = 'primary', className = '', size = 'lg' }) {
  const base = 'relative font-body font-semibold tracking-wide rounded-full transition-all duration-300 overflow-hidden';
  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-7 py-3 text-base',
    lg: 'px-10 py-4 text-lg',
  };
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:shadow-[0_0_40px_rgba(34,139,34,0.4)] glow-green',
    gold: 'bg-accent text-accent-foreground hover:shadow-[0_0_40px_rgba(218,165,32,0.4)] glow-gold',
    ghost: 'bg-transparent border border-primary/40 text-primary hover:bg-primary/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}