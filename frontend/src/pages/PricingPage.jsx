import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api, { fetchPlans } from '../services/api.js';

let razorpayScriptPromise;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  razorpayScriptPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Checkout could not be loaded.'));
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
}

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [interval, setInterval] = useState('monthly');
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const query = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });

  if (query.isLoading) return <main className="page-main"><div className="status-panel" role="status">Loading plan details…</div></main>;
  if (query.isError) return <main className="page-main"><div className="status-panel error-panel" role="alert"><strong>Plan details are unavailable.</strong><span>We couldn’t load current prices. Please try again.</span><button type="button" className="text-button" onClick={() => query.refetch()}>Try again</button></div></main>;

  const { plans, currency, features, paymentConfigured, fairUseNote } = query.data;
  const freePrice = plans.free.priceMonthly;
  const premiumPrice = interval === 'monthly' ? plans.premium.priceMonthly : plans.premium.priceYearly;
  const yearlySavings = plans.premium.priceMonthly * 12 - plans.premium.priceYearly;
  const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount);

  async function beginCheckout() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }
    setCheckoutBusy(true);
    setCheckoutMessage('');
    try {
      const { data } = await api.post('/payments/create-order', { interval });
      await loadRazorpay();
      const order = data.data;
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'RecipeMaster',
        description: `Premium ${interval} plan`,
        order_id: order.orderId,
        handler: async (payment) => {
          try {
            await api.post('/payments/verify', {
              orderId: payment.razorpay_order_id,
              paymentId: payment.razorpay_payment_id,
              signature: payment.razorpay_signature,
            });
            await queryClient.invalidateQueries({ queryKey: ['subscription-usage'] });
            setCheckoutMessage('Payment verified. Premium is active on your account.');
          } catch {
            setCheckoutMessage('We could not verify that payment. Please contact support before trying again.');
          } finally {
            setCheckoutBusy(false);
          }
        },
        modal: { ondismiss: () => setCheckoutBusy(false) },
        theme: { color: '#b5533c' },
      });
      checkout.on('payment.failed', () => {
        setCheckoutMessage('Payment did not complete. You have not been charged through RecipeMaster; try again or contact support.');
        setCheckoutBusy(false);
      });
      checkout.open();
    } catch (error) {
      setCheckoutMessage(error.response?.data?.error?.message || 'We could not start checkout. Please try again.');
      setCheckoutBusy(false);
    }
  }

  return <main className="page-main pricing-page">
    <section className="page-intro">
      <p className="eyebrow">PLANS FROM YOUR RECIPEMASTER SETTINGS</p>
      <h1>Good food, at your pace.</h1>
      <p>Start free. Choose Premium when you need more recipe searches.</p>
    </section>
    <div className="pricing-toolbar">
      <div className="billing-toggle" role="group" aria-label="Billing interval">
        <button type="button" aria-pressed={interval === 'monthly'} onClick={() => setInterval('monthly')}>Monthly</button>
        <button type="button" aria-pressed={interval === 'yearly'} onClick={() => setInterval('yearly')}>Yearly</button>
      </div>
      {interval === 'yearly' && yearlySavings > 0 && <span className="savings-note">Yearly price difference: {money(yearlySavings)} compared with 12 monthly payments.</span>}
    </div>
    <section className="plan-columns" aria-label="Available plans">
      <article className="plan-column">
        <p className="eyebrow">START HERE</p>
        <h2>Free</h2>
        <p className="plan-price">{money(freePrice)}<span>/ month</span></p>
        <p className="plan-description">Recipe discovery and essential account features.</p>
        <Link className="plan-action secondary-action" to="/register">Create a free account</Link>
        <p className="plan-limit">{plans.free.limits.recipeSearchesPerDay} recipe searches per day.</p>
      </article>
      <article className="plan-column premium-plan">
        <p className="eyebrow">MORE ROOM TO SEARCH</p>
        <h2>Premium</h2>
        <p className="plan-price">{money(premiumPrice)}<span>/ {interval === 'monthly' ? 'month' : 'year'}</span></p>
        <p className="plan-description">Unlimited recipe searches, subject to fair use.</p>
        <button className="plan-action" type="button" disabled={!paymentConfigured || checkoutBusy} title={!paymentConfigured ? 'Payment provider credentials are not configured.' : undefined} onClick={beginCheckout}>
          {!paymentConfigured ? 'Payment setup required' : checkoutBusy ? 'Opening secure checkout…' : user ? 'Continue to checkout' : 'Log in to upgrade'}
        </button>
        {checkoutMessage && <p className="payment-message" role="status">{checkoutMessage}</p>}
        <p className="plan-limit">{fairUseNote}</p>
      </article>
    </section>
    <section className="feature-comparison">
      <h2>What’s included</h2>
      <div className="comparison-row comparison-header"><span>Feature</span><span>Free</span><span>Premium</span></div>
      {features.map((feature) => <div className="comparison-row" key={feature.key}><span>{feature.label}</span><span>{feature.key === 'recipeSearchesPerDay' ? `${plans.free.limits[feature.key]} / day` : 'Included'}</span><span>{feature.key === 'recipeSearchesPerDay' ? 'Unlimited*' : 'Included'}</span></div>)}
      <p className="fair-use-note">* {fairUseNote}</p>
    </section>
    <p className="pricing-refund">Payments and refunds will be handled under the <Link to="/refund-policy">Refund Policy</Link>.</p>
  </main>;
}