import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`===============================================`);
  logger.info(`Host Pilot Backend API Server Started`);
  logger.info(`Environment:  ${env.NODE_ENV}`);
  logger.info(`Port:         ${env.PORT}`);
  logger.info(`API Base URL: http://localhost:${env.PORT}/api/v1`);
  logger.info(`Health Check: http://localhost:${env.PORT}/api/v1/health`);
  logger.info(`CORS Origin:  ${env.CLIENT_URL}`);
  logger.info(`Timezone:     ${env.APP_TIMEZONE}`);
  logger.info(`===============================================`);
});

// Graceful Shutdown Handlers
function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force exit if hanging
  setTimeout(() => {
    logger.error('Forced process termination after timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection detected:', { reason });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception detected:', { error: error.message, stack: error.stack });
  shutdown('UNCAUGHT_EXCEPTION');
});
