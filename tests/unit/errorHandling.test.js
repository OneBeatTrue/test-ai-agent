/**
 * @fileoverview Unit tests for error handling functionality
 * @module tests/unit/errorHandling.test
 */

const winston = require('winston');
const { ErrorSeverity, ErrorCategory } = require('../../src/utils/errorTypes');
const ErrorHandler = require('../../src/services/errorHandler');
const BugReporter = require('../../src/services/bugReporter');

describe('Error Handling', () => {
  let errorHandler;
  let bugReporter;
  let mockLogger;

  beforeEach(() => {
    // Create a mock logger for testing
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };

    // Initialize error handler and bug reporter with mock logger
    errorHandler = new ErrorHandler(mockLogger);
    bugReporter = new BugReporter(mockLogger);
  });

  describe('Error Severity Classification', () => {
    test('should correctly classify critical errors', () => {
      const criticalError = new Error('Critical system failure');
      criticalError.severity = 'critical';
      
      const classified = errorHandler.classifyError(criticalError);
      
      expect(classified.severity).toBe(ErrorSeverity.CRITICAL);
      expect(classified.category).toBe(ErrorCategory.SYSTEM);
    });

    test('should correctly classify warning errors', () => {
      const warningError = new Error('Potential issue detected');
      warningError.severity = 'warning';
      
      const classified = errorHandler.classifyError(warningError);
      
      expect(classified.severity).toBe(ErrorSeverity.WARNING);
      expect(classified.category).toBe(ErrorCategory.BUSINESS);
    });

    test('should default to unknown severity if not specified', () => {
      const unknownError = new Error('Unknown error type');
      
      const classified = errorHandler.classifyError(unknownError);
      
      expect(classified.severity).toBe(ErrorSeverity.UNKNOWN);
      expect(classified.category).toBe(ErrorCategory.UNKNOWN);
    });
  });

  describe('Error Logging', () => {
    test('should log errors with appropriate severity level', () => {
      const error = new Error('Test error');
      error.severity = ErrorSeverity.ERROR;
      
      errorHandler.handleError(error);
      
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error'),
        expect.objectContaining({
          severity: ErrorSeverity.ERROR,
          timestamp: expect.any(String),
        })
      );
    });

    test('should include additional context in error logs', () => {
      const error = new Error('Contextual error');
      const context = { userId: '123', action: 'dataProcessing' };
      
      errorHandler.handleError(error, context);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Contextual error'),
        expect.objectContaining({
          context: expect.objectContaining(context),
        })
      );
    });

    test('should handle errors without stack traces gracefully', () => {
      const error = { message: 'Non-error object' };
      
      errorHandler.handleError(error);
      
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Non-error object'),
        expect.objectContaining({
          severity: ErrorSeverity.ERROR,
        })
      );
    });
  });

  describe('Bug Reporting', () => {
    test('should report bugs with correct severity', () => {
      const bug = {
        title: 'Test bug',
        description: 'This is a test bug',
        severity: ErrorSeverity.HIGH,
        steps: ['Step 1', 'Step 2'],
      };
      
      bugReporter.reportBug(bug);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Bug reported'),
        expect.objectContaining({
          bugTitle: bug.title,
          severity: bug.severity,
        })
      );
    });

    test('should validate bug report data', () => {
      const invalidBug = {
        title: '', // Empty title should be invalid
        description: 'This is a test bug',
      };
      
      expect(() => bugReporter.reportBug(invalidBug)).toThrow('Invalid bug report data');
    });

    test('should assign bug categories automatically', () => {
      const bug = {
        title: 'UI rendering issue',
        description: 'Button not displaying correctly',
        steps: ['Navigate to page', 'Click button'],
      };
      
      bugReporter.reportBug(bug);
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Bug reported'),
        expect.objectContaining({
          category: ErrorCategory.UI,
        })
      );
    });
  });

  describe('Error Recovery', () => {
    test('should attempt recovery for recoverable errors', () => {
      const recoverableError = new Error('Network timeout');
      recoverableError.recoverable = true;
      
      const recoveryResult = errorHandler.attemptRecovery(recoverableError);
      
      expect(recoveryResult.success).toBe(true);
      expect(recoveryResult.message).toContain('recovery');
    });

    test('should not attempt recovery for non-recoverable errors', () => {
      const nonRecoverableError = new Error('Critical system failure');
      nonRecoverableError.recoverable = false;
      
      const recoveryResult = errorHandler.attemptRecovery(nonRecoverableError);
      
      expect(recoveryResult.success).toBe(false);
      expect(recoveryResult.message).toContain('not recoverable');
    });
  });

  describe('Error Aggregation', () => {
    test('should aggregate similar errors', () => {
      const error1 = new Error('Database connection failed');
      const error2 = new Error('Database connection failed');
      const error3 = new Error('Different error');
      
      errorHandler.handleError(error1);
      errorHandler.handleError(error2);
      errorHandler.handleError(error3);
      
      const aggregatedErrors = errorHandler.getAggregatedErrors();
      
      expect(aggregatedErrors.length).toBe(2); // Two unique errors
      expect(aggregatedErrors[0].count).toBe(2); // Database error occurred twice
      expect(aggregatedErrors[1].count).toBe(1); // Different error occurred once
    });

    test('should reset error aggregation when requested', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);
      
      expect(errorHandler.getAggregatedErrors().length).toBe(1);
      
      errorHandler.resetErrorAggregation();
      
      expect(errorHandler.getAggregatedErrors().length).toBe(0);
    });
  });

  describe('Error Notification', () => {
    test('should send notifications for critical errors', () => {
      const criticalError = new Error('Critical system failure');
      criticalError.severity = ErrorSeverity.CRITICAL;
      
      errorHandler.handleError(criticalError);
      
      // In a real implementation, this would trigger a notification system
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Critical error notification'),
        expect.any(Object)
      );
    });

    test('should not send notifications for low severity errors', () => {
      const lowSeverityError = new Error('Minor issue');
      lowSeverityError.severity = ErrorSeverity.LOW;
      
      errorHandler.handleError(lowSeverityError);
      
      // Check that notification was not called
      expect(mockLogger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Error notification'),
        expect.any(Object)
      );
    });
  });
});