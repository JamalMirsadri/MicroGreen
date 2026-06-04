import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Menu, X, Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/quiz', label: 'Discover' },
  { path: '/garden', label: 'My Garden', requiresAccount: true },
  { path: '/rewards', label: 'Rewards', requiresAccount: true },
  { path: '/subscribe', label: 'Subscribe' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleNavClick = (link, e) => {
    if (link.requiresAccount && !isAuthenticated) {
      e.preventDefault();
      navigate('/login', { state: { from: link.path, message: 'Sign in to manage your garden' } });
      setOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-semibold text-foreground">Inner Garden</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => handleNavClick(link, e)}
                className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
                  location.pathname === link.path
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/quiz"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Discover
            </Link>
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

          <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

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
                  onClick={(e) => {
                    handleNavClick(link, e);
                    setOpen(false);
                  }}
                  className={`block px-4 py-3 rounded-lg text-sm font-body ${
                    location.pathname === link.path
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
  );
}
