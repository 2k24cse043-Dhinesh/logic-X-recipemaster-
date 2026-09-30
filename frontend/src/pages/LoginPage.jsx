import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { loginFormSchema } from '../validation/authSchemas.js';

const fallbackError = 'We couldn’t reach the server. Please try again.';

function errorMessage(error) {
  const code = error.response?.data?.error?.code;
  if (code === 'INVALID_CREDENTIALS') return 'Email or password is incorrect.';
  if (code === 'ACCOUNT_UNAVAILABLE') return "This account can't be used right now. Contact support.";
  if (code === 'TOO_MANY_ATTEMPTS') return 'Too many attempts. Try again in a few minutes.';
  return error.response?.status === 503 ? fallbackError : fallbackError;
}

export default function LoginPage() {
  const { user, login, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '', keepSignedIn: false },
  });

  if (!initializing && user) return <Navigate to="/dashboard" replace />;

  async function onSubmit(values) {
    setFormError('');
    try {
      await login(values);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      setFormError(errorMessage(error));
    }
  }

  async function retryLogin() {
    setRetrying(true);
    await handleSubmit(onSubmit)();
    setRetrying(false);
  }

  return (
    <AuthLayout eyebrow="WELCOME BACK">
      <p className="eyebrow">SIGN IN TO YOUR KITCHEN</p>
      <h1 className="auth-title">Good to have<br />you back.</h1>
      <p className="auth-subtitle">Log in to pick up where your next meal begins.</p>
      {formError && <div className="form-alert" role="alert">{formError}</div>}
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting}>
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
            {errors.email && <small id="email-error" className="field-error">{errors.email.message}</small>}
          </div>
          <PasswordField name="password" label="Password" autoComplete="current-password" registration={register('password')} error={errors.password} disabled={isSubmitting} />
          <label className="check-row"><input type="checkbox" {...register('keepSignedIn')} /><span>Keep me signed in on this device</span></label>
          <div className="form-link-row"><Link to="/forgot-password">Forgot your password?</Link></div>
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
          {formError === fallbackError && <button className="text-button retry-button" type="button" disabled={retrying} onClick={retryLogin}>{retrying ? 'Trying again…' : 'Retry'}</button>}
        </fieldset>
      </form>
      <p className="auth-switch">New to RecipeMaster? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}