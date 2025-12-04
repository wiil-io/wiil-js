/**
 * @fileoverview Support Models resource for accessing LLM model configurations.
 * @module resources/service-mgt/support-models
 */

import {
  WiilSupportModel,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for accessing support model configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for retrieving LLM model configurations, including default models
 * for various capabilities (TTS, STT, multi-mode, etc.) and internal lookup methods.
 * The Support Model Registry maintains a curated list of LLM models from various
 * providers (OpenAI, Anthropic, etc.) with their capabilities, supported languages,
 * and voices. This is a read-only resource. All methods require proper authentication
 * via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a support model by ID
 * const model = await client.supportModels.get('gpt-4-turbo');
 *
 * // List all support models
 * const models = await client.supportModels.list();
 *
 * // Get default TTS model
 * const ttsModel = await client.supportModels.getDefaultTTS();
 * ```
 */
export class SupportModelsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/support-models';

  /**
   * Creates a new SupportModelsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a support model by Wiil model ID.
   *
   * @param modelId - Wiil unique model identifier (not the provider's model ID)
   * @returns Promise resolving to the support model configuration
   *
   * @throws {@link WiilAPIError} - When the model is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // Get model by Wiil model ID
   * const model = await client.supportModels.get('travnex-model-id-123');
   * console.log('Model:', model.name);
   * console.log('Proprietor:', model.proprietor);
   * console.log('Provider Model ID:', model.provider_model_id);
   * console.log('Type:', model.type);
   * console.log('Discontinued:', model.discontinued);
   * ```
   */
  public async get(modelId: string): Promise<WiilSupportModel> {
    return this.http.get<WiilSupportModel>(`${this.resource_path}/${modelId}`);
  }

  /**
   * Lists all support models in the registry.
   *
   * @returns Promise resolving to array of all support models
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const models = await client.supportModels.list();
   * console.log(`Found ${models.length} models`);
   * models.forEach(model => {
   *   console.log(`- ${model.name} (${model.proprietor})`);
   * });
   * ```
   */
  public async list(): Promise<WiilSupportModel[]> {
    return this.http.get<WiilSupportModel[]>(this.resource_path);
  }

  /**
   * Retrieves the default multi-mode model.
   *
   * @returns Promise resolving to the default multi-mode model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultMultiMode();
   * if (model) {
   *   console.log('Default multi-mode model:', model.name);
   * }
   * ```
   */
  public async getDefaultMultiMode(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/multi-mode`);
  }

  /**
   * Retrieves the default Speech-to-Speech model.
   *
   * @returns Promise resolving to the default STS model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultSTS();
   * if (model) {
   *   console.log('Default STS model:', model.name);
   * }
   * ```
   */
  public async getDefaultSTS(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/sts`);
  }

  /**
   * Retrieves the default Text-to-Speech model.
   *
   * @returns Promise resolving to the default TTS model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultTTS();
   * if (model) {
   *   console.log('Default TTS model:', model.name);
   *   console.log('Supported voices:', model.supportedVoices?.length);
   * }
   * ```
   */
  public async getDefaultTTS(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/tts`);
  }

  /**
   * Retrieves the default Speech-to-Text model.
   *
   * @returns Promise resolving to the default STT model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultSTT();
   * if (model) {
   *   console.log('Default STT model:', model.name);
   *   console.log('Supported languages:', model.supportLanguages?.length);
   * }
   * ```
   */
  public async getDefaultSTT(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/stt`);
  }

  /**
   * Retrieves the default Transcription model.
   *
   * @returns Promise resolving to the default transcription model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultTranscribe();
   * if (model) {
   *   console.log('Default transcription model:', model.name);
   * }
   * ```
   */
  public async getDefaultTranscribe(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/transcribe`);
  }

  /**
   * Retrieves the default Batch processing model.
   *
   * @returns Promise resolving to the default batch model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultBatch();
   * if (model) {
   *   console.log('Default batch model:', model.name);
   * }
   * ```
   */
  public async getDefaultBatch(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/batch`);
  }

  /**
   * Retrieves the default Translation Speech-to-Text model.
   *
   * @returns Promise resolving to the default translation STT model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultTranslationSTT();
   * if (model) {
   *   console.log('Default translation STT model:', model.name);
   * }
   * ```
   */
  public async getDefaultTranslationSTT(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/translation-stt`);
  }

  /**
   * Retrieves the default Translation Text-to-Speech model.
   *
   * @returns Promise resolving to the default translation TTS model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getDefaultTranslationTTS();
   * if (model) {
   *   console.log('Default translation TTS model:', model.name);
   * }
   * ```
   */
  public async getDefaultTranslationTTS(): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(`${this.resource_path}/defaults/translation-tts`);
  }

  /**
   * Retrieves a model by LLM type and proprietor (internal lookup method).
   *
   * @param type - LLM type (e.g., 'TEXT', 'VOICE', 'MULTI_MODE')
   * @param proprietor - Model proprietor (e.g., 'OpenAI', 'Anthropic', 'Google')
   * @returns Promise resolving to the matching model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getByTypeAndProprietor('TEXT', 'OpenAI');
   * if (model) {
   *   console.log('Found model:', model.name);
   * }
   * ```
   */
  public async getByTypeAndProprietor(
    type: string,
    proprietor: string
  ): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(
      `${this.resource_path}/lookup/type-proprietor/${type}/${proprietor}`
    );
  }

  /**
   * Retrieves a model by proprietor and provider model ID (internal lookup method).
   *
   * @param proprietor - Model proprietor (e.g., 'OpenAI', 'Anthropic', 'Google')
   * @param providerModelId - Provider-specific model identifier (e.g., 'gpt-4-1106-preview')
   * @returns Promise resolving to the matching model or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const model = await client.supportModels.getByProprietorAndProviderModelId(
   *   'Google',
   *   'gemini-2.0-flash-exp'
   * );
   * if (model) {
   *   console.log('Found model:', model.name);
   *   console.log('Wiil Model ID:', model.modelId);
   * }
   * ```
   */
  public async getByProprietorAndProviderModelId(
    proprietor: string,
    providerModelId: string
  ): Promise<WiilSupportModel | null> {
    return this.http.get<WiilSupportModel | null>(
      `${this.resource_path}/lookup/proprietor-provider/${proprietor}/${providerModelId}`
    );
  }
}
