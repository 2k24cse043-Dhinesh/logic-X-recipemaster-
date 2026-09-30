import mongoose from 'mongoose';
import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import { getDbState } from '../config/db.js';

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'The request body must be valid JSON.' },
    });
  }
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Check the highlighted fields and try again.',
        fields: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
      },
    });
  }

  if (Number.isInteger(error.status) && error.code) {
    return res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    });
  }

  if (getDbState() !== 'connected' || error instanceof mongoose.Error.MongooseServerSelectionError) {
    return res.status(503).json({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Recipe data is temporarily unavailable. Please try again.' },
    });
  }

  logger.error({ err: error, path: req.path }, 'Request failed');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
  });
}