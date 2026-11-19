import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Centralized Error Handling & Not Found Middleware', () => {
  it('should return 404 NOT_FOUND envelope for non-existent routes', async () => {
    const res = await request(app).get('/api/v1/non-existent-route-404');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('Cannot find endpoint GET /api/v1/non-existent-route-404');
  });

  it('should return 400 INVALID_JSON for malformed JSON request bodies', async () => {
    const res = await request(app)
      .post('/api/v1/health') // any route with body
      .set('Content-Type', 'application/json')
      .send('{"invalidJson": unquotedValue}');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_JSON');
    expect(res.body.error.message).toBe('The request body contains invalid JSON');
  });
});
