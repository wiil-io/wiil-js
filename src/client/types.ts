/**
 * @fileoverview Type definitions for WIIL SDK client configuration.
 * @module client/types
 */

/**
 * Configuration options for the WIIL SDK client.
 *
 * @remarks
 * These options are used to initialize the {@link WiilClient} instance.
 *
 * @example
 * ```typescript
 * const config: WiilClientConfig = {
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.wiil.io/v1',
 *   timeout: 30000
 * };
 * ```
 */
export interface WiilClientConfig {
  /**
   * API key for authentication with the WIIL Platform.
   *
   * @remarks
   * This is required for all API requests. You can obtain an API key
   * from your WIIL Platform dashboard.
   */
  apiKey: string;

  /**
   * Base URL for the WIIL Platform API.
   *
   * @defaultValue 'https://api.wiil.io/v1'
   *
   * @remarks
   * Override this if you're using a custom deployment or different environment.
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   *
   * @defaultValue 30000 (30 seconds)
   *
   * @remarks
   * Requests that exceed this timeout will throw a {@link WiilNetworkError}.
   */
  timeout?: number;
}

/**
 * Standard API response wrapper.
 *
 * @typeParam T - The type of data contained in the response
 *
 * @remarks
 * All WIIL Platform API responses follow this structure, wrapping the actual
 * data with metadata about the request.
 *
 * @example
 * ```typescript
 * const response: APIResponse<Organization> = {
 *   success: true,
 *   data: {
 *     id: 'org_123',
 *     companyName: 'Acme Corp',
 *     // ...
 *   },
 *   metadata: {
 *     timestamp: 1704067200000,
 *     version: 'v1'
 *   }
 * };
 * ```
 */
export interface APIResponse<T> {
  /**
   * Indicates whether the request was successful.
   */
  success: boolean;

  /**
   * The response data.
   *
   * @remarks
   * This field contains the actual data returned by the API.
   * The type varies based on the endpoint called.
   */
  data: T;

  /**
   * Response metadata.
   *
   * @remarks
   * Contains additional information about the response such as
   * timestamp and API version.
   */
  metadata: {
    /**
     * Unix timestamp when the response was generated.
     */
    timestamp: number;

    /**
     * API version used for this response.
     */
    version: string;
  };
}

/**
 * Error response from the API.
 *
 * @remarks
 * This structure is returned when an API request fails (4xx or 5xx responses).
 *
 * @example
 * ```typescript
 * const errorResponse: APIErrorResponse = {
 *   success: false,
 *   error: {
 *     code: 'VALIDATION_ERROR',
 *     message: 'Invalid organization name',
 *     details: {
 *       field: 'companyName',
 *       issue: 'Must be at least 2 characters'
 *     }
 *   },
 *   metadata: {
 *     timestamp: 1704067200000,
 *     version: 'v1'
 *   }
 * };
 * ```
 */
export interface APIErrorResponse {
  /**
   * Always false for error responses.
   */
  success: false;

  /**
   * Error details.
   */
  error: {
    /**
     * Error code for programmatic handling.
     */
    code: string;

    /**
     * Human-readable error message.
     */
    message: string;

    /**
     * Additional error details.
     */
    details?: unknown;
  };

  /**
   * Response metadata.
   */
  metadata: {
    /**
     * Unix timestamp when the error occurred.
     */
    timestamp: number;

    /**
     * API version.
     */
    version: string;
  };
}
