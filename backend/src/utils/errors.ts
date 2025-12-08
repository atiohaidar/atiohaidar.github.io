/**
 * Centralized Error Classes
 * 
 * Custom error types for consistent error handling across the application.
 * These errors are designed to work with HTTP status codes and provide
 * meaningful error messages to clients.
 */

/**
 * Base application error with HTTP status code support
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where error was thrown
        Error.captureStackTrace?.(this, this.constructor);

        // Set the prototype explicitly for instanceof checks
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Resource not found (404)
 */
export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} tidak ditemukan`, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
    public readonly errors: Record<string, string>;

    constructor(message: string = 'Validasi gagal', errors: Record<string, string> = {}) {
        super(message, 400);
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Autentikasi diperlukan') {
        super(message, 401);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Authorization/Permission error (403)
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Akses ditolak') {
        super(message, 403);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

/**
 * Conflict error (409) - e.g., duplicate entry
 */
export class ConflictError extends AppError {
    constructor(message: string = 'Resource sudah ada') {
        super(message, 409);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * Rate limit exceeded (429)
 */
export class RateLimitError extends AppError {
    constructor(message: string = 'Terlalu banyak request, coba lagi nanti') {
        super(message, 429);
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
    constructor(message: string = 'Kesalahan database') {
        super(message, 500);
        Object.setPrototypeOf(this, DatabaseError.prototype);
    }
}

/**
 * Helper to check if error is an operational AppError
 */
export const isAppError = (error: unknown): error is AppError => {
    return error instanceof AppError;
};

/**
 * Helper to get error message safely
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Terjadi kesalahan yang tidak diketahui';
};

/**
 * Helper to get HTTP status code from error
 */
export const getErrorStatusCode = (error: unknown): number => {
    if (isAppError(error)) {
        return error.statusCode;
    }
    return 500;
};
