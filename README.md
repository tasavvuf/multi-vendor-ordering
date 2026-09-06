# Multi-Vendor Ordering

Multi-vendor ordering prototype with a React storefront, an Express REST API, and PostgreSQL persistence. Users can browse vendors and products, search the catalog, build a client-side cart, create an order across multiple vendors, and inspect order summaries and details.

The repository is the source of truth for the current implementation. Authentication, payments, inventory reservation, and automated tests are not implemented.

## Live Demo

No deployed application URL is present in the repository.

```text
Frontend: https://multi-vendor-ordering.vercel.app/
Backend API: https://multi-vendor-ordering.onrender.com/
```

## Features

- React storefront with responsive Tailwind CSS UI.
- Vendor list and vendor-specific product views.
- Product catalog and product detail routes.
- Product search by product name, description, or vendor name.
- Client-side cart with quantity controls and Indian rupee formatting.
- Multi-vendor checkout payload grouping.
- Server-side price lookup and total calculation.
- Transactional order creation with PostgreSQL.
- Order list and order detail routes.
- Order details grouped by vendor with vendor subtotals and a final total.
- Product and vendor navigation from carts and order details.
- Swagger UI and generated OpenAPI JSON.
- Helmet security headers and restricted CORS origins.

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS via `@tailwindcss/vite`
- Motion for the interactive dock
- Hugeicons React icons

### Backend

- Bun-compatible Node.js/Express TypeScript application
- Express 4
- PostgreSQL through the `pg` connection pool
- Zod request validation
- Helmet
- CORS
- Swagger UI and `swagger-jsdoc`

### Database

- PostgreSQL
- `pgcrypto` extension for UUID defaults

## Architecture

```mermaid
flowchart LR
    A[React Vite Frontend] -->|Axios JSON requests| B[Express REST API]
    B --> C[Controllers]
    C --> D[Zod validation and service logic]
    D --> E[PostgreSQL connection pool]
    E --> F[(PostgreSQL)]
```

The frontend owns navigation, presentation, search input, cart state, and user-facing loading/error notices. The backend exposes catalog and order endpoints, validates order input, loads authoritative product prices, calculates totals, and persists orders. PostgreSQL owns relational integrity, constraints, joins, aggregation, and transaction data.

There is no authentication layer, background queue, cache, payment provider, or separate microservice in this repository.

## Project Structure

```text
multi-vendor-ordering/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example
│   ├── bun.lock
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── db.ts
│       │   └── swagger.ts
│       ├── controllers/
│       │   ├── orderController.ts
│       │   ├── productController.ts
│       │   └── vendorController.ts
│       ├── middleware/
│       │   ├── errorHandler.ts
│       │   └── notFound.ts
│       ├── routes/
│       │   ├── orderRoutes.ts
│       │   ├── productRoutes.ts
│       │   └── vendorRoutes.ts
│       ├── schemas/orderSchema.ts
│       ├── services/
│       │   ├── orderService.ts
│       │   └── vendorService.ts
│       └── utils/errors.ts
├── database/
│   ├── schema.sql
│   └── seed.sql
└── frontend/
    ├── .env.example
    ├── bun.lock
    ├── public/
    ├── package.json
    ├── vercel.json
    ├── vite.config.ts
    ├── gg.png
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── components/
        │   ├── cart/CartSummary.tsx
        │   ├── catalog/ProductImage.tsx
        │   └── ui/
        │       ├── Dock.tsx
        │       ├── LoadingGrid.tsx
        │       └── SectionTitle.tsx
        ├── lib/api.ts
        ├── pages/
        │   ├── CartPage.tsx
        │   ├── OrderPage.tsx
        │   ├── ProductDetailsPage.tsx
        │   └── ProductsPage.tsx
        └── types/catalog.ts
```

## Getting Started

### Prerequisites

- Bun
- PostgreSQL 14 or newer recommended
- `psql` or another PostgreSQL client

### Database Setup

Create a PostgreSQL database named `multi_vendor_ordering`, then apply the schema and seed data:

```bash
createdb multi_vendor_ordering
psql postgresql://postgres:postgres@localhost:5432/multi_vendor_ordering \
  -f database/schema.sql
psql postgresql://postgres:postgres@localhost:5432/multi_vendor_ordering \
  -f database/seed.sql
```

