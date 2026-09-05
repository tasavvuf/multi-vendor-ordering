INSERT INTO vendors (name, description)
VALUES
  ('Fresh Basket', 'Local produce and pantry essentials'),
  ('Daily Grind', 'Small-batch coffee and baked goods')
ON CONFLICT DO NOTHING;

INSERT INTO products (vendor_id, name, description, price)
SELECT v.id, seed.name, seed.description, seed.price
FROM vendors v
JOIN (VALUES
  ('Fresh Basket', 'Seasonal Fruit Box', 'A mixed box of seasonal fruit.', 18.50::numeric),
  ('Fresh Basket', 'Sourdough Loaf', 'Handmade naturally leavened bread.', 6.00::numeric),
  ('Daily Grind', 'House Coffee Beans', 'Freshly roasted whole beans.', 14.00::numeric),
  ('Daily Grind', 'Cinnamon Roll', 'Soft roll with cinnamon glaze.', 4.50::numeric)
) AS seed(vendor_name, name, description, price) ON seed.vendor_name = v.name
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.vendor_id = v.id AND p.name = seed.name
);
