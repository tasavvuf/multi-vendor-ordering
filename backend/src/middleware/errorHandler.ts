import { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }

  if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
    response.status(503).json({
      success: false,
      message: 'Database unavailable. Start PostgreSQL and verify DATABASE_URL.',
    });
    return;
  }

  response.status(500).json({ success: false, message: 'Internal server error' });
};