The connection string must match the credentials and host used by your PostgreSQL installation.

### Backend Setup

```bash
cd backend
bun install
cp .env.example .env
bun run dev
```

The backend listens on `http://localhost:4000` by default. The available backend scripts are:

| Command | Purpose |
| --- | --- |
| `bun run dev` | Run the API with Bun watch mode |
| `bun run build` | Compile TypeScript to `dist/` |
| `bun run lint` | Run Oxlint against `src/` |
| `bun run start` | Run the compiled `dist/server.js` |

### Frontend Setup

In a second terminal:

```bash
cd frontend
bun install
printf 'VITE_API_URL=http://localhost:4000/api\n' > .env.local
bun run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

The frontend requires `VITE_API_URL` and has no hardcoded API fallback. It only sends requests to the URL configured in its own environment file.

Frontend scripts:

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Vite development server |
| `bun run build` | Typecheck and create a production Vite build |
| `bun run lint` | Run Oxlint |
| `bun run preview` | Preview the production build locally |

## Environment Variables

| Variable | Used by | Required | Description |
| --- | --- | --- | --- |
| `PORT` | Backend | No | HTTP port. Defaults to `4000` in `server.ts`. |
| `DATABASE_URL` | Backend | Yes | PostgreSQL connection string used by the `pg` pool. |
| `ALLOWED_ORIGINS` | Backend | No | Allowed frontend CORS origin(s), comma-separated when needed. Trailing slashes are normalized. Defaults to `http://localhost:5173`. `FRONTEND_URL` remains supported as a fallback for older deployments. |
| `VITE_API_URL` | Frontend | Yes | The only backend API base URL used by the frontend, for example `http://localhost:4000/api`. |

The repository includes separate environment examples: `backend/.env.example` for backend port, database, and CORS configuration, and `frontend/.env.example` for the frontend API URL. Copy each example to its respective local environment file. `.env` files are ignored by Git; only example files are allowed by the root ignore rules.

Never commit real database credentials or deployment secrets.

## Frontend Routes and Behavior

The app is wrapped in `BrowserRouter` in `frontend/src/main.tsx`. Route selection is handled in `App.tsx` and rendered through dedicated page components.

| Route | Behavior |
| --- | --- |
| `/` | Home storefront with categories and new arrivals |
| `/products` | Full product catalog and search page |
| `/products/:id` | Product details and local quantity selection |
| `/stores` | Vendor list or selected vendor products |
| `/cart` | Cart items, quantities, links, totals, and checkout |
| `/order` | Newly created order detail view |
| `/orders` | Order list and UUID lookup form |
| `/orders/:id` | Order details grouped by vendor |

The cart is held in React state in `App.tsx`. It is not persisted to localStorage or a server session. Adding an existing product increases its quantity. Decreasing a quantity to zero removes the item. Product detail quantity changes are local until the user presses the sticky add-to-cart action.

## Ordering Workflow

1. The storefront loads available products and vendors with `GET /api/products` and `GET /api/vendors`.
2. The user browses products, searches, or opens a vendor-specific catalog.
3. Products are added to a client-side cart. Duplicate products increase their existing quantity.
4. The frontend calculates a display total from `price * quantity`.
5. Before checkout, cart items are grouped by `vendor.id`.
6. The frontend sends only vendor IDs, product IDs, and quantities to `POST /api/orders`.
7. Zod validates the request shape, UUIDs, positive integer quantities, non-empty vendor groups, and non-empty vendor lists.
8. The backend verifies that every vendor exists.
9. The backend loads available product IDs and authoritative prices from PostgreSQL using a row-locking query.
10. The backend verifies that every product belongs to the vendor specified in the request.
11. The backend calculates the total in integer paise to reduce floating-point currency errors.
12. The backend inserts the order and each order item inside a PostgreSQL transaction.
13. The transaction commits on success and rolls back on any failure.
14. The backend reloads the created order and returns it to the frontend.
15. The frontend clears the cart, navigates to `/order`, and displays the order result or a user-facing error notice.

### Checkout Request Example

```json
{
  "vendors": [
    {
      "vendorId": "11111111-1111-1111-1111-111111111111",
      "items": [
        {
          "productId": "22222222-2222-2222-2222-222222222222",
          "quantity": 2
        }
      ]
    }
  ]
}
```

