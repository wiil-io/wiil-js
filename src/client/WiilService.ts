/**
 * @fileoverview WIIL SDK client for outbound communication and real-time services.
 * @module client/WiilService
 */

import { AxiosRequestConfig } from 'axios';
import { ZodType } from 'zod';
import { WiilConfigurationError } from '../errors/WiilError';
import { MessagingService } from '../services/messaging';
import { OttService } from '../services/ott';
import { TranslationService } from '../services/translation';
import { HttpClient } from './HttpClient';
import { WiilClientConfig } from './types';

/**
 * Configuration options for {@link WiilService}.
 */
export type WiilServiceConfig = Omit<WiilClientConfig, 'baseUrl'> & {
  /**
   * Optional override for the OTT API base URL.
   *
   * @defaultValue 'https://ott.wiil.io'
   */
  baseUrl?: string;
  /**
   * Optional override for API v1 endpoints used by messaging.
   *
   * @defaultValue 'https://api.wiil.io/v1'
   */
  apiBaseUrl?: string;
};

const DEFAULT_OTT_BASE_URL = 'https://ott.wiil.io';
const DEFAULT_API_BASE_URL = 'https://api.wiil.io/v1';
const DEFAULT_TIMEOUT = 30000;

/**
 * WIIL SDK client for outbound communication and real-time services.
 *
 * Provides access to messaging (calls, SMS, email), translation sessions,
 * and OTT connection services for AI-powered customer interactions.
 *
 * @example
 * ```typescript
 * import { WiilService } from 'wiil-js';
 *
 * const service = new WiilService({
 *   apiKey: 'your-api-key',
 * });
 *
 * // Request an outbound call
 * await service.messaging.requestCall({ ... });
 *
 * // Send an SMS
 * await service.messaging.sendSms({ ... });
 *
 * // Send an email
 * await service.messaging.sendEmail({ ... });
 * ```
 */
export class WiilService {
  private readonly http: HttpClient;
  private readonly apiHttp: HttpClient;

  /**
   * Translation service operations.
   */
  public readonly translation: TranslationService;

  /**
   * OTT connection configuration operations.
   */
  public readonly ott: OttService;

  /**
   * Messaging service operations.
   */
  public readonly messaging: MessagingService;

  /**
   * Resolved service configuration.
   */
  public readonly config: Required<WiilClientConfig>;

  /**
   * Creates a new WiilService instance.
   *
   * @param config - Service configuration
   */
  constructor(config: WiilServiceConfig) {
    this.validateConfig(config);

    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? DEFAULT_OTT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };

    this.http = new HttpClient(this.config);
    this.apiHttp = new HttpClient({
      apiKey: this.config.apiKey,
      baseUrl: config.apiBaseUrl ?? DEFAULT_API_BASE_URL,
      timeout: this.config.timeout,
    });
    this.translation = new TranslationService(this.http);
    this.ott = new OttService(this.http);
    this.messaging = new MessagingService(this.apiHttp);
  }

  /**
   * Makes a GET request for service endpoints.
   */
  public async get<TResponse>(
    path: string,
    requestConfig?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.http.get<TResponse>(path, requestConfig);
  }

  /**
   * Makes a POST request for service endpoints.
   */
  public async post<TRequest, TResponse>(
    path: string,
    data: TRequest,
    schema?: ZodType<TRequest>,
    requestConfig?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.http.post<TRequest, TResponse>(path, data, schema, requestConfig);
  }

  /**
   * Makes a PUT request for service endpoints.
   */
  public async put<TRequest, TResponse>(
    path: string,
    data: TRequest,
    schema?: ZodType<TRequest>,
    requestConfig?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.http.put<TRequest, TResponse>(path, data, schema, requestConfig);
  }

  /**
   * Makes a PATCH request for service endpoints.
   */
  public async patch<TRequest, TResponse>(
    path: string,
    data: TRequest,
    schema?: ZodType<TRequest>,
    requestConfig?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.http.patch<TRequest, TResponse>(path, data, schema, requestConfig);
  }

  /**
   * Makes a DELETE request for service endpoints.
   */
  public async delete<TResponse = void>(
    path: string,
    requestConfig?: AxiosRequestConfig
  ): Promise<TResponse> {
    return this.http.delete<TResponse>(path, requestConfig);
  }

  /**
   * Validates the service configuration.
   */
  private validateConfig(config: WiilServiceConfig): void {
    if (!config.apiKey) {
      throw new WiilConfigurationError(
        'API key is required. Please provide a valid API key in the configuration.'
      );
    }

    if (config.apiKey.trim().length === 0) {
      throw new WiilConfigurationError(
        'API key cannot be empty. Please provide a valid API key.'
      );
    }

    if (config.baseUrl !== undefined) {
      try {
        new URL(config.baseUrl);
      } catch {
        throw new WiilConfigurationError(
          `Invalid base URL: ${config.baseUrl}. Please provide a valid URL.`
        );
      }
    }

    if (config.apiBaseUrl !== undefined) {
      try {
        new URL(config.apiBaseUrl);
      } catch {
        throw new WiilConfigurationError(
          `Invalid API base URL: ${config.apiBaseUrl}. Please provide a valid URL.`
        );
      }
    }

    if (config.timeout !== undefined && config.timeout <= 0) {
      throw new WiilConfigurationError(
        'Timeout must be a positive number in milliseconds.'
      );
    }
  }
}
