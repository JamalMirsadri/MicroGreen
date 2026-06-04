import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, setToken } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { getPendingQuiz, syncQuizToAccount } from '@/lib/quizAccount';
import GlowButton from '@/components/shared/GlowButton';
import FloatingParticles from '@/components/shared/FloatingParticles';

export default function CreateAccount() {
  const navigate = useNavigate();
  const { checkUserAuth, isAuthenticated } = useAuth();
  const pending = getPendingQuiz();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pending) navigate('/quiz', { replace: true });
  }, [pending, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !pending) return;
    (async () => {
      try {
        await syncQuizToAccount(api, pending);
        navigate('/reveal', { replace: true });
      } catch (err) {
        console.error(err);
        setError('Could not save your garden. Please try again.');
      }
    })();
  }, [isAuthenticated, pending, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.auth.register({
        email,
        password,
        full_name: fullName,
      });
      setToken(token);
      await checkUserAuth({ optional: true });
      await syncQuizToAccount(api, pending);
      navigate('/reveal', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  if (!pending) return null;
  const { identity } = pending;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden bg-background">
      <FloatingParticles count={20} color="bg-primary/15" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10 rounded-2xl bg-card border border-border/50 p-8"
      >
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">{identity?.emoji || '🌱'}</span>
          <p className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-2">
            Quiz complete
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            You&apos;re <span className="text-primary font-medium">{identity?.name}</span>.
            Save your garden and manage it with your own account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-xs text-muted-foreground">Your name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jamie"
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/50 text-foreground font-body text-sm"
              required
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/50 text-foreground font-body text-sm"
              required
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/50 text-foreground font-body text-sm"
              required
            />
            <p className="font-body text-[10px] text-muted-foreground mt-1">At least 6 characters</p>
          </div>
          {error && <p className="text-sm text-red-400 font-body">{error}</p>}
          <GlowButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Creating your garden...' : 'Create Account & See My Identity'}
          </GlowButton>
        </form>

        <p className="text-center mt-6 font-body text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
