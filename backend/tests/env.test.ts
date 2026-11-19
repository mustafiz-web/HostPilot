import { describe, it, expect } from 'vitest';
import { validateEnv } from '../src/config/env';

describe('Environment Configuration Validation (Zod)', () => {
  it('should validate and parse valid environment configuration', () => {
    const validConfig = {
      PORT: '8080',
      NODE_ENV: 'production',
      CLIENT_URL: 'https://hostpilot.campus.edu',
      APP_TIMEZONE: 'Asia/Dhaka',
    };

    const parsed = validateEnv(validConfig);
    expect(parsed.PORT).toBe(8080);
    expect(parsed.NODE_ENV).toBe('production');
    expect(parsed.CLIENT_URL).toBe('https://hostpilot.campus.edu');
    expect(parsed.APP_TIMEZONE).toBe('Asia/Dhaka');
  });

  it('should throw an error when PORT is not a valid positive number', () => {
    const invalidConfig = {
      PORT: '-500',
      NODE_ENV: 'development',
      CLIENT_URL: 'http://localhost:5173',
    };

    expect(() => validateEnv(invalidConfig)).toThrow(/Environment validation failed.*PORT/);
  });

  it('should throw an error when NODE_ENV is an unapproved value', () => {
    const invalidConfig = {
      PORT: '5000',
      NODE_ENV: 'staging_unsupported',
      CLIENT_URL: 'http://localhost:5173',
    };

    expect(() => validateEnv(invalidConfig)).toThrow(/Environment validation failed.*NODE_ENV/);
  });

  it('should apply safe defaults when optional variables are omitted', () => {
    const minimalConfig = {
      CLIENT_URL: 'http://localhost:3000',
    };

    const parsed = validateEnv(minimalConfig);
    expect(parsed.PORT).toBe(5000);
    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.APP_TIMEZONE).toBe('Asia/Dhaka');
  });
});
