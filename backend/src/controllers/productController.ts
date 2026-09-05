import { RequestHandler } from 'express';
import { pool } from '../config/db';

export const getProducts: RequestHandler = async (_request, response, next) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.created_at AS "createdAt",
              json_build_object('id', v.id, 'name', v.name) AS vendor
       FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       WHERE p.is_available = true
       ORDER BY p.name`,
    );
    response.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
