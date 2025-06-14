import { format } from 'util';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
  stack?: string;
  context?: Record<string, any>;
}

class Logger {
  private static formatLog(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : '';
    const details = entry.details ? `\nDetails: ${JSON.stringify(entry.details, null, 2)}` : '';
    const stack = entry.stack ? `\nStack: ${entry.stack}` : '';
    
    return `[${timestamp}] ${level} ${entry.message}${context}${details}${stack}`;
  }

  private static log(level: LogLevel, message: string, details?: any, error?: Error, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      stack: error?.stack,
      context
    };

    const formattedLog = this.formatLog(entry);
    
    // Log to console with appropriate color
    switch (level) {
      case 'error':
        console.error('\x1b[31m%s\x1b[0m', formattedLog); // Red
        break;
      case 'warn':
        console.warn('\x1b[33m%s\x1b[0m', formattedLog); // Yellow
        break;
      case 'info':
        console.info('\x1b[36m%s\x1b[0m', formattedLog); // Cyan
        break;
      case 'debug':
        console.debug('\x1b[35m%s\x1b[0m', formattedLog); // Magenta
        break;
    }

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement production logging service integration
    }
  }

  static info(message: string, context?: Record<string, any>) {
    this.log('info', message, undefined, undefined, context);
  }

  static warn(message: string, details?: any, context?: Record<string, any>) {
    this.log('warn', message, details, undefined, context);
  }

  static error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, undefined, error, context);
  }

  static debug(message: string, details?: any, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, details, undefined, context);
    }
  }
}

export default Logger; 