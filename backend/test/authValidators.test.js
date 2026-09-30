import test from 'node:test';
import assert from 'node:assert/strict';
import { changePasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../src/validators/authValidators.js';

const registration = {
  name: 'Recipe Master',
  email: '  COOK@example.test  ',
  password: 'A good password 2026!',
  confirmPassword: 'A good password 2026!',
  preferredLanguage: 'ta',
  termsAccepted: true,
  marketingConsent: false,
  aiProcessingConsent: false,
};

test('registration normalizes email and preserves optional consent choices', () => {
  const result = registerSchema.parse(registration);
  assert.equal(result.email, 'cook@example.test');
  assert.equal(result.preferredLanguage, 'ta');
  assert.equal(result.aiProcessingConsent, false);
});

test('registration rejects a password equal to the email', () => {
  const result = registerSchema.safeParse({ ...registration, password: 'cook@example.test', confirmPassword: 'cook@example.test' });
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'password'));
});

test('registration rejects a common password and mismatched confirmation', () => {
  const common = registerSchema.safeParse({ ...registration, password: 'password123', confirmPassword: 'password123' });
  const mismatch = registerSchema.safeParse({ ...registration, confirmPassword: 'A different password 2026!' });
  assert.equal(common.success, false);
  assert.equal(mismatch.success, false);
  assert.ok(mismatch.error.issues.some((issue) => issue.path[0] === 'confirmPassword'));
});

test('registration requires explicit terms acceptance and supported language', () => {
  assert.equal(registerSchema.safeParse({ ...registration, termsAccepted: false }).success, false);
  assert.equal(registerSchema.safeParse({ ...registration, preferredLanguage: 'fr' }).success, false);
});

test('login accepts a short existing password and defaults keepSignedIn to false', () => {
  const result = loginSchema.parse({ email: 'Cook@example.test', password: 'old', });
  assert.equal(result.email, 'cook@example.test');
  assert.equal(result.keepSignedIn, false);
});

test('reset and password change require matching strong passwords', () => {
  const token = 'A'.repeat(43);
  assert.equal(resetPasswordSchema.safeParse({ token, password: 'A good password 2026!', confirmPassword: 'A good password 2026!' }).success, true);
  assert.equal(resetPasswordSchema.safeParse({ token, password: 'short', confirmPassword: 'short' }).success, false);
  assert.equal(changePasswordSchema.safeParse({ currentPassword: 'old', password: 'A good password 2026!', confirmPassword: 'not matching' }).success, false);
});