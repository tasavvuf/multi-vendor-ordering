import { RequestHandler } from 'express';
import { pool } from '../config/db';

export const getVendors: RequestHandler = async (_request, response, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, created_at AS "createdAt" FROM vendors ORDER BY name',
    );
    response.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
