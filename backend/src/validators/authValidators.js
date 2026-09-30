import { z } from 'zod';

const commonPasswords = new Set([
  'password123', 'password1234', 'password12345', 'qwerty12345', '1234567890', '123456789a',
  'iloveyou123', 'letmein1234', 'welcome1234', 'admin123456', 'changeme123', 'Passw0rd!!',
  'india12345', 'monkey12345', 'football123', 'abc12345678', 'qwertyuiop', 'password@123',
]);

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const password = z.string().min(10).max(128);

function addPasswordIssues(value, context, emailValue) {
  if (commonPasswords.has(value.password.toLowerCase())) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'Choose a password that is not commonly used.' });
  }
  if (emailValue && value.password.toLowerCase() === emailValue.toLowerCase()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'Password cannot be your email address.' });
  }
  if (value.confirmPassword !== undefined && value.password !== value.confirmPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Passwords do not match.' });
  }
}

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email,
  password,
  confirmPassword: z.string(),
  preferredLanguage: z.enum(['en', 'ta', 'hi']).default('en'),
  termsAccepted: z.literal(true),
  marketingConsent: z.boolean().default(false),
  aiProcessingConsent: z.boolean().default(false),
}).superRefine((value, context) => addPasswordIssues(value, context, value.email));

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
  keepSignedIn: z.boolean().default(false),
});

export const emailSchema = z.object({ email });

export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{40,100}$/);

export const resetPasswordSchema = z.object({
  token: tokenSchema,
  password,
  confirmPassword: z.string(),
}).superRefine((value, context) => addPasswordIssues(value, context));

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  password,
  confirmPassword: z.string(),
}).superRefine((value, context) => addPasswordIssues(value, context));