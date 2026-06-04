import React from 'react';
import { motion } from 'framer-motion';

export default function QuizCard({ option, selected, onSelect }) {
  const isSelected = selected === option.value;

  return (
    <motion.button
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onSelect(option.value)}
      className="relative w-full text-left group"
    >
      {/* Outer glow on select */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(50,200,80,0.18), transparent 70%)' }}
        initial={false}
        animate={{ opacity: isSelected ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Card body */}
      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-300"
        style={{
          borderColor: isSelected ? 'rgba(50,190,70,0.5)' : 'rgba(255,255,255,0.06)',
          background: isSelected
            ? 'linear-gradient(135deg, rgba(50,190,70,0.10) 0%, rgba(50,190,70,0.05) 50%, transparent 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          boxShadow: isSelected ? '0 0 28px rgba(50,190,70,0.14), inset 0 1px 0 rgba(255,255,255,0.06)' : 'none',
        }}
      >
        {/* Inner shimmer line on top */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-center gap-4 px-4 py-4">
          {/* Icon with glass pill */}
          <div className={`
            shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300
            ${isSelected
              ? 'bg-primary/20 shadow-[0_0_16px_rgba(50,200,70,0.25)]'
              : 'bg-white/[0.05] group-hover:bg-white/[0.09]'
            }
          `}>
            {option.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`font-body font-semibold text-sm leading-tight transition-colors duration-200 ${
              isSelected ? 'text-primary' : 'text-white/85 group-hover:text-white'
            }`}>
              {option.label}
            </p>
            {option.description && (
              <p className="font-body text-xs text-white/35 mt-0.5 leading-relaxed line-clamp-1">
                {option.description}
              </p>
            )}
          </div>

          {/* Selection indicator */}
          <motion.div
            className="shrink-0"
            initial={false}
            animate={isSelected ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(50,200,70,0.5)]">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.button>
  );
}