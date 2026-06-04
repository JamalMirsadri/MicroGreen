import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Leaf, Package, ShoppingBag } from 'lucide-react';
import { api } from '@/api/apiClient';
import { useCart } from '@/lib/CartContext';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const orderId   = params.get('order_id');
  const isDemo    = params.get('demo') === '1';

  const { clearCart } = useCart();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    clearCart();
    if (sessionId && !isDemo) {
      api.checkout.getSession(sessionId)
        .then(setSession)
        .catch(() => setSession(null))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Glow circle */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-24 h-24 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-primary" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {isDemo ? 'Order Placed! 🌱' : 'Payment Successful! 🎉'}
          </h1>
          <p className="font-body text-muted-foreground text-base leading-relaxed mb-6">
            {isDemo
              ? 'Your demo order has been recorded. Configure Stripe in the admin panel to accept real payments.'
              : 'Thank you for your purchase. Your fresh microgreens will be harvested and shipped to you soon.'}
          </p>

          {/* Order details */}
          <div className="rounded-2xl bg-card border border-border/30 p-5 mb-8 text-left space-y-3">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 rounded bg-secondary animate-pulse" />
                <div className="h-4 rounded bg-secondary animate-pulse w-3/4" />
              </div>
            ) : (
              <>
                {(orderId || session?.order_id) && (
                  <div className="flex items-center justify-between text-sm font-body">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="text-foreground font-mono text-xs bg-secondary px-2 py-1 rounded-lg">
                      {(orderId || session?.order_id)?.slice(-12)}
                    </span>
                  </div>
                )}
                {session?.customer_email && (
                  <div className="flex items-center justify-between text-sm font-body">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground">{session.customer_email}</span>
                  </div>
                )}
                {session?.amount_total && (
                  <div className="flex items-center justify-between text-sm font-body">
                    <span className="text-muted-foreground">Amount paid</span>
                    <span className="text-primary font-bold font-display">
                      ${(session.amount_total / 100).toFixed(2)} {session.currency?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-body">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isDemo ? 'Confirmed (Demo)' : 'Paid & Confirmed'}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* What's next */}
          <div className="rounded-2xl bg-primary/5 border border-primary/15 p-5 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-primary shrink-0" />
              <p className="font-body text-sm font-semibold text-foreground">What happens next?</p>
            </div>
            <ol className="space-y-2.5 text-left">
              {[
                'We harvest your microgreens fresh to order',
                'Your order is packed with care',
                'Shipped within 1–2 business days',
                'Track your delivery via email',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-body text-muted-foreground">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/garden"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-shadow"
            >
              <Leaf className="w-4 h-4" /> Go to My Garden
            </Link>
            <Link
              to="/shop"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary text-foreground font-display font-semibold text-sm hover:bg-secondary/80 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
