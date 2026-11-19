import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { z } from 'zod';
import { validate } from '../src/middlewares/validate.middleware';
import { errorHandlerMiddleware } from '../src/middlewares/error-handler.middleware';

describe('Zod Request Validation Middleware', () => {
  const testApp = express();
  testApp.use(express.json());

  const sampleSchema = {
    body: z.object({
      applicantName: z.string().min(3, 'Applicant name must be at least 3 characters'),
      email: z.string().email('Invalid email address format'),
      age: z.number().int().min(16, 'Applicant must be at least 16 years old'),
    }),
  };

  testApp.post(
    '/test-validation',
    validate(sampleSchema),
    (req, res) => {
      res.status(200).json({ success: true, data: req.body });
    }
  );

  testApp.use(errorHandlerMiddleware);

  it('should accept valid payload and proceed to route handler', async () => {
    const validData = {
      applicantName: 'Tanvir Ahmed',
      email: 'tanvir@campus.edu.bd',
      age: 21,
    };

    const res = await request(testApp).post('/test-validation').send(validData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.applicantName).toBe('Tanvir Ahmed');
  });

  it('should return 400 VALIDATION_ERROR with field details on invalid data', async () => {
    const invalidData = {
      applicantName: 'T',
      email: 'not-an-email',
      age: 12,
    };

    const res = await request(testApp).post('/test-validation').send(invalidData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeDefined();
    expect(res.body.error.details.length).toBe(3);

    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toContain('applicantName');
    expect(fields).toContain('email');
    expect(fields).toContain('age');
  });
});
