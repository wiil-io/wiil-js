/**
 * @fileoverview Provisioning Configurations resource for managing translation chain configurations.
 * @module resources/service-mgt/provisioning-configs
 */

import {
  TranslationChainConfig,
  CreateTranslationChainConfigSchema,
  CreateTranslationChainConfig,
  UpdateTranslationChainConfigSchema,
  UpdateTranslationChainConfig,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';

/**
 * Resource class for managing translation chain configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * translation chain configurations. Translation chains define STT, processing,
 * and TTS configurations for real-time translation deployments. All methods
 * require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new translation chain configuration
 * const config = await client.provisioningConfigs.create({
 *   chainName: 'spanish-translation-chain',
 *   sttConfig: {
 *     providerType: SupportedProprietor.DEEPGRAM,
 *     providerModelId: 'nova-2',
 *     languageId: 'es'
 *   },
 *   processingConfig: {
 *     providerType: SupportedProprietor.OPENAI,
 *     providerModelId: 'gpt-4o'
 *   },
 *   ttsConfig: {
 *     providerType: SupportedProprietor.ELEVENLABS,
 *     providerModelId: 'eleven_turbo_v2',
 *     voiceId: 'voice_123'
 *   },
 *   isTranslation: true
 * });
 *
 * // Get translation chain by ID
 * const chain = await client.provisioningConfigs.get('chain_123');
 *
 * // List translation chains
 * const chains = await client.provisioningConfigs.list();
 * ```
 */
export class ProvisioningConfigurationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/provisioning-configurations';

  /**
   * Creates a new ProvisioningConfigurationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new translation chain configuration.
   *
   * @param data - Translation chain configuration data
   * @returns Promise resolving to the created translation chain configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails or model is not supported
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateTranslationChainConfig): Promise<TranslationChainConfig> {
    await this.validateModelConfigurations(
      data.sttConfig,
      data.processingConfig,
      data.ttsConfig
    );

    return this.http.post<CreateTranslationChainConfig, TranslationChainConfig>(
      this.resource_path,
      data,
      CreateTranslationChainConfigSchema
    );
  }

  /**
   * Retrieves a translation chain configuration by ID.
   *
   * @param id - Translation chain configuration ID
   * @returns Promise resolving to the translation chain configuration
   *
   * @throws {@link WiilAPIError} - When the configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<TranslationChainConfig> {
    return this.http.get<TranslationChainConfig>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a translation chain configuration by chain name.
   *
   * @param chainName - Chain name
   * @returns Promise resolving to the translation chain configuration
   *
   * @throws {@link WiilAPIError} - When the configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByChainName(chainName: string): Promise<TranslationChainConfig> {
    return this.http.get<TranslationChainConfig>(`${this.resource_path}/by-chain-name/${chainName}`);
  }

  /**
   * Updates an existing translation chain configuration.
   *
   * @param data - Translation chain update data (must include id)
   * @returns Promise resolving to the updated translation chain configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails or model is not supported
   * @throws {@link WiilAPIError} - When the configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdateTranslationChainConfig): Promise<TranslationChainConfig> {
    await this.validateModelConfigurations(
      data.sttConfig,
      data.processingConfig,
      data.ttsConfig
    );

    return this.http.patch<UpdateTranslationChainConfig, TranslationChainConfig>(
      this.resource_path,
      data,
      UpdateTranslationChainConfigSchema
    );
  }

  /**
   * Deletes a translation chain configuration.
   *
   * @param id - Translation chain configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists translation chain configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of translation chain configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationChainConfig>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/translations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationChainConfig>>(path);
  }

  /**
   * Validates STT, Processing, and TTS model configurations against the support registry.
   *
   * @param sttConfig - Optional STT configuration to validate
   * @param processingConfig - Optional Processing configuration to validate
   * @param ttsConfig - Optional TTS configuration to validate
   *
   * @throws {@link WiilValidationError} - When a model is not supported
   *
   * @private
   */
  private async validateModelConfigurations(
    sttConfig?: { providerType: string; providerModelId: string } | null,
    processingConfig?: { providerType: string; providerModelId: string } | null,
    ttsConfig?: { providerType: string; providerModelId: string } | null
  ): Promise<void> {
    const validationPromises: Promise<void>[] = [];

    if (sttConfig?.providerType && sttConfig?.providerModelId) {
      validationPromises.push(
        this.validateModel(sttConfig.providerType, sttConfig.providerModelId, 'STT')
      );
    }

    if (processingConfig?.providerType && processingConfig?.providerModelId) {
      validationPromises.push(
        this.validateModel(processingConfig.providerType, processingConfig.providerModelId, 'Processing')
      );
    }

    if (ttsConfig?.providerType && ttsConfig?.providerModelId) {
      validationPromises.push(
        this.validateModel(ttsConfig.providerType, ttsConfig.providerModelId, 'TTS')
      );
    }

    await Promise.all(validationPromises);
  }

  /**
   * Validates a single model against the support registry.
   *
   * @param providerType - The model provider (e.g., 'Deepgram', 'ElevenLabs')
   * @param providerModelId - The provider-specific model identifier
   * @param modelType - Label for error messages ('STT', 'Processing', or 'TTS')
   *
   * @throws {@link WiilValidationError} - When the model is not supported
   *
   * @private
   */
  private async validateModel(
    providerType: string,
    providerModelId: string,
    modelType: string
  ): Promise<void> {
    const isSupported = await this.http.get<boolean>(
      `/support-models/supports/${providerType}/${providerModelId}`
    );

    if (!isSupported) {
      throw new WiilValidationError(
        `Unsupported ${modelType} model: ${providerType}/${providerModelId}. ` +
        `Please verify the model is available in the support registry.`
      );
    }
  }
}
