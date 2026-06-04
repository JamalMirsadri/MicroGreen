import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/apiClient';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=200&q=60';

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, clearCart, subtotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [ordering, setOrdering]   = useState(false);
  const [ordered, setOrdered]     = useState(false);
  const [orderError, setOrderError] = useState('');

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!isAuthenticated) {
      onClose();
      return;
    }
    setOrdering(true);
    setOrderError('');
    try {
      await api.orders.create({
        items: items.map((i) => ({
          product_id: i.id,
          product_name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total: subtotal,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
      clearCart();
      setOrdered(true);
      setTimeout(() => { setOrdered(false); onClose(); }, 2400);
    } catch {
      setOrderError('Could not place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 38 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-background border-l border-border/50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-bold text-foreground">
                  Your Cart
                </h2>
                {itemCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {ordered ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div className="text-6xl">🌱</div>
                  <h3 className="font-display text-xl font-bold text-foreground">Order placed!</h3>
                  <p className="font-body text-sm text-muted-foreground">Your fresh microgreens are on their way.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div className="text-6xl opacity-40">🛒</div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Your cart is empty</h3>
                  <p className="font-body text-sm text-muted-foreground">Add some microgreens to get started</p>
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-shadow"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="flex gap-4 p-4 rounded-2xl bg-card border border-border/30"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <img
                            src={item.image_url || PLACEHOLDER}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = PLACEHOLDER; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm font-semibold text-foreground truncate">{item.name}</p>
                          <p className="font-body text-xs text-muted-foreground capitalize mt-0.5">{item.category}</p>
                          <p className="font-display text-sm font-bold text-primary mt-1.5">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center gap-1 rounded-lg border border-border/50 overflow-hidden">
                            <button
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !ordered && (
              <div className="border-t border-border/40 px-6 py-5 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-muted-foreground">Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                  <span className="font-display text-xl font-bold text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <p className="font-body text-xs text-muted-foreground">Shipping calculated at checkout</p>

                {orderError && (
                  <p className="text-red-400 text-xs font-body">{orderError}</p>
                )}

                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    onClick={onClose}
                    state={{ from: '/shop', message: 'Sign in to place your order' }}
                    className="block w-full text-center py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base hover:shadow-[0_0_28px_rgba(34,197,94,0.35)] transition-shadow"
                  >
                    Sign in to Checkout
                  </Link>
                ) : (
                  <button
                    onClick={handleCheckout}
                    disabled={ordering}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base hover:shadow-[0_0_28px_rgba(34,197,94,0.35)] transition-all disabled:opacity-60"
                  >
                    {ordering ? 'Placing order…' : `Place Order — $${subtotal.toFixed(2)}`}
                  </button>
                )}

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-xs font-body text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
