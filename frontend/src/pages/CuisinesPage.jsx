import CuisineExplorer from '../components/CuisineExplorer.jsx';

export default function CuisinesPage() {
  return <main className="page-main cuisine-page">
    <section className="page-intro">
      <p className="eyebrow">FROM MONGODB</p>
      <h1>Cuisines of India.</h1>
      <p>Explore Indian states and regional cooking traditions, with recipes grouped by place.</p>
    </section>
    <section aria-label="Cuisine hierarchy"><CuisineExplorer /></section>
  </main>;
}