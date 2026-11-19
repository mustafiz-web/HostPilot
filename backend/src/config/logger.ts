import { env } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const metaString = meta && Object.keys(meta).length ? ` ${JSON.stringify(sanitizeMeta(meta))}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
}

// Ensure sensitive fields (passwords, tokens, secrets) are never leaked in logs
function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'jwt'];

  for (const [key, value] of Object.entries(meta)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeMeta(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (LOG_PRIORITIES[env.LOG_LEVEL] <= LOG_PRIORITIES.debug && env.NODE_ENV !== 'test') {
      console.debug(formatLog('debug', message, meta));
    }
  },
  info(message: string, meta?: Record<string, unknown>) {
    if (LOG_PRIORITIES[env.LOG_LEVEL] <= LOG_PRIORITIES.info && env.NODE_ENV !== 'test') {
      console.log(formatLog('info', message, meta));
    }
  },
  warn(message: string, meta?: Record<string, unknown>) {
    if (LOG_PRIORITIES[env.LOG_LEVEL] <= LOG_PRIORITIES.warn) {
      console.warn(formatLog('warn', message, meta));
    }
  },
  error(message: string, meta?: Record<string, unknown>) {
    if (LOG_PRIORITIES[env.LOG_LEVEL] <= LOG_PRIORITIES.error) {
      console.error(formatLog('error', message, meta));
    }
  },
};
