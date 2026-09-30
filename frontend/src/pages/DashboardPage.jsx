import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  async function signOut() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setError('We could not sign you out. Please try again.');
    }
  }

  return <main className="page-main account-dashboard">
    <p className="eyebrow">YOUR RECIPEMASTER ACCOUNT</p>
    <h1>Welcome, {user.name}.</h1>
    <p className="account-email">{user.email}</p>
    {error && <p className="form-alert" role="alert">{error}</p>}
    <div className="dashboard-links"><Link className="auth-submit auth-submit-link" to="/recipes">Browse recipes</Link><button className="text-button" type="button" onClick={signOut}>Log out</button></div>
  </main>;
}