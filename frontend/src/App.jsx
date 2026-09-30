import { Navigate, Route, Routes } from 'react-router-dom';
import SiteHeader from './components/SiteHeader.jsx';
import { useLanguage } from './context/LanguageContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CuisinesPage from './pages/CuisinesPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PricingPage from './pages/PricingPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';
import RecipesPage from './pages/RecipesPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import CookPage from './pages/CookPage.jsx';

function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <a className="footer-brand" href="/">RecipeMaster<span>®</span></a>
      <p>{t('footerTagline')}</p>
      <span className="footer-credit">{t('footerCredit')}</span>
    </footer>
  );
}

function RequireAuth({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) return <main className="page-main"><div className="status-panel" role="status">Restoring your session…</div></main>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />
      <Routes>
        <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/recipes" element={<RequireAuth><RecipesPage /></RequireAuth>} />
        <Route path="/cuisines" element={<RequireAuth><CuisinesPage /></RequireAuth>} />
        <Route path="/recipes/:slug" element={<RequireAuth><RecipeDetailPage /></RequireAuth>} />
        <Route path="/r/:shareToken" element={<RequireAuth><RecipeDetailPage shared /></RequireAuth>} />
        <Route path="/cook/:slug" element={<RequireAuth><CookPage /></RequireAuth>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pricing" element={<RequireAuth><PricingPage /></RequireAuth>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}