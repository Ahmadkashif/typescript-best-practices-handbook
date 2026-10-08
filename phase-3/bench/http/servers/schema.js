import { z } from 'zod';
// Realistic "create order" payload shared by every framework.
export const Order = z.object({
  customerId: z.uuid(),
  email: z.email(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  note: z.string().max(500).optional(),
  items: z.array(z.object({
    sku: z.string().min(1).max(64),
    qty: z.number().int().positive().max(1000),
    unitPrice: z.number().nonnegative(),
  })).min(1).max(50),
  shipping: z.object({
    line1: z.string().min(1), city: z.string().min(1), country: z.string().length(2), zip: z.string().min(3).max(10),
  }),
});
export const jsonSchema = z.toJSONSchema(Order, { target: 'draft-07' });
export const PORT = Number(process.env.PORT ?? 3000);
export const summarize = (o) => ({ ok: true, items: o.items.length, total: o.items.reduce((s, i) => s + i.qty * i.unitPrice, 0) });
