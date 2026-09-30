import RecipeBrowser from '../components/RecipeBrowser.jsx';
import CuisineExplorer from '../components/CuisineExplorer.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const heroImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1500&q=90';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <>
      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" />{t('heroEyebrow')}</p>
            <h1>{t('heroTitleLead')} <em>{t('heroTitleEm')}</em></h1>
            <p className="hero-intro">{t('heroIntro')}</p>
            <a className="hero-link" href="#recipes">{t('heroFind')} <span aria-hidden="true">↓</span></a>
            <div className="hero-note"><span className="note-line" />{t('heroNote')}</div>
          </div>
          <figure className="hero-image-wrap">
            <img src={heroImage} alt={t('heroImageAlt')} />
            <figcaption><span>{t('heroPhotoLabel')}</span><span>{t('heroPhotoKicker')}</span></figcaption>
            <div className="image-caption">{t('heroTitleLead')}<br />{t('heroTitleEm')}</div>
          </figure>
          <span className="hero-index" aria-hidden="true">RM — 01</span>
        </section>

        <div className="home-rule"><span>{t('flowScan')}</span><i /> <span>{t('flowConfirm')}</span><i /> <span>{t('flowCook')}</span><i /> <span>{t('flowWaste')}</span></div>

        <RecipeBrowser compact />

        <section className="cuisine-band" id="cuisines">
          <div className="cuisine-band-copy">
            <p className="eyebrow">{t('worldEyebrow')}</p>
            <h2>{t('cuisineTitleFirst')}<br />{t('cuisineTitleSecond')}</h2>
          </div>
          <CuisineExplorer preview />
        </section>

        <section className="about-strip" id="about">
          <p className="eyebrow">{t('aboutEyebrow')}</p>
          <p>{t('aboutText')}</p>
          <a className="underlined-link" href="/recipes">{t('exploreRecipes')} <span aria-hidden="true">→</span></a>
        </section>
      </main>
    </>
  );
}