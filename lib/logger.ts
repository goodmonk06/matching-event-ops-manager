/**
 * Structured logging utility
 * Provides consistent logging interface with log levels and context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private context: LogContext = {};

  constructor(private defaultContext: LogContext = {}) {
    this.context = defaultContext;
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  /**
   * Format log message with context
   */
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const mergedContext = { ...this.context, ...context };
    const contextStr = Object.keys(mergedContext).length > 0
      ? ` ${JSON.stringify(mergedContext)}`
      : '';

    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(this.format('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.log(this.format('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.format('error', message, context));
  }

  /**
   * Log an error object with stack trace
   */
  logError(message: string, error: Error, context?: LogContext) {
    this.error(message, {
      ...context,
      error: error.message,
      stack: error.stack,
    });
  }
}

// Export singleton instance
export const logger = new Logger({
  service: 'matching-event-ops-manager',
  environment: process.env.NODE_ENV || 'development',
});

// Export class for testing
export { Logger };
