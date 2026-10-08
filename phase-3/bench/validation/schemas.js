import { z } from 'zod';
import * as v from 'valibot';
import Type from 'typebox';
// The same "create order" schema (string formats: uuid, email; enum; nested array of objects) in each library.
export const zodSchema = () => z.object({
  customerId: z.uuid(), email: z.email(), currency: z.enum(['USD', 'EUR', 'GBP']), note: z.string().max(500).optional(),
  items: z.array(z.object({ sku: z.string().min(1).max(64), qty: z.number().int().positive().max(1000), unitPrice: z.number().nonnegative() })).min(1).max(50),
  shipping: z.object({ line1: z.string().min(1), city: z.string().min(1), country: z.string().length(2), zip: z.string().min(3).max(10) }),
});
export const valibotSchema = () => v.object({
  customerId: v.pipe(v.string(), v.uuid()), email: v.pipe(v.string(), v.email()), currency: v.picklist(['USD', 'EUR', 'GBP']), note: v.optional(v.pipe(v.string(), v.maxLength(500))),
  items: v.pipe(v.array(v.object({ sku: v.pipe(v.string(), v.minLength(1), v.maxLength(64)), qty: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(1000)), unitPrice: v.pipe(v.number(), v.minValue(0)) })), v.minLength(1), v.maxLength(50)),
  shipping: v.object({ line1: v.pipe(v.string(), v.minLength(1)), city: v.pipe(v.string(), v.minLength(1)), country: v.pipe(v.string(), v.length(2)), zip: v.pipe(v.string(), v.minLength(3), v.maxLength(10)) }),
});
export const typeboxSchema = () => Type.Object({
  customerId: Type.String({ format: 'uuid' }), email: Type.String({ format: 'email' }), currency: Type.Union([Type.Literal('USD'), Type.Literal('EUR'), Type.Literal('GBP')]), note: Type.Optional(Type.String({ maxLength: 500 })),
  items: Type.Array(Type.Object({ sku: Type.String({ minLength: 1, maxLength: 64 }), qty: Type.Integer({ exclusiveMinimum: 0, maximum: 1000 }), unitPrice: Type.Number({ minimum: 0 }) }), { minItems: 1, maxItems: 50 }),
  shipping: Type.Object({ line1: Type.String({ minLength: 1 }), city: Type.String({ minLength: 1 }), country: Type.String({ minLength: 2, maxLength: 2 }), zip: Type.String({ minLength: 3, maxLength: 10 }) }),
});
export const valid = {"customerId":"3f1c2b8e-9d4a-4e6b-8c1f-2a7d5e9b0c13","email":"jane.doe@example.com","currency":"EUR","note":"Leave at the front desk, please.","items":[{"sku":"BOOK-0001","qty":2,"unitPrice":19.99},{"sku":"PEN-RED-12","qty":10,"unitPrice":1.25},{"sku":"MUG-LOGO","qty":1,"unitPrice":12.5},{"sku":"NOTE-A5","qty":3,"unitPrice":4.75}],"shipping":{"line1":"12 Example Street","city":"Berlin","country":"DE","zip":"10115"}};
// Invalid in 3 places (bad email, qty 0, country too long) to exercise the error path.
export const invalid = structuredClone(valid); invalid.email = 'nope'; invalid.items[1].qty = 0; invalid.shipping.country = 'DEU';
