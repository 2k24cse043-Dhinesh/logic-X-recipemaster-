import { getDbState } from '../config/db.js';

export default function requireDatabase(req, res, next) {
  if (getDbState() === 'connected') return next();

  return res.status(503).json({
    success: false,
    error: { code: 'SERVICE_UNAVAILABLE', message: 'Recipe data is temporarily unavailable. Please try again.' },
  });
}