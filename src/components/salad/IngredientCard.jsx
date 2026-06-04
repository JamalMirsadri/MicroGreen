import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';

export default function IngredientCard({ ingredient, index, inBowl, onToggle }) {
  return (
    <Draggable draggableId={ingredient.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
        >
          <motion.div
            whileHover={!snapshot.isDragging ? { scale: 1.02 } : {}}
            onClick={() => onToggle(ingredient.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all ${
              snapshot.isDragging
                ? 'border-primary/70 bg-primary/15 shadow-[0_8px_30px_rgba(34,139,34,0.2)] rotate-2 scale-105'
                : inBowl
                ? `${ingredient.activeColor} border-2`
                : `${ingredient.color} hover:border-primary/30`
            }`}
          >
            <span className="text-2xl shrink-0">{ingredient.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-medium text-foreground truncate">{ingredient.name}</p>
              <p className="font-body text-xs text-muted-foreground">${ingredient.price.toFixed(2)}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              inBowl ? 'bg-primary border-primary' : 'border-border'
            }`}>
              {inBowl && (
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}