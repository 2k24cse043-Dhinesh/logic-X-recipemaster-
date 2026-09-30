import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFoundPage() {
  const { t } = useLanguage();
  return <main className="page-main not-found"><p className="eyebrow">{t('notFoundEyebrow')}</p><h1>{t('notFoundTitle')}</h1><Link className="underlined-link" to="/">{t('backHome')} <span aria-hidden="true">→</span></Link></main>;
}