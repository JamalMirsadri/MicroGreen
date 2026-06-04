import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import FloatingParticles from '../components/shared/FloatingParticles';
import GlowButton from '../components/shared/GlowButton';
import BowlDropZone from '../components/salad/BowlDropZone';
import IngredientCard from '../components/salad/IngredientCard';
import FlavorProfile from '../components/salad/FlavorProfile';
import BenefitsPanel from '../components/salad/BenefitsPanel';
import { INGREDIENTS, CATEGORIES, computeFlavorProfile, computeTopBenefits } from '../lib/saladData';
import { ShoppingBag, RotateCcw } from 'lucide-react';

export default function SaladBuilder() {
  const [bowlIds, setBowlIds] = useState([]);
  const [activeCategory, setActiveCategory] = useState('base');

  const bowlItems = bowlIds.map(id => INGREDIENTS.find(i => i.id === id)).filter(Boolean);
  const flavorProfile = computeFlavorProfile(bowlIds);
  const topBenefits = computeTopBenefits(bowlIds);
  const allTags = [...new Set(bowlItems.flatMap(i => i.tags))].slice(0, 8);

  const total = bowlItems.reduce((sum, i) => sum + i.price, 0);

  const toggleIngredient = (id) => {
    setBowlIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // Dragging from ingredient list into bowl
    if (source.droppableId !== 'bowl' && destination.droppableId === 'bowl') {
      if (!bowlIds.includes(draggableId)) {
        setBowlIds(prev => [...prev, draggableId]);
      }
    }
    // Dragging out of bowl (back to list area)
    if (source.droppableId === 'bowl' && destination.droppableId !== 'bowl') {
      setBowlIds(prev => prev.filter(id => id !== draggableId));
    }
  };

  const categoryIngredients = INGREDIENTS.filter(i => i.category === activeCategory);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen px-4 py-24 relative overflow-hidden">
        <FloatingParticles count={10} color="bg-primary/10" />
        <div className="max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-3">Drag & Drop</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-3">
              Build Your <span className="text-primary italic">Sacred Bowl</span>
            </h1>
            <p className="font-body text-muted-foreground">
              Drag microgreens into your bowl — watch your flavor profile and health benefits come alive.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">

            {/* Left — Ingredient Picker */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {/* Category tabs */}
              <div className="flex gap-1 mb-4 p-1 rounded-xl bg-secondary/50 border border-border/30">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-1 flex flex-col items-center py-2 rounded-lg text-xs font-body font-medium transition-all ${
                      activeCategory === cat.id
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="mt-0.5 hidden sm:block">{cat.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Droppable source list */}
              <Droppable droppableId={`list-${activeCategory}`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2.5"
                  >
                    {categoryIngredients.map((ing, index) => (
                      <IngredientCard
                        key={ing.id}
                        ingredient={ing}
                        index={index}
                        inBowl={bowlIds.includes(ing.id)}
                        onToggle={toggleIngredient}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <p className="font-body text-xs text-muted-foreground text-center mt-4">
                Tap to add · Drag into bowl
              </p>
            </motion.div>

            {/* Center — Bowl */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="lg:col-span-2 flex flex-col items-center"
            >
              <div className="w-full max-w-xs">
                <BowlDropZone items={bowlItems} />
              </div>

              {/* Bowl summary */}
              <div className="mt-6 w-full max-w-xs rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {bowlItems.length === 0 ? 'Empty Bowl' : `${bowlItems.length} ingredient${bowlItems.length > 1 ? 's' : ''}`}
                  </h3>
                  {bowlItems.length > 0 && (
                    <button
                      onClick={() => setBowlIds([])}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {bowlItems.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {bowlItems.map(item => (
                      <div key={item.id} className="flex justify-between font-body text-sm">
                        <span className="text-foreground/80">{item.emoji} {item.name}</span>
                        <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border/30 pt-3 flex justify-between items-center mb-4">
                  <span className="font-body font-semibold text-foreground">Total</span>
                  <span className="font-display text-xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>

                <GlowButton
                  variant={bowlItems.length > 0 ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {bowlItems.length > 0 ? 'Order My Bowl' : 'Add Ingredients First'}
                </GlowButton>
              </div>
            </motion.div>

            {/* Right — Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-5"
            >
              {/* Flavor Profile */}
              <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 p-5">
                <h3 className="font-display text-base font-semibold text-foreground mb-4">
                  Flavor Profile
                </h3>
                <FlavorProfile profile={flavorProfile} />
              </div>

              {/* Health Benefits */}
              <div className="rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 p-5">
                <h3 className="font-display text-base font-semibold text-foreground mb-4">
                  Health Benefits
                </h3>
                <BenefitsPanel benefits={topBenefits} tags={allTags} />
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </DragDropContext>
  );
}