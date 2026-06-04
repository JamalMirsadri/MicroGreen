import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CreditCard, Lock, Minus, Plus,
  ShieldCheck, ShoppingBag, Trash2, Truck,
} from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/api/apiClient';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=200&q=60';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, subtotal, itemCount, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [stripeEnabled, setStripeEnabled] = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  useEffect(() => {
    api.checkout.status()
      .then((d) => setStripeEnabled(d.stripe_enabled))
      .catch(() => setStripeEnabled(false));
  }, []);

  const handleStripeCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const { url } = await api.checkout.createSession({
        items,
        origin: window.location.origin,
      });
      // Redirect to Stripe-hosted checkout page
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      await api.orders.create({
        items: items.map((i) => ({
          product_id: i.id,
          product_name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total: subtotal,
        status: 'paid',
        payment_provider: 'demo',
        created_at: new Date().toISOString(),
      });
      clearCart();
      navigate('/checkout/success?demo=1');
    } catch (err) {
      setError(err.message || 'Could not place order.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 pt-20">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/40" />
        <h2 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h2>
        <Link to="/shop" className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
          Browse Products
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= 30 ? 0 : 4.99;
  const total    = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-2">Checkout</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Review your order
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            {itemCount} item{itemCount !== 1 ? 's' : ''} · ${subtotal.toFixed(2)} subtotal
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* ── Left: Order items ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">Order Items</h2>

            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-5 p-4 rounded-2xl bg-card border border-border/30"
              >
                {/* Image */}
                <Link to={`/shop/${item.id}`} className="shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-border/20">
                    <img
                      src={item.image_url || PLACEHOLDER}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/shop/${item.id}`}>
                    <h3 className="font-display text-base font-semibold text-foreground hover:text-primary transition-colors truncate">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="font-body text-xs text-muted-foreground capitalize mt-0.5">{item.category}</p>
                  <p className="font-body text-sm font-semibold text-muted-foreground mt-1">
                    ${Number(item.price).toFixed(2)} each
                  </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0 rounded-xl border border-border/50 overflow-hidden">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-9 text-center font-bold text-sm text-foreground bg-card">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-display text-base font-bold text-primary ml-3 w-16 text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: ShieldCheck, label: 'Secure\npayment' },
                { icon: Truck,       label: 'Free shipping\n≥$30' },
                { icon: Lock,        label: 'SSL\nencrypted' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/50 border border-border/20 text-center">
                  <Icon className="w-5 h-5 text-primary" />
                  <p className="font-body text-[10px] text-muted-foreground leading-tight whitespace-pre-line">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Order summary + payment ────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="sticky top-24"
          >
            <div className="rounded-3xl bg-card border border-border/40 p-7 shadow-xl">
              <h2 className="font-display text-lg font-bold text-foreground mb-6">Order Summary</h2>

              {/* Line totals */}
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-400 font-semibold' : 'text-foreground font-medium'}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-primary">
                    Add ${(30 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t border-border/40 pt-3 flex justify-between font-display font-bold text-lg text-foreground">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm font-body">{error}</p>
                </div>
              )}

              <div className="mt-6 space-y-3">
                {/* Auth gate */}
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      state={{ from: '/checkout', message: 'Sign in to complete your purchase' }}
                      className="block w-full text-center py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base hover:shadow-[0_0_28px_rgba(34,197,94,0.4)] transition-shadow"
                    >
                      Sign in to Pay
                    </Link>
                    <p className="text-xs font-body text-center text-muted-foreground">
                      Account needed to complete your order
                    </p>
                  </>
                ) : stripeEnabled === null ? (
                  <div className="w-full py-4 rounded-xl bg-secondary animate-pulse" />
                ) : stripeEnabled ? (
                  <>
                    {/* Stripe Checkout button */}
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStripeCheckout}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-display font-bold text-base bg-[#635BFF] text-white hover:bg-[#5249e0] hover:shadow-[0_0_28px_rgba(99,91,255,0.5)] transition-all disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Redirecting to Stripe…
                        </span>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
                          </svg>
                          Pay with Stripe · ${total.toFixed(2)}
                        </>
                      )}
                    </motion.button>

                    {/* Stripe Link note */}
                    <div className="flex items-center justify-center gap-2 py-1">
                      <div className="h-px flex-1 bg-border/30" />
                      <p className="text-[11px] font-body text-muted-foreground px-2">or use Stripe Link</p>
                      <div className="h-px flex-1 bg-border/30" />
                    </div>
                    <p className="text-center text-[11px] font-body text-muted-foreground">
                      One-click checkout for returning customers · Pay with saved cards, Apple Pay, Google Pay
                    </p>
                  </>
                ) : (
                  /* Demo checkout (Stripe not configured) */
                  <>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-2">
                      <p className="text-amber-400 text-xs font-body text-center">
                        Demo mode — Stripe not configured yet. Orders are saved without payment.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDemoOrder}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base hover:shadow-[0_0_28px_rgba(34,197,94,0.4)] transition-all disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Placing order…
                        </span>
                      ) : (
                        <><CreditCard className="w-5 h-5" /> Place Demo Order · ${total.toFixed(2)}</>
                      )}
                    </motion.button>
                    <p className="text-center text-[11px] font-body text-muted-foreground">
                      Add STRIPE_SECRET_KEY in admin → Payments to enable real payments
                    </p>
                  </>
                )}
              </div>

              {/* Security note */}
              <div className="mt-5 flex items-center justify-center gap-1.5 text-muted-foreground/60">
                <Lock className="w-3 h-3" />
                <p className="font-body text-[10px]">Secured by Stripe · PCI DSS compliant</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
