/**
 * @fileoverview Extended WIIL SDK client with OTT default base URL.
 * @module client/WillService
 */

import { AxiosRequestConfig } from 'axios';
import { ZodType } from 'zod';
import { WiilConfigurationError } from '../errors/WiilError';
import { OttService } from '../services/ott';
import { TranslationService } from '../services/translation';
import { HttpClient } from './HttpClient';
import { WiilClientConfig } from './types';

/**
 * Configuration options for {@link WillService}.
 *
 * @remarks
 * Uses the same options as {@link WiilClientConfig}, but defaults `baseUrl`
 * to `https://ott.wiil.io` when omitted.
 */
export type WillServiceConfig = Omit<WiilClientConfig, 'baseUrl'> & {
  /**
   * Optional override for the OTT API base URL.
   *
   * @defaultValue 'https://ott.wiil.io'
   */
  baseUrl?: string;
};

const DEFAULT_OTT_BASE_URL = 'https://ott.wiil.io';
const DEFAULT_TIMEOUT = 30000;

/**
 * Service-focused WIIL client for OTT endpoints.
 *
 * @remarks
 * `WillService` is an independent implementation that uses {@link HttpClient}
 * directly for service workflows and defaults to `https://ott.wiil.io`.
 */
export class WillService {
  private readonly http: HttpClient;

  /**
   * Translation service operations.
   */
  public readonly translation: TranslationService;

  /**
   * OTT connection configuration operations.
   */
  public readonly ott: OttService;

  /**
   * Resolved service configuration.
   */
  public readonly config: Required<WiilClientConfig>;

  /**
   * Creates a new WillService instance.
   *
   * @param config - Service configuration
   */
  constructor(config: WillServiceConfig) {
    this.validateConfig(config);

    this.config = {
      ...config,
      baseUrl: config.baseUrl ?? DEFAULT_OTT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    };

    this.http = new HttpClient(this.config);
    this.translation = new TranslationService(this.http);
    this.ott = new OttService(this.http);
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
  private validateConfig(config: WillServiceConfig): void {
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

    if (config.timeout !== undefined && config.timeout <= 0) {
      throw new WiilConfigurationError(
        'Timeout must be a positive number in milliseconds.'
      );
    }
  }
}
