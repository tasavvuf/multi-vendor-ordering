import { PoolClient } from 'pg';
import { pool } from '../config/db';
import { CreateOrderInput } from '../schemas/orderSchema';
import { AppError } from '../utils/errors';

type ProductRow = {
  id: string;
  vendor_id: string;
  price: string;
};

export async function createOrder(input: CreateOrderInput) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const vendorIds = input.vendors.map((vendor) => vendor.vendorId);
    const vendorsResult = await client.query<{ id: string }>(
      'SELECT id FROM vendors WHERE id = ANY($1::uuid[])',
      [vendorIds],
    );
    const existingVendorIds = new Set(vendorsResult.rows.map((vendor) => vendor.id));
    const missingVendor = vendorIds.find((vendorId) => !existingVendorIds.has(vendorId));

    if (missingVendor) {
      throw new AppError(400, `Vendor ${missingVendor} does not exist`);
    }

    const productIds = input.vendors.flatMap((vendor) => vendor.items.map((item) => item.productId));
    const productsResult = await client.query<ProductRow>(
      'SELECT id, vendor_id, price FROM products WHERE id = ANY($1::uuid[]) AND is_available = true FOR UPDATE',
      [productIds],
    );
    const products = new Map(productsResult.rows.map((product) => [product.id, product]));
    const missingProduct = productIds.find((productId) => !products.has(productId));

    if (missingProduct) {
      throw new AppError(400, `Product ${missingProduct} does not exist`);
    }

    const totalInPaise = input.vendors.reduce((vendorTotal, vendor) => {
      return vendorTotal + vendor.items.reduce((itemTotal, item) => {
        const product = products.get(item.productId) as ProductRow;
        if (product.vendor_id !== vendor.vendorId) {
          throw new AppError(400, `Product ${item.productId} does not belong to vendor ${vendor.vendorId}`);
        }
        const unitPriceInPaise = Math.round(Number(product.price) * 100);
        return itemTotal + unitPriceInPaise * item.quantity;
      }, 0);
    }, 0);
    const orderResult = await client.query<{ id: string }>(
      'INSERT INTO orders (total) VALUES ($1) RETURNING id',
      [(totalInPaise / 100).toFixed(2)],
    );
    const orderId = orderResult.rows[0].id;

    for (const vendor of input.vendors) {
      for (const item of vendor.items) {
        const product = products.get(item.productId) as ProductRow;
        await insertOrderItem(client, orderId, product, item.quantity);
      }
    }

    await client.query('COMMIT');
    return getOrderById(orderId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function insertOrderItem(client: PoolClient, orderId: string, product: ProductRow, quantity: number) {
  await client.query(
    `INSERT INTO order_items (order_id, product_id, vendor_id, quantity, unit_price)
     VALUES ($1, $2, $3, $4, $5)`,
    [orderId, product.id, product.vendor_id, quantity, product.price],
  );
}

export async function getOrderById(orderId: string) {
  const result = await pool.query(
    `SELECT
      o.id, o.total, o.status, o.created_at AS "createdAt",
       COALESCE(json_agg(json_build_object(
         'productId', oi.product_id, 'vendorId', oi.vendor_id,
         'quantity', oi.quantity, 'unitPrice', oi.unit_price
       ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]'::json) AS items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.id = $1
     GROUP BY o.id`,
    [orderId],
  );

  if (result.rowCount === 0) {
    throw new AppError(404, 'Order not found');
  }

  return result.rows[0];
}
