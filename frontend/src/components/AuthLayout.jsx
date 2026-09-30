import { Link } from 'react-router-dom';

const authImage = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1300&q=85';

export default function AuthLayout({ children, eyebrow = 'YOUR KITCHEN, YOUR RECIPES' }) {
  return (
    <main className="auth-shell">
      <aside className="auth-editorial">
        <img src={authImage} alt="Fresh vegetables and ingredients ready for cooking" />
        <div className="auth-editorial-copy">
          <p className="eyebrow">{eyebrow}</p>
          <p className="auth-tagline">Turn what you have into what you can <em>cook.</em></p>
        </div>
      </aside>
      <section className="auth-main">
        <Link to="/" className="auth-back">← RecipeMaster</Link>
        <div className="auth-form-wrap">{children}</div>
        <footer className="auth-legal"><Link to="/privacy">Privacy Policy</Link><span>·</span><Link to="/terms">Terms of Service</Link></footer>
      </section>
    </main>
  );
}