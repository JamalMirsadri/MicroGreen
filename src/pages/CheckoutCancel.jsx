import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, XCircle } from 'lucide-react';

export default function CheckoutCancel() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-48 h-48 rounded-full bg-orange-500/8 blur-3xl" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="relative w-24 h-24 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-orange-400" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            Payment Cancelled
          </h1>
          <p className="font-body text-muted-foreground text-base leading-relaxed mb-8">
            No worries — your cart items are still saved. You can return and complete your purchase whenever you're ready.
          </p>

          {orderId && (
            <div className="rounded-2xl bg-card border border-border/30 p-4 mb-8">
              <p className="font-body text-sm text-muted-foreground">
                Pending order <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-foreground">{orderId.slice(-12)}</span> was cancelled.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/checkout"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm hover:shadow-[0_0_24px_rgba(34,197,94,0.4)] transition-shadow"
            >
              <ArrowLeft className="w-4 h-4" /> Try Again
            </Link>
            <Link
              to="/shop"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-secondary text-foreground font-display font-semibold text-sm hover:bg-secondary/80 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Back to Shop
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
