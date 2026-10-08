import { pino } from 'pino';
export const logger = pino({
  level: 'info',
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'], censor: '[redacted]' },
});
logger.info({ orderId: 'o_1' }, 'order created');
export {};
