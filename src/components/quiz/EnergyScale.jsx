import React from 'react';
import { motion } from 'framer-motion';

export default function EnergyScale({ options, selected, onSelect }) {
  return (
    <div className="space-y-4">
      {/* Visual scale bar */}
      <div className="flex items-center gap-1 mb-6">
        {options.map((opt, i) => (
          <motion.button
            key={opt.value}
            whileHover={{ scaleY: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(opt.value)}
            className="flex-1 flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-full rounded-lg transition-all duration-300 ${
                selected === opt.value
                  ? 'bg-primary shadow-[0_0_20px_rgba(34,139,34,0.4)]'
                  : 'bg-secondary/60 group-hover:bg-primary/40'
              }`}
              style={{ height: `${32 + i * 14}px` }}
            />
            <span className="text-xl">{opt.icon}</span>
            <span className={`font-body text-xs font-medium transition-colors ${
              selected === opt.value ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {opt.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Selected description */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: selected ? 1 : 0, y: 0 }}
        className="text-center"
      >
        {selected && (
          <p className="font-body text-sm text-foreground/70 italic">
            {options.find(o => o.value === selected)?.description}
          </p>
        )}
      </motion.div>
    </div>
  );
}