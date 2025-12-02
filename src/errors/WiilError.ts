/**
 * @fileoverview Custom error classes for WIIL SDK.
 * @module errors/WiilError
 */

/**
 * Base error class for all WIIL SDK errors.
 *
 * @remarks
 * All custom errors in the SDK extend from this base class, providing
 * a consistent error handling interface across the SDK.
 *
 * @example
 * ```typescript
 * try {
 *   // SDK operation
 * } catch (error) {
 *   if (error instanceof WiilError) {
 *     console.error('WIIL SDK Error:', error.message);
 *   }
 * }
 * ```
 */
export class WiilError extends Error {
  /**
   * Additional details about the error.
   */
  public readonly details?: unknown;

  /**
   * Creates a new WiilError instance.
   *
   * @param message - Human-readable error message
   * @param details - Additional error context or details
   */
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'WiilError';
    this.details = details;
    Object.setPrototypeOf(this, WiilError.prototype);
  }
}

/**
 * Error thrown when an API request fails.
 *
 * @remarks
 * This error is thrown for HTTP 4xx and 5xx responses from the WIIL Platform API.
 * It includes the HTTP status code and error code from the API response.
 *
 * @example
 * ```typescript
 * try {
 *   await client.organizations.get('invalid-id');
 * } catch (error) {
 *   if (error instanceof WiilAPIError) {
 *     console.error(`API Error ${error.statusCode}:`, error.message);
 *     console.error('Error Code:', error.code);
 *   }
 * }
 * ```
 */
export class WiilAPIError extends WiilError {
  /**
   * HTTP status code from the API response.
   */
  public readonly statusCode?: number;

  /**
   * Error code from the API response.
   */
  public readonly code?: string;

  /**
   * Creates a new WiilAPIError instance.
   *
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   * @param code - Error code from API
   * @param details - Additional error context
   */
  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    details?: unknown
  ) {
    super(message, details);
    this.name = 'WiilAPIError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, WiilAPIError.prototype);
  }
}

/**
 * Error thrown when request or response validation fails.
 *
 * @remarks
 * This error is thrown when Zod schema validation fails for request payloads
 * or API responses. It includes validation error details from Zod.
 *
 * @example
 * ```typescript
 * try {
 *   await client.organizations.create({ name: '' }); // Invalid: name too short
 * } catch (error) {
 *   if (error instanceof WiilValidationError) {
 *     console.error('Validation failed:', error.message);
 *     console.error('Details:', error.details);
 *   }
 * }
 * ```
 */
export class WiilValidationError extends WiilError {
  /**
   * Creates a new WiilValidationError instance.
   *
   * @param message - Human-readable error message
   * @param details - Validation error details from Zod
   */
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.name = 'WiilValidationError';
    Object.setPrototypeOf(this, WiilValidationError.prototype);
  }
}

/**
 * Error thrown when network communication fails.
 *
 * @remarks
 * This error is thrown for network-level failures such as connection timeouts,
 * DNS resolution failures, or network unavailability.
 *
 * @example
 * ```typescript
 * try {
 *   await client.organizations.list();
 * } catch (error) {
 *   if (error instanceof WiilNetworkError) {
 *     console.error('Network error:', error.message);
 *     console.error('Consider retrying the request');
 *   }
 * }
 * ```
 */
export class WiilNetworkError extends WiilError {
  /**
   * Creates a new WiilNetworkError instance.
   *
   * @param message - Human-readable error message
   * @param details - Additional error context
   */
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.name = 'WiilNetworkError';
    Object.setPrototypeOf(this, WiilNetworkError.prototype);
  }
}

/**
 * Error thrown when SDK configuration is invalid.
 *
 * @remarks
 * This error is thrown when the SDK is initialized with invalid configuration,
 * such as missing API key or invalid base URL.
 *
 * @example
 * ```typescript
 * try {
 *   new WiilClient({ apiKey: '' }); // Invalid: empty API key
 * } catch (error) {
 *   if (error instanceof WiilConfigurationError) {
 *     console.error('Configuration error:', error.message);
 *   }
 * }
 * ```
 */
export class WiilConfigurationError extends WiilError {
  /**
   * Creates a new WiilConfigurationError instance.
   *
   * @param message - Human-readable error message
   */
  constructor(message: string) {
    super(message);
    this.name = 'WiilConfigurationError';
    Object.setPrototypeOf(this, WiilConfigurationError.prototype);
  }
}
