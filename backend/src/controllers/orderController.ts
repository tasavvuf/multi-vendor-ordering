import { RequestHandler } from 'express';
import { createOrderSchema } from '../schemas/orderSchema';
import { createOrder, getOrderById } from '../services/orderService';
import { AppError } from '../utils/errors';
import { z } from 'zod';

export const create: RequestHandler = async (request, response, next) => {
  try {
    const parsed = createOrderSchema.safeParse(request.body);
    if (!parsed.success) {
      throw new AppError(400, parsed.error.issues.map((issue) => issue.message).join(', '));
    }

    const order = await createOrder(parsed.data);
    response.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getById: RequestHandler = async (request, response, next) => {
  try {
    const orderId = z.string().uuid().safeParse(request.params.id);
    if (!orderId.success) {
      throw new AppError(400, 'Order id must be a UUID');
    }

    const order = await getOrderById(orderId.data);
    response.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
