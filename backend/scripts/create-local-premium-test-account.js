import 'dotenv/config';
import argon2 from 'argon2';
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Subscription from '../src/models/Subscription.js';

if (process.env.NODE_ENV === 'production' || process.env.ALLOW_TEST_ACCOUNT_SEED !== 'true') {
  console.error('Refusing to create a test account. Set ALLOW_TEST_ACCOUNT_SEED=true in a local environment.');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before creating a test account.');
  process.exit(1);
}

const suffix = randomBytes(5).toString('hex');
const email = `premium-test-${suffix}@example.com`;
const password = randomBytes(18).toString('base64url');

try {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'recipemaster',
  });

  const user = await User.create({
    name: 'Premium Test Account',
    email,
    passwordHash: await argon2.hash(password),
    emailVerified: true,
    accountStatus: 'active',
    preferredLanguage: 'en',
  });

  await Subscription.create({
    userId: user._id,
    plan: 'premium',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    autoRenew: false,
  });

  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('Plan: premium (local test, expires in 30 days)');
} catch (error) {
  console.error('Could not create the local premium test account:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
