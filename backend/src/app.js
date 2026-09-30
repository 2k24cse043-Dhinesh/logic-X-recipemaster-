import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { getDbState } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import recipeRoutes from './routes/recipeRoutes.js';
import planRoutes from './routes/planRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cuisineRoutes from './routes/cuisineRoutes.js';
import pantryRoutes from './routes/pantryRoutes.js';
import logger from './utils/logger.js';

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):517[0-9]$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buffer) => {
    if (req.originalUrl.startsWith('/api/payments/webhook')) req.rawBody = Buffer.from(buffer);
  },
}));
app.use(mongoSanitize());
app.use(pinoHttp({ logger }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (req, res) => {
  const db = getDbState();
  res.status(db === 'connected' ? 200 : 503).json({
    success: db === 'connected',
    data: { status: db === 'connected' ? 'ok' : 'degraded', db },
  });
});

app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cuisines', cuisineRoutes);
app.use('/api/pantry', pantryRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;