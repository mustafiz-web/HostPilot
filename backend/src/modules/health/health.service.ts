import { env } from '../../config/env';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
  timezone: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
}

export class HealthService {
  public getHealthStatus(): HealthCheckResult {
    const memory = process.memoryUsage();
    return {
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      timezone: env.APP_TIMEZONE,
      memoryUsageMb: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      },
    };
  }
}

export const healthService = new HealthService();
