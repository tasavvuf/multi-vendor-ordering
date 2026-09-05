import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Multi-Vendor Ordering API',
      version: '1.0.0',
      description: 'API for browsing vendors and products and creating multi-vendor cart orders.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT ?? 5000}`,
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'API availability' },
      { name: 'Vendors', description: 'Vendor catalog operations' },
      { name: 'Products', description: 'Product catalog operations' },
      { name: 'Orders', description: 'Multi-vendor cart order operations' },
    ],
    components: {
      schemas: {
        Vendor: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          required: ['id', 'name', 'price', 'vendor'],
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'string', example: '14.00' },
            createdAt: { type: 'string', format: 'date-time' },
            vendor: {
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
              },
            },
          },
        },
        CartItem: {
          type: 'object',
          required: ['productId', 'quantity'],
          additionalProperties: false,
          properties: {
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1, example: 2 },
          },
        },
        VendorCart: {
          type: 'object',
          required: ['vendorId', 'items'],
          additionalProperties: false,
          properties: {
            vendorId: { type: 'string', format: 'uuid' },
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/CartItem' },
            },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['vendors'],
          additionalProperties: false,
          properties: {
            vendors: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/VendorCart' },
            },
          },
          example: {
            vendors: [
              {
                vendorId: '11111111-1111-1111-1111-111111111111',
                items: [
                  {
                    productId: '22222222-2222-2222-2222-222222222222',
                    quantity: 2,
                  },
                ],
              },
            ],
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            total: { type: 'string', example: '28.00' },
            status: { type: 'string', example: 'pending' },
            createdAt: { type: 'string', format: 'date-time' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  vendorId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer' },
                  unitPrice: { type: 'string', example: '14.00' },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Check API health',
          responses: {
            200: {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: { type: 'object' },
                  example: { success: true, message: 'API is healthy' },
                },
              },
            },
          },
        },
      },
      '/api/vendors': {
        get: {
          tags: ['Vendors'],
          summary: 'List all vendors',
          responses: {
            200: {
              description: 'Vendors returned successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Vendor' } },
                    },
                  },
                },
              },
            },
            500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'List available products with vendor information',
          responses: {
            200: {
              description: 'Products returned successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    },
                  },
                },
              },
            },
            500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Create an order from grouped vendor cart items',
          description: 'Send only vendor IDs, product IDs, and quantities. Prices are loaded from PostgreSQL.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } },
          },
          responses: {
            201: {
              description: 'Order created successfully',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Order' } } } } },
            },
            400: { description: 'Invalid cart or product/vendor relationship', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/api/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get an order by UUID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: {
              description: 'Order returned successfully',
              content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Order' } } } } },
            },
            400: { description: 'Invalid order UUID', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
