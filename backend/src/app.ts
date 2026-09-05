import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import vendorRoutes from './routes/vendorRoutes';

dotenv.config();

const app = express();
const allowedOrigins = new Set([
  process.env.FRONTEND_URL ?? 'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
]);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS origin is not allowed'));
  },
}));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_request, response) => {
  response.json(swaggerSpec);
});

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'API is healthy' });
});
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
