import { NavLink } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label={t('homeLabel')}>
        <span className="brand-mark"><BrandMark /></span>
        <span>recipe<span className="brand-light">master</span></span>
      </a>
      <nav className="primary-nav" aria-label={t('mainNavigation')}>
        <NavLink to="/recipes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('navRecipes')}</NavLink>
        <NavLink to="/cuisines" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{t('navCuisines')}</NavLink>
        <NavLink to="/pricing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link nav-link-muted'}>Pricing</NavLink>
      </nav>
      <div className="header-tools">
        <a className="account-link" href={user ? '/dashboard' : '/login'}>{user ? user.name : 'Log in'}</a>
        <label className="language-picker">
          <span className="sr-only">Language</span>
          <select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>
        <a className="header-action" href="/recipes">
          <span>{t('findMeal')}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>
    </header>
  );
}