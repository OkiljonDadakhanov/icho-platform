/**
 * Error utilities for handling API errors
 */

import type { ApiError } from './api';

/**
 * Extract a user-friendly error message from an API error
 */
export function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  if (!error) return fallback;

  // Handle ApiError type
  if (typeof error === 'object' && error !== null) {
    const apiError = error as Partial<ApiError>;

    // Check for specific error message
    if (apiError.message && apiError.message !== 'An error occurred') {
      return apiError.message;
    }

    // Check for field-level errors
    if (apiError.errors) {
      const errorMessages = Object.entries(apiError.errors)
        .map(([field, messages]) => {
          const fieldName = field === 'non_field_errors' ? '' : `${field}: `;
          return `${fieldName}${Array.isArray(messages) ? messages.join(', ') : messages}`;
        })
        .filter(Boolean);

      if (errorMessages.length > 0) {
        return errorMessages.join('. ');
      }
    }

    // Check for detail field (Django REST framework format)
    if ('detail' in error && typeof (error as { detail: unknown }).detail === 'string') {
      return (error as { detail: string }).detail;
    }

    // Check for error field
    if ('error' in error && typeof (error as { error: unknown }).error === 'string') {
      return (error as { error: string }).error;
    }
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
