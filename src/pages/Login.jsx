import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api, setToken } from '@/api/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { getPendingQuiz, syncQuizToAccount, getQuizResult } from '@/lib/quizAccount';
import GlowButton from '@/components/shared/GlowButton';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkUserAuth } = useAuth();
  const pending = getPendingQuiz();
  const from = location.state?.from || '/garden';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const afterAuthRedirect = () => {
    if (pending || getQuizResult()) return '/reveal';
    return from;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await api.auth.login({ email, password });
      setToken(token);
      await checkUserAuth({ optional: true });
      if (pending) {
        await syncQuizToAccount(api, pending);
      }
      navigate(afterAuthRedirect(), { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border/50 p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌱</div>
          <h1 className="font-display text-2xl font-bold text-foreground">Sign In</h1>
          <p className="font-body text-sm text-muted-foreground mt-2">
            {location.state?.message || 'Access your personal Inner Garden'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="mt-1 w-full px-4 py-2.5 rounded-xl bg-secondary border border-border/50 text-foreground font-body text-sm"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400 font-body">{error}</p>}
          <GlowButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </GlowButton>
        </form>
        <p className="text-center mt-6 font-body text-sm text-muted-foreground">
          New here?{' '}
          <Link to={pending ? '/create-account' : '/quiz'} className="text-primary hover:underline">
            {pending ? 'Finish creating your account' : 'Take the Discover quiz'}
          </Link>
        </p>
      </div>
    </div>
  );
}
