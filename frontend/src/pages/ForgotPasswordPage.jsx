import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthLayout from '../components/AuthLayout.jsx';
import api from '../services/api.js';
import { emailFormSchema } from '../validation/authSchemas.js';

const confirmation = "If an account exists for that email, we've sent a link to reset your password. The link expires in 30 minutes.";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(emailFormSchema), defaultValues: { email: '' } });

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  async function send(email) {
    setFormError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSentTo(email);
      setSeconds(60);
    } catch {
      setSentTo(email);
      setSeconds(60);
      setFormError('');
    }
  }

  return <AuthLayout eyebrow="ACCOUNT RECOVERY">
    <p className="eyebrow">FORGOT YOUR PASSWORD?</p>
    <h1 className="auth-title">Let’s get you<br />back in.</h1>
    {!sentTo ? <>
      <p className="auth-subtitle">Enter the email address linked to your account.</p>
      {formError && <div className="form-alert" role="alert">{formError}</div>}
      <form className="auth-form" onSubmit={handleSubmit(({ email }) => send(email))} aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting}>
          <div className="form-field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />{errors.email && <small id="email-error" className="field-error">{errors.email.message}</small>}</div>
          <button className="auth-submit" type="submit">{isSubmitting ? 'Sending…' : 'Send reset link'}</button>
        </fieldset>
      </form>
    </> : <>
      <p className="auth-subtitle">{confirmation}</p>
      <p className="resend-address">{sentTo}</p>
      <button className="text-button cooldown-button" type="button" disabled={seconds > 0 || isSubmitting} onClick={() => send(sentTo)}>{seconds > 0 ? `Didn’t get it? Send again in ${seconds}s` : 'Didn’t get it? Send again'}</button>
    </>}
    <p className="auth-switch"><Link to="/login">Back to log in</Link></p>
  </AuthLayout>;
}