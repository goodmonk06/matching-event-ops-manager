/**
 * Custom error classes for the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      'NOT_FOUND',
      404
    );
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, 'PAYMENT_ERROR', 402);
  }
}

export class CapacityError extends AppError {
  constructor(eventTitle: string) {
    super(`Event '${eventTitle}' is full`, 'CAPACITY_EXCEEDED', 400);
  }
}
