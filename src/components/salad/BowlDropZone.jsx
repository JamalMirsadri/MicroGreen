import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

export default function BowlDropZone({ items }) {
  return (
    <Droppable droppableId="bowl">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`relative rounded-full aspect-square flex flex-col items-center justify-center transition-all duration-300 border-4 ${
            snapshot.isDraggingOver
              ? 'border-primary/80 bg-primary/10 shadow-[0_0_60px_rgba(34,139,34,0.25)]'
              : 'border-border/40 bg-card/40'
          }`}
        >
          {/* Bowl rim decoration */}
          <div className="absolute inset-3 rounded-full border border-border/20 pointer-events-none" />

          {items.length === 0 ? (
            <div className="text-center px-6">
              <p className="text-4xl mb-2">🥣</p>
              <p className="font-body text-sm text-muted-foreground">
                {snapshot.isDraggingOver ? 'Drop it in!' : 'Drag ingredients here'}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2 p-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-3xl animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
                      {item.emoji}
                    </span>
                    <span className="font-body text-xs text-muted-foreground text-center leading-tight max-w-[60px]">
                      {item.name.split(' ')[0]}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}