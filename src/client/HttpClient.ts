/**
 * @fileoverview HTTP client for making requests to the WIIL Platform API.
 * @module client/HttpClient
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { ZodSchema } from 'zod';
import {
  WiilAPIError,
  WiilNetworkError,
  WiilValidationError,
} from '../errors/WiilError';
import { WiilClientConfig, APIResponse, APIErrorResponse } from './types';

/**
 * HTTP client for communicating with the WIIL Platform API.
 *
 * @remarks
 * This class handles all HTTP communication with the WIIL Platform API,
 * including authentication, request/response validation, and error handling.
 * It is used internally by resource classes and should not be instantiated directly.
 *
 * @internal
 */
export class HttpClient {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  /**
   * Creates a new HttpClient instance.
   *
   * @param config - Client configuration
   *
   * @internal
   */
  constructor(config: Required<WiilClientConfig>) {
    this.apiKey = config.apiKey;

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-WIIL-API-Key': this.apiKey,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Sets up axios request and response interceptors.
   *
   * @remarks
   * - Request interceptor: Ensures API key header is present
   * - Response interceptor: Transforms API responses and handles errors
   *
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Ensure API key is always present
        config.headers['X-WIIL-API-Key'] = this.apiKey;
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handles errors from axios requests.
   *
   * @param error - Error from axios
   * @returns Transformed WiilError
   *
   * @private
   */
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<APIErrorResponse>;

      // Network errors (no response received)
      if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED') {
          return new WiilNetworkError('Request timeout', {
            originalError: axiosError.message,
          });
        }

        return new WiilNetworkError(
          axiosError.message || 'Network error occurred',
          {
            code: axiosError.code,
            originalError: axiosError.message,
          }
        );
      }

      // API errors (response received with error status)
      const { status, data } = axiosError.response;

      if (data && !data.success && data.error) {
        return new WiilAPIError(
          data.error.message,
          status,
          data.error.code,
          data.error.details
        );
      }

      // Fallback for non-standard error responses
      return new WiilAPIError(
        `Request failed with status ${status}`,
        status,
        'UNKNOWN_ERROR',
        data
      );
    }

    // Non-axios errors
    if (error instanceof Error) {
      return error;
    }

    return new WiilAPIError('An unknown error occurred', undefined, 'UNKNOWN_ERROR', error);
  }

  /**
   * Makes a GET request to the API.
   *
   * @typeParam T - Expected response data type
   * @param path - API endpoint path
   * @param config - Optional axios request configuration
   * @returns Promise resolving to the response data
   *
   * @throws {@link WiilAPIError} - When the API returns an error response
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @internal
   */
  public async get<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<APIResponse<T>>(path, config);
    return response.data.data;
  }

  /**
   * Makes a POST request to the API with request validation.
   *
   * @typeParam TRequest - Request payload type
   * @typeParam TResponse - Expected response data type
   * @param path - API endpoint path
   * @param data - Request payload
   * @param schema - Zod schema for validating the request payload
   * @param config - Optional axios request configuration
   * @returns Promise resolving to the response data
   *
   * @throws {@link WiilValidationError} - When request validation fails
   * @throws {@link WiilAPIError} - When the API returns an error response
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @internal
   */
  public async post<TRequest, TResponse>(
    path: string,
    data: TRequest,
    schema?: ZodSchema<TRequest>,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    // Validate request if schema provided
    if (schema) {
      const validation = schema.safeParse(data);
      if (!validation.success) {
        throw new WiilValidationError(
          'Request validation failed',
          validation.error.issues
        );
      }
    }

    const response = await this.client.post<APIResponse<TResponse>>(
      path,
      data,
      config
    );
    return response.data.data;
  }

  /**
   * Makes a PUT request to the API with request validation.
   *
   * @typeParam TRequest - Request payload type
   * @typeParam TResponse - Expected response data type
   * @param path - API endpoint path
   * @param data - Request payload
   * @param schema - Zod schema for validating the request payload
   * @param config - Optional axios request configuration
   * @returns Promise resolving to the response data
   *
   * @throws {@link WiilValidationError} - When request validation fails
   * @throws {@link WiilAPIError} - When the API returns an error response
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @internal
   */
  public async put<TRequest, TResponse>(
    path: string,
    data: TRequest,
    schema?: ZodSchema<TRequest>,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    // Validate request if schema provided
    if (schema) {
      const validation = schema.safeParse(data);
      if (!validation.success) {
        throw new WiilValidationError(
          'Request validation failed',
          validation.error.issues
        );
      }
    }

    const response = await this.client.put<APIResponse<TResponse>>(
      path,
      data,
      config
    );
    return response.data.data;
  }

  /**
   * Makes a PATCH request to the API.
   *
   * @param path - API endpoint path
   * @param data - Request payload
   * @param schema - Zod schema for validating the request payload
   * @param config - Optional axios request configuration
   * @returns Promise resolving to the response data
   *
   * @throws {@link WiilValidationError} - When request validation fails
   * @throws {@link WiilAPIError} - When the API returns an error response
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @internal
   */
  public async patch<TRequest, TResponse>(
    path: string,
    data: TRequest,
    schema?: ZodSchema<TRequest>,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    // Validate request if schema provided
    if (schema) {
      const validation = schema.safeParse(data);
      if (!validation.success) {
        throw new WiilValidationError(
          'Request validation failed',
          validation.error.issues
        );
      }
    }

    const response = await this.client.patch<APIResponse<TResponse>>(
      path,
      data,
      config
    );
    return response.data.data;
  }

  /**
   * Makes a DELETE request to the API.
   *
   * @param path - API endpoint path
   * @param config - Optional axios request configuration
   * @returns Promise resolving to the response data or void
   *
   * @throws {@link WiilAPIError} - When the API returns an error response
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @internal
   */
  public async delete<TResponse = void>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const response = await this.client.delete<APIResponse<TResponse>>(path, config);
    return response.data.data;
  }
}
