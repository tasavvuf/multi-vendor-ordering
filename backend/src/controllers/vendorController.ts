import { RequestHandler } from 'express';
import { pool } from '../config/db';
import { getProductsByVendor } from '../services/vendorService';

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

export const getVendorProducts: RequestHandler = async (request, response, next) => {
  try {
    const vendorId = Array.isArray(request.params.vendorId)
      ? request.params.vendorId[0]
      : request.params.vendorId;
    const data = await getProductsByVendor(vendorId);
    response.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


