import { pool } from '../config/db';
import { AppError } from '../utils/errors';

export async function getProductsByVendor(vendorId: string) {
  const result = await pool.query(
    `SELECT v.id AS vendor_id,
            v.name AS vendor_name,
            COALESCE(
              json_agg(
                json_build_object(
                  'id', p.id,
                  'name', p.name,
                  'price', p.price
                ) ORDER BY p.created_at DESC
              ) FILTER (WHERE p.id IS NOT NULL),
              '[]'::json
            ) AS products
     FROM vendors v
     LEFT JOIN products p ON p.vendor_id = v.id
     WHERE v.id = $1
     GROUP BY v.id, v.name`,
    [vendorId],
  );

  if (result.rows.length === 0) {
    throw new AppError(404, 'Vendor not found');
  }

  const [vendor] = result.rows;
  return {
    vendor: {
      id: vendor.vendor_id,
      name: vendor.vendor_name,
    },
    products: vendor.products,
  };
}