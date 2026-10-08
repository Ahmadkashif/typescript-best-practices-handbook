import { timingSafeEqual, createHmac } from 'node:crypto';
export function verifySignature(body: string, sig: string, secret: string): boolean {
  const expected = Buffer.from(createHmac('sha256', secret).update(body).digest('hex'));
  const given = Buffer.from(sig);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
export {};
