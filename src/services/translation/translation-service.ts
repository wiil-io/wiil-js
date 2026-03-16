/**
 * @fileoverview Translation service operations.
 * @module services/translation/translation-service
 */

import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';
import {
  TranslationConnectionConfig,
  TranslationConnectionConfigSchema,
  TranslationRequest,
  TranslationRequestSchema,
} from './translation-models';

const TRANSLATION_CONNECTION_RESOURCE_PATH = '/translation/provision';

/**
 * Service class for translation connection workflows.
 */
export class TranslationService {
  private readonly http: HttpClient;

  /**
   * Creates a new TranslationService instance.
   *
   * @param http - HTTP client for API communication
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a translation connection configuration.
   *
   * @param request - Translation request payload
   * @returns Translation connection configuration for initiator and participant
   */
  public async createConnectionConfig(
    request: TranslationRequest
  ): Promise<TranslationConnectionConfig> {
    const response = await this.http.post<TranslationRequest, TranslationConnectionConfig>(
      TRANSLATION_CONNECTION_RESOURCE_PATH,
      request,
      TranslationRequestSchema
    );

    const parsed = TranslationConnectionConfigSchema.safeParse(response);
    if (!parsed.success) {
      throw new WiilValidationError(
        'Response validation failed for translation connection configuration.',
        parsed.error.issues
      );
    }

    return parsed.data;
  }
}
