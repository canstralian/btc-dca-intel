import { Response } from "express";
import { z } from "zod";

export interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends Error {
  constructor(message: string, public statusCode?: number, public originalError?: any) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public validationDetails?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function handleError(error: any, res: Response, context: string): void {
  console.error(`[${context}] Error occurred:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Invalid input data",
      details: error.errors,
      code: "VALIDATION_ERROR"
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      error: error.message,
      details: error.validationDetails,
      code: "VALIDATION_ERROR"
    });
    return;
  }

  if (error instanceof DatabaseError) {
    console.error(`[${context}] Database error details:`, error.originalError);
    res.status(500).json({
      error: "Database operation failed",
      code: "DATABASE_ERROR"
    });
    return;
  }

  if (error instanceof ExternalServiceError) {
    console.error(`[${context}] External service error:`, error.originalError);
    const statusCode = error.statusCode === 404 ? 404 : 503;
    res.status(statusCode).json({
      error: error.message,
      code: "EXTERNAL_SERVICE_ERROR"
    });
    return;
  }

  // Network/fetch errors
  if (error.name === 'AbortError') {
    res.status(408).json({
      error: "Request timeout",
      code: "TIMEOUT_ERROR"
    });
    return;
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    res.status(503).json({
      error: "Network error - external service unavailable",
      code: "NETWORK_ERROR"
    });
    return;
  }

  // Generic fallback
  console.error(`[${context}] Unhandled error:`, error);
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR"
  });
}

export function wrapDatabaseOperation<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  return operation().catch((error) => {
    throw new DatabaseError(`${context} failed`, error);
  });
}

export function wrapExternalServiceCall<T>(
  operation: () => Promise<T>,
  serviceName: string
): Promise<T> {
  return operation().catch((error) => {
    let statusCode: number | undefined;
    if (error.response?.status) {
      statusCode = error.response.status;
    } else if (error.status) {
      statusCode = error.status;
    }
    
    throw new ExternalServiceError(
      `${serviceName} service error`,
      statusCode,
      error
    );
  });
}