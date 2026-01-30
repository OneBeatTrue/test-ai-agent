/**
 * Error Logger Utility
 * 
 * Provides comprehensive error logging capabilities with severity classification,
 * structured logging, and multiple output transports.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define error severity levels
const errorLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Define log levels for Winston
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

winston.addColors(colors);

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bug-fixer-service' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Log an error with severity classification
 * @param {Error|string} error - Error object or error message
 * @param {string} severity - Error severity (ERROR, WARN, INFO, DEBUG)
 * @param {Object} meta - Additional metadata to include in the log
 */
const logError = (error, severity = 'error', meta = {}) => {
  if (!Object.keys(logLevels).includes(severity.toLowerCase())) {
    throw new Error(`Invalid severity level: ${severity}`);
  }

  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorType = error instanceof Error ? error.constructor.name : 'Error';

  const logData = {
    severity,
    type: errorType,
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    ...meta
  };

  logger.log(severity, errorMessage, {
    ...logData,
    originalError: error
  });
};

/**
 * Log a warning
 * @param {Error|string} warning - Warning object or message
 * @param {Object} meta - Additional metadata
 */
const logWarning = (warning, meta = {}) => {
  logError(warning, 'warn', meta);
};

/**
 * Log information
 * @param {string} message - Information message
 * @param {Object} meta - Additional metadata
 */
const logInfo = (message, meta = {}) => {
  logError(message, 'info', meta);
};

/**
 * Log debug information
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
const logDebug = (message, meta = {}) => {
  logError(message, 'debug', meta);
};

/**
 * Create an error wrapper to capture context
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context description
 * @returns {Function} Wrapped function with error logging
 */
const withErrorLogging = (fn, context = '') => {
  return (...args) => {
    try {
      return fn(...args);
    } catch (error) {
      logError(error, 'error', { context, args });
      throw error; // Re-throw the error after logging
    }
  };
};

/**
 * Format error for consistent reporting
 * @param {Error} error - Error to format
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error object
 */
const formatErrorForReport = (error, context = {}) => {
  if (!(error instanceof Error)) {
    return {
      message: String(error),
      type: 'Error',
      severity: 'ERROR',
      timestamp: new Date().toISOString(),
      context
    };
  }

  return {
    message: error.message,
    type: error.constructor.name,
    stack: error.stack,
    severity: 'ERROR',
    timestamp: new Date().toISOString(),
    context
  };
};

module.exports = {
  logger,
  errorLevels,
  logError,
  logWarning,
  logInfo,
  logDebug,
  withErrorLogging,
  formatErrorForReport
};