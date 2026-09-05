import { z } from 'zod';

export const createOrderSchema = z.object({
  vendors: z.array(
    z.object({
      vendorId: z.string().uuid(),
      items: z.array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive(),
        }).strict(),
      ).min(1),
    }).strict(),
  ).min(1),
}).strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
