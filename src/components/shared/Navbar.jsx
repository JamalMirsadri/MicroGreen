import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, LogOut, Menu, ShoppingBag, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import CartDrawer from '@/components/shop/CartDrawer';

const NAV_LINKS = [
  { path: '/',        label: 'Home' },
  { path: '/quiz',    label: 'Discover' },
  { path: '/shop',    label: 'Shop' },
  { path: '/garden',  label: 'My Garden',  requiresAccount: true },
  { path: '/rewards', label: 'Rewards',    requiresAccount: true },
  { path: '/subscribe', label: 'Subscribe' },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();

  const handleNavClick = (link, e) => {
    if (link.requiresAccount && !isAuthenticated) {
      e.preventDefault();
      navigate('/login', { state: { from: link.path, message: 'Sign in to manage your garden' } });
      setOpen(false);
    }
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Leaf className="w-6 h-6 text-primary" />
              <span className="font-display text-xl font-semibold text-foreground">Inner Garden</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(link, e)}
                  className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/quiz"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Discover
              </Link>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </button>

              {isAuthenticated ? (
                <>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-body text-muted-foreground">
                    <User className="w-4 h-4" />
                    {user?.full_name || user?.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => logout(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
              <button onClick={() => setOpen(!open)} className="text-foreground">
                {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={(e) => { handleNavClick(link, e); setOpen(false); }}
                    className={`block px-4 py-3 rounded-lg text-sm font-body ${
                      isActive(link.path)
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => { logout(true); setOpen(false); }}
                    className="block w-full text-left px-4 py-3 rounded-lg text-sm text-muted-foreground"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 rounded-lg text-sm text-primary"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Cart drawer (portal-like, outside nav z-stack) */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
