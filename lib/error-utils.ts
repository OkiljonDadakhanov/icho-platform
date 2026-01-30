/**
 * Error utilities for handling API errors with strong type safety
 */

import type { ApiError } from './api';

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as ApiError).status === 'number'
  );
}

/**
 * Type guard to check if an error has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Type guard to check if an error has a detail property (Django REST framework format)
 */
export function hasDetail(error: unknown): error is { detail: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'detail' in error &&
    typeof (error as { detail: unknown }).detail === 'string'
  );
}

/**
 * Type guard to check if an error has an error property
 */
export function hasErrorField(error: unknown): error is { error: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error: unknown }).error === 'string'
  );
}

/**
 * Type guard to check if an error has a status property
 */
export function hasStatus(error: unknown): error is { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  );
}

/**
 * Extract a user-friendly error message from an API error
 */
export function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  if (!error) return fallback;

  // Handle ApiError type
  if (isApiError(error)) {
    // Check for specific error message
    if (error.message && error.message !== 'An error occurred') {
      return error.message;
    }

    // Check for field-level errors
    if (error.errors) {
      const errorMessages = Object.entries(error.errors)
        .map(([field, messages]) => {
          const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
          return `${fieldName}${Array.isArray(messages) ? messages.join(', ') : messages}`;
        })
        .filter(Boolean);

      if (errorMessages.length > 0) {
        return errorMessages.join('. ');
      }
    }
  }

  // Handle object with message
  if (hasMessage(error) && error.message !== 'An error occurred') {
    return error.message;
  }

  // Check for detail field (Django REST framework format)
  if (hasDetail(error)) {
    return error.detail;
  }

  // Check for error field
  if (hasErrorField(error)) {
    return error.error;
  }

  // Handle string error
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error object
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

/**
 * Get a user-friendly error message for common HTTP status codes
 */
export function getStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with existing data.';
    case 413:
      return 'The file is too large. Please upload a smaller file.';
    case 422:
      return 'The data provided is invalid.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'A server error occurred. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'The server is temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
}
