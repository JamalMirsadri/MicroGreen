import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { getPendingQuiz } from '@/lib/quizAccount';

export default function RequireAccount({ children }) {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const location = useLocation();

  if (!authChecked || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const pending = getPendingQuiz();
    if (pending) {
      return <Navigate to="/create-account" replace state={{ from: location.pathname }} />;
    }
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: 'Sign in to manage your garden' }}
      />
    );
  }

  return children;
}
