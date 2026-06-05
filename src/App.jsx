import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { CartProvider } from '@/lib/CartContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/shared/AppLayout';
import Landing from './pages/Landing';
import Quiz from './pages/Quiz';
import Reveal from './pages/Reveal';
import Recommendations from './pages/Recommendations';
import Garden from './pages/Garden';
import Rewards from './pages/Rewards';
import Subscribe from './pages/Subscribe';
import Share from './pages/Share';
import SaladBuilder from './pages/SaladBuilder';
import Admin from './pages/Admin';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';
import RequireAccount from './components/RequireAccount';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import Profile from './pages/Profile';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🌱</div>
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/create-account" element={<CreateAccount />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route
          path="/reveal"
          element={
            <RequireAccount>
              <Reveal />
            </RequireAccount>
          }
        />
        <Route
          path="/recommendations"
          element={
            <RequireAccount>
              <Recommendations />
            </RequireAccount>
          }
        />
        <Route
          path="/garden"
          element={
            <RequireAccount>
              <Garden />
            </RequireAccount>
          }
        />
        <Route
          path="/rewards"
          element={
            <RequireAccount>
              <Rewards />
            </RequireAccount>
          }
        />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route
          path="/share"
          element={
            <RequireAccount>
              <Share />
            </RequireAccount>
          }
        />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/cancel" element={<CheckoutCancel />} />
        <Route path="/salad-builder" element={<SaladBuilder />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <QueryClientProvider client={queryClientInstance}>
            <AuthenticatedApp />
            <Toaster />
          </QueryClientProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App