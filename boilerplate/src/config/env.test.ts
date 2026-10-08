import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './env.ts';

describe('loadConfig', () => {
  it('applies safe production defaults', () => {
    expect(loadConfig({})).toEqual({
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 3000,
      LOG_LEVEL: 'info',
      LOG_FORMAT: 'json',
      SHUTDOWN_GRACE_MS: 10_000,
    });
  });

  it('coerces and freezes', () => {
    const config = loadConfig({ PORT: '8080', NODE_ENV: 'test' });
    expect(config.PORT).toBe(8080);
    expect(Object.isFrozen(config)).toBe(true);
  });

  it('fails fast with every invalid field named', () => {
    expect(() => loadConfig({ PORT: 'eighty', LOG_LEVEL: 'loud' })).toThrow(ConfigError);
    expect(() => loadConfig({ PORT: '70000' })).toThrow(/PORT/);
  });
});
