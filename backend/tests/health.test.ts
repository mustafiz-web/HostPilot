import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Health Check API (/api/v1/health)', () => {
  it('should return 200 OK and healthy status structure', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('healthy');
    expect(typeof res.body.data.uptimeSeconds).toBe('number');
    expect(typeof res.body.data.timestamp).toBe('string');
    expect(res.body.data.environment).toBeDefined();

    // Verify Request-ID header is attached
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  it('should return API metadata on root route (/)', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Host Pilot API');
    expect(res.body.endpoints.health).toBe('/api/v1/health');
  });
});
