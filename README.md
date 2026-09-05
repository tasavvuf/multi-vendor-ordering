# Multi-Vendor Ordering

TypeScript multi-vendor ordering project.

## Structure

- `frontend/` - existing frontend application
- `backend/` - Bun, Express, TypeScript, and PostgreSQL API
- `database/` - PostgreSQL schema and seed data

## Setup

1. Create a PostgreSQL database named `multi_vendor_ordering`.
2. Run `database/schema.sql`, then `database/seed.sql`.
3. Copy `backend/.env.example` to `backend/.env` and update the connection string.
4. Install and start the API:

```bash
cd backend
bun install
bun run dev
```

The API runs at `http://localhost:4000` by default.

## API

- `GET /api/health`
- `GET /api/vendors`
- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders/:id`
- `GET /api-docs` - Swagger UI
- `GET /api-docs.json` - OpenAPI JSON document

Example order body:

```json
{
	"vendors": [
		{
			"vendorId": "vendor-uuid",
			"items": [
				{ "productId": "product-uuid", "quantity": 2 }
			]
		}
	]
}
```

The client sends only vendor/product identifiers and quantities. The backend
loads product prices from PostgreSQL and calculates the order total.
