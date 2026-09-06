import { RequestHandler } from 'express';
import { pool } from '../config/db';
import { AppError } from '../utils/errors';
import { z } from 'zod';

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

export const searchProducts: RequestHandler = async (request, response, next) => {
  try {
    const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.created_at AS "createdAt",
              json_build_object('id', v.id, 'name', v.name) AS vendor
       FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       WHERE p.is_available = true
         AND ($1 = '' OR p.name ILIKE '%' || $1 || '%' OR p.description ILIKE '%' || $1 || '%' OR v.name ILIKE '%' || $1 || '%')
       ORDER BY p.name`,
      [query],
    );
    response.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

export const getProductById: RequestHandler = async (request, response, next) => {
  try {
    const productId = z.string().uuid().safeParse(request.params.id);
    if (!productId.success) {
      throw new AppError(400, 'Product id must be a UUID');
    }

    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.created_at AS "createdAt",
              json_build_object('id', v.id, 'name', v.name) AS vendor
       FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       WHERE p.id = $1 AND p.is_available = true`,
      [productId.data],
    );

    if (result.rowCount === 0) {
      throw new AppError(404, 'Product not found');
    }

    response.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
