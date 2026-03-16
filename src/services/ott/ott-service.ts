/**
 * @fileoverview OTT service for fetching chat and voice connection configurations.
 * @module services/ott/ott-service
 */

import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';
import {
  OttChatConnectionConfig,
  OttChatConnectionConfigSchema,
  OttVoiceConnectionConfig,
  OttVoiceConnectionConfigSchema,
  GetOttConfigurationRequest,
  GetOttConfigurationRequestSchema,
} from './ott-models';

const CHAT_CONFIG_PATH = 'chat-service-config';
const VOICE_CONFIG_PATH = 'commission-service-agent';

/**
 * Service class for OTT connection configuration operations.
 */
export class OttService {
  private readonly http: HttpClient;

  /**
   * Creates a new OttService instance.
   *
   * @param http - HTTP client for API communication
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Fetches chat connection configuration.
   *
   * @param request - Configuration request parameters
   * @returns Chat connection configuration with WebSocket URL and tokens
   */
  public async getChatConnectionConfiguration(
    request: GetOttConfigurationRequest
  ): Promise<OttChatConnectionConfig> {
    const requestParse = GetOttConfigurationRequestSchema.safeParse(request);
    if (!requestParse.success) {
      throw new WiilValidationError(
        'Invalid OTT chat config request payload.',
        requestParse.error.issues
      );
    }

    const validatedRequest = requestParse.data;
    const path = this.buildConfigPath(CHAT_CONFIG_PATH, validatedRequest);

    const response = await this.http.get<OttChatConnectionConfig>(path);

    const responseParse = OttChatConnectionConfigSchema.safeParse(response);
    if (!responseParse.success) {
      throw new WiilValidationError(
        'Invalid OTT chat config response payload.',
        responseParse.error.issues
      );
    }

    return responseParse.data;
  }

  /**
   * Fetches voice connection configuration.
   *
   * @param request - Configuration request parameters
   * @returns Voice connection configuration with channel tokens and identifiers
   */
  public async getVoiceConnectionConfiguration(
    request: GetOttConfigurationRequest
  ): Promise<OttVoiceConnectionConfig> {
    const requestParse = GetOttConfigurationRequestSchema.safeParse(request);
    if (!requestParse.success) {
      throw new WiilValidationError(
        'Invalid OTT voice config request payload.',
        requestParse.error.issues
      );
    }

    const validatedRequest = requestParse.data;
    const path = this.buildConfigPath(VOICE_CONFIG_PATH, validatedRequest);

    const response = await this.http.get<OttVoiceConnectionConfig>(path);

    const responseParse = OttVoiceConnectionConfigSchema.safeParse(response);
    if (!responseParse.success) {
      throw new WiilValidationError(
        'Invalid OTT voice config response payload.',
        responseParse.error.issues
      );
    }

    return responseParse.data;
  }

  /**
   * Builds the configuration endpoint path.
   */
  private buildConfigPath(endpoint: string, request: GetOttConfigurationRequest): string {
    const encodedConfigId = encodeURIComponent(request.configId);
    const basePath = `/${endpoint}/${encodedConfigId}`;

    const queryParams = new URLSearchParams();

    if (request.contact?.email) {
      queryParams.set('email', request.contact.email);
    }

    if (request.contact?.phone) {
      queryParams.set('phone', request.contact.phone);
    }

    return queryParams.toString().length > 0
      ? `${basePath}?${queryParams.toString()}`
      : basePath;
  }
}