The client does not send prices. The server is authoritative for prices and totals.

## API Reference

All API routes are prefixed with `/api`. Successful responses generally use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "message": "..." }`.

### `GET /api/health`

Checks API availability.

```json
{
  "success": true,
  "message": "API is healthy"
}
```

### `GET /api/vendors`

Returns vendors ordered by name.

```json
{
  "success": true,
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Fresh Basket",
      "description": "Local produce and pantry essentials",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

The endpoint returns `500` for unexpected database failures and `503` when the database cannot be reached.

### `GET /api/vendors/:vendorId/products`

Returns one vendor and its products. `vendorId` is the vendor UUID. The service uses a parameterized query, a `LEFT JOIN`, and PostgreSQL `json_agg` to return the vendor and its products in one response. This route does not perform UUID-format validation in the controller; a missing vendor returns `404`.

```json
{
  "success": true,
  "data": {
    "vendor": {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Fresh Basket"
    },
    "products": [
      {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Seasonal Fruit Box",
        "price": "18.50"
      }
    ]
  }
}
```

The vendor-specific query returns products joined to the vendor, including products without an availability filter. The general product catalog endpoints filter to `is_available = true`.

### `GET /api/products`

Returns available products ordered by product name. Each product includes a nested vendor object. The controller uses a static SQL query with an inner join and filters `p.is_available = true`.

```json
{
  "success": true,
  "data": [
    {
      "id": "22222222-2222-2222-2222-222222222222",
      "name": "House Coffee Beans",
      "description": "Freshly roasted whole beans.",
      "price": "14.00",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "vendor": {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Daily Grind"
      }
    }
  ]
}
```

### `GET /api/products/search?q=<text>`

Searches available products by product name, description, or vendor name. The optional `q` query parameter is trimmed. An empty query returns all available products. PostgreSQL performs the `ILIKE` filtering and ordering.

Example:

```bash
curl 'http://localhost:4000/api/products/search?q=coffee'
```

The response uses the same product shape as `GET /api/products`. Unexpected database failures return `500`; database connectivity failures are converted to `503` by the error middleware.

### `GET /api/products/:id`

Returns one available product by UUID, including its vendor. Invalid UUIDs return `400` with `Product id must be a UUID`. A missing or unavailable product returns `404` with `Product not found`.

```bash
curl http://localhost:4000/api/products/22222222-2222-2222-2222-222222222222
```

### `POST /api/orders`

Creates an order from grouped vendor cart items.

#### Validation

- The body must contain only `vendors`.
- `vendors` must contain at least one vendor group.
- Every vendor group must contain only `vendorId` and `items`.
- `vendorId` and each `productId` must be UUID strings.
- Each `items` array must contain at least one item.
- Each item must contain only `productId` and `quantity`.
- `quantity` must be a positive integer.

#### Success

Returns `201` with the created order and its line items.

```bash
curl -X POST http://localhost:4000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "vendors": [
      {
        "vendorId": "11111111-1111-1111-1111-111111111111",
        "items": [
          {
            "productId": "22222222-2222-2222-2222-222222222222",
            "quantity": 2
          }
        ]
      }
    ]
  }'
```

The service returns `400` for malformed input, missing vendors, missing/unavailable products, or a product/vendor mismatch. It returns `503` for database connectivity failures and `500` for other unhandled failures.

### `GET /api/orders`

Returns order summaries ordered by newest first. PostgreSQL uses `LEFT JOIN`, `COUNT`, `GROUP BY`, and `ORDER BY` to produce the list.

```json
{
  "success": true,
  "data": [
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "total": "37.00",
      "status": "pending",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "itemCount": 3
    }
  ]
}
```

### `GET /api/orders/:id`

Returns one order by UUID. Invalid UUIDs return `400` with `Order id must be a UUID`; an unknown order returns `404` with `Order not found`.

The query uses `LEFT JOIN` and `json_agg` to return order lines. Each line includes the current product and vendor names joined from their tables, the product and vendor IDs, quantity, and stored unit price.

```json
{
  "success": true,
  "data": {
    "id": "33333333-3333-3333-3333-333333333333",
    "total": "37.00",
    "status": "pending",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "items": [
      {
        "productId": "22222222-2222-2222-2222-222222222222",
        "vendorId": "11111111-1111-1111-1111-111111111111",
        "productName": "House Coffee Beans",
        "vendorName": "Daily Grind",
        "quantity": 2,
        "unitPrice": "14.00"
      }
    ]
  }
}
```

### Documentation endpoints

- `GET /api-docs` serves Swagger UI.
- `GET /api-docs.json` returns the generated OpenAPI document.

### Unknown routes

Unknown routes are handled by `notFound` and return `404`:

```json
{
  "success": false,
  "message": "Route not found"
}
```

## Database Schema

The schema is defined in `database/schema.sql`. It enables `pgcrypto` so UUID defaults can use `gen_random_uuid()`.

```mermaid
erDiagram
    VENDORS ||--o{ PRODUCTS : owns
    VENDORS ||--o{ ORDER_ITEMS : supplies
    ORDERS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : referenced_by

    VENDORS {
        uuid id PK
        varchar name
        text description
        timestamptz created_at
    }
    PRODUCTS {
        uuid id PK
        uuid vendor_id FK
        varchar name
        text description
        numeric price
        boolean is_available
        timestamptz created_at
    }
    ORDERS {
        uuid id PK
        numeric total
        varchar status
        timestamptz created_at
    }
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        uuid vendor_id FK
        integer quantity
        numeric unit_price
    }
```

### `vendors`

Stores the vendor catalog entries.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `UUID` | Primary key, defaults to `gen_random_uuid()` |
| `name` | `VARCHAR(120)` | Required |
| `description` | `TEXT` | Nullable |
| `created_at` | `TIMESTAMPTZ` | Required, defaults to `NOW()` |

### `products`

Stores products belonging to vendors.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `UUID` | Primary key, defaults to `gen_random_uuid()` |
| `vendor_id` | `UUID` | Required foreign key to `vendors.id`, cascade delete from vendor |
| `name` | `VARCHAR(160)` | Required |
| `description` | `TEXT` | Nullable |
| `price` | `NUMERIC(10, 2)` | Required, `price >= 0` |
| `is_available` | `BOOLEAN` | Required, defaults to `TRUE` |
| `created_at` | `TIMESTAMPTZ` | Required, defaults to `NOW()` |

Index: `products_vendor_id_idx` on `products(vendor_id)`.

### `orders`

Stores the calculated order total and current order status.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `UUID` | Primary key, defaults to `gen_random_uuid()` |
| `total` | `NUMERIC(10, 2)` | Required, `total >= 0` |
| `status` | `VARCHAR(30)` | Required, defaults to `pending` |
| `created_at` | `TIMESTAMPTZ` | Required, defaults to `NOW()` |

### `order_items`

Stores the products, vendors, quantities, and unit prices used by an order.

| Column | Type | Rules |
| --- | --- | --- |
| `id` | `UUID` | Primary key, defaults to `gen_random_uuid()` |
| `order_id` | `UUID` | Required foreign key to `orders.id`, cascade delete from order |
| `product_id` | `UUID` | Required foreign key to `products.id` |
| `vendor_id` | `UUID` | Required foreign key to `vendors.id` |
| `quantity` | `INTEGER` | Required, `quantity > 0` |
| `unit_price` | `NUMERIC(10, 2)` | Required, `unit_price >= 0` |

Index: `order_items_order_id_idx` on `order_items(order_id)`.

`unit_price` is stored with the order item and is used when displaying historical order totals. Product and vendor names are joined at read time for order detail responses; names are not duplicated into `order_items`.

### Seed data

`database/seed.sql` inserts these vendors when they do not already exist:

- Fresh Basket: local produce and pantry essentials.
- Daily Grind: small-batch coffee and baked goods.

It then inserts these products when the same vendor/product pair does not already exist:

| Vendor | Product | Price |
| --- | --- | ---: |
| Fresh Basket | Seasonal Fruit Box | 18.50 |
| Fresh Basket | Sourdough Loaf | 6.00 |
| Daily Grind | House Coffee Beans | 14.00 |
| Daily Grind | Cinnamon Roll | 4.50 |

## Validation and Error Handling

### Backend

- Zod validates `POST /api/orders` before service logic runs.
- `z.string().uuid()` validates product and order IDs in their detail controllers.
- PostgreSQL foreign keys and `CHECK` constraints enforce relational and numeric rules.
- `AppError` carries an explicit status code and message.
- The `notFound` middleware returns a consistent `404` response for unknown routes.
- The central error middleware maps `AppError` to its status, maps `ECONNREFUSED` and `ENOTFOUND` to `503`, and maps all other errors to `500`.
- Database errors are logged server-side with `console.error`; responses expose generic messages for unexpected failures.

### Frontend

- Axios requests use the configured API base URL.
- Storefront load failures clear products and vendors and leave the loading state.
- Product and order detail failures display a notice such as `Product not found.` or `Order not found.`.
- Checkout validates that the cart is non-empty and contains UUID-backed products before sending.
- Invalid order lookup text is rejected in the browser with `Enter a valid order UUID.`.
- Loading skeletons are used for product grids, and checkout/order lookup buttons show loading labels.
- Cart state is in memory only; there is no retry mechanism or persistence layer.

## PostgreSQL Query and Transaction Design

The backend uses parameterized `pg` queries rather than string-interpolating user data. PostgreSQL performs filtering, joins, grouping, counting, ordering, and JSON aggregation at the database layer.

The checkout transaction is:

```text
BEGIN
  Validate vendor IDs
  Load available products with FOR UPDATE
  Verify product/vendor relationships
  Calculate authoritative total
  INSERT orders
  INSERT order_items
COMMIT

Any failure -> ROLLBACK
```

The product search query performs `ILIKE` filtering in PostgreSQL. The order list query uses `COUNT(oi.id)` and `GROUP BY`. The order detail query uses `json_agg` and joins products and vendors before returning the line-item JSON.

## Security and Production Hygiene

Implemented:

- Environment variables for database URL, port, CORS origin, and frontend API URL.
- `.env` files ignored by Git.
- Helmet middleware for common HTTP security headers.
- CORS allowlist based on normalized, comma-separated `ALLOWED_ORIGINS` values, plus local development exceptions for the API host.
- Parameterized PostgreSQL queries.
- Strict Zod validation for order creation.
- Generic `500` responses rather than returning raw unexpected error details to clients.

### Production considerations

- There is no authentication or authorization, so orders are not associated with users and the order list is not access-controlled.
- There is no rate limiting, payment processing, inventory reservation, or audit logging.
- Product image rendering currently uses a placeholder image URL for catalog products.
- No Docker, CI, hosting-provider, or database migration deployment configuration is committed.
- The frontend/backend default port mismatch should be resolved in deployment configuration by setting `VITE_API_URL` explicitly.

For the current deployment, set these provider environment variables:

- Render backend: `ALLOWED_ORIGINS=https://multi-vendor-ordering.vercel.app`
- Vercel frontend: `VITE_API_URL=https://multi-vendor-ordering.onrender.com/api`

The backend normalizes the configured frontend origin, so either a trailing slash or no trailing slash is accepted. After changing Render environment variables, redeploy or restart the service so the new CORS allowlist is loaded.


## Design Decisions Supported by the Code

- The frontend keeps cart state locally because the current product browsing and checkout flow does not include user accounts or server-side carts.
- The backend recalculates totals from PostgreSQL prices rather than trusting client-supplied prices.
- Vendor groups are represented in the checkout payload so a single order can contain products from multiple vendors.
- A service layer contains order transaction and query logic, keeping controllers focused on HTTP parsing and responses.
- PostgreSQL performs aggregation and joins for vendor product responses, order summaries, and order details.
- `unit_price` is persisted on `order_items` so the charged line price is retained even if the product price later changes.

## Verification

The following repository checks have been completed:

- [x] Backend lint: `cd backend && bun run lint`
- [x] Backend build: `cd backend && bun run build`
- [x] Frontend lint: `cd frontend && bun run lint`
- [x] Frontend production build: `cd frontend && bun run build`
- [x] Patch whitespace check: `git diff --check`

Runtime acceptance requires a running PostgreSQL database, backend, and frontend. The documented flows cover health checks, catalog loading, search, cart grouping, checkout, invalid-order rejection, order listing/detail views, navigation links, and responsive behavior.



