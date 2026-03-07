/**
 * @fileoverview Dynamic Web Agent resource for provisioning and managing web-based AI agents.
 * @module resources/service-mgt/dynamic-web-agent
 */

import {
  DynamicWebAgentSetup,
  UpdateDynamicWebAgent,
  DynamicWebAgentSetupResult,
  DynamicAgentProcessingState,
  DynamicSTTModelConfiguration,
  DynamicTTSModelConfiguration,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';
import { PollTimeoutError } from './dynamic-agent-status';

/**
 * Options for configuring agent creation behavior.
 */
export interface WebAgentCreateOptions {
  /**
   * Whether to poll until setup completes. When true, the method will wait
   * for the agent to be fully provisioned before returning.
   * @default true
   */
  pollUntilComplete?: boolean;

  /**
   * Polling interval in milliseconds.
   * @default 5000
   */
  pollInterval?: number;

  /**
   * Maximum wait time in milliseconds before timing out.
   * @default 120000
   */
  pollTimeout?: number;

  /**
   * Callback invoked on each poll with the current processing state.
   */
  onProgress?: (state: DynamicAgentProcessingState) => void;

  /**
   * Whether to suppress console logging. When false, progress is logged to console.
   * @default false
   */
  silent?: boolean;
}

/**
 * Resource class for managing dynamic web agent provisioning in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and deleting dynamic web agent
 * configurations. Dynamic web agents enable AI-powered web interactions with configurable
 * STT (speech-to-text) and TTS (text-to-speech) capabilities. Setup results include
 * integration snippets for embedding the agent on websites. All methods require proper
 * authentication via API key.
 *
 * @example
 * ```typescript
 * import { OttCommunicationType, BusinessSupportServices, AgentRoleTemplateIdentifier } from 'wiil-core-js';
 *
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new dynamic web agent (waits for completion with progress logging)
 * const result = await client.dynamicWebAgent.create({
 *   assistantName: 'Website Assistant',
 *   websiteUrl: 'https://example.com',
 *   communicationType: OttCommunicationType.TEXT,
 *   language: 'en-US',
 *   capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
 *   role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL
 * });
 *
 * // Get integration snippets
 * console.log('Integration snippets:', result.integrationSnippets);
 *
 * // Create without waiting (returns immediately)
 * const pending = await client.dynamicWebAgent.create(data, {
 *   pollUntilComplete: false
 * });
 * ```
 */
export class DynamicWebAgentResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/dynamic-setup/web-agent';
  private readonly status_path = '/dynamic-setup';

  /**
   * Creates a new DynamicWebAgentResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates and provisions a new dynamic web agent.
   *
   * @param data - Web agent configuration data
   * @param options - Creation options for polling and logging behavior
   * @returns Promise resolving to the setup result including integration snippets
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   * @throws {@link PollTimeoutError} - When polling times out before completion
   *
   * @example
   * ```typescript
   * import {
   *   OttCommunicationType,
   *   BusinessSupportServices,
   *   AgentRoleTemplateIdentifier,
   *   SupportedProprietor
   * } from 'wiil-core-js';
   *
   * // Create with default behavior (polls until complete, logs progress)
   * const result = await client.dynamicWebAgent.create({
   *   assistantName: 'Support Chat Agent',
   *   websiteUrl: 'https://example.com',
   *   communicationType: OttCommunicationType.UNIFIED,
   *   language: 'en-US',
   *   capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
   *   role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL,
   *   sttConfiguration: {
   *     providerType: SupportedProprietor.DEEPGRAM,
   *     providerModelId: 'nova-2'
   *   },
   *   ttsConfiguration: {
   *     providerType: SupportedProprietor.ELEVENLABS,
   *     providerModelId: 'eleven_turbo_v2',
   *     voiceId: 'voice_123'
   *   }
   * });
   * console.log('Integration snippets:', result.integrationSnippets);
   *
   * // Create with custom progress handler
   * const result2 = await client.dynamicWebAgent.create(data, {
   *   onProgress: (state) => {
   *     updateProgressBar(state.progressPercentage);
   *   },
   *   silent: true // Suppress default logging
   * });
   * ```
   */
  public async create(
    data: DynamicWebAgentSetup,
    options?: WebAgentCreateOptions
  ): Promise<DynamicWebAgentSetupResult> {
    const pollUntilComplete = options?.pollUntilComplete ?? true;
    const pollInterval = options?.pollInterval ?? 5000;
    const pollTimeout = options?.pollTimeout ?? 120000;
    const onProgress = options?.onProgress;
    const silent = options?.silent ?? false;

    const startTime = Date.now();
    const agentName = data.assistantName;

    // Validate model configurations before proceeding
    await this.validateModelConfigurations(data.sttConfiguration, data.ttsConfiguration);

    // Log initial creation
    if (!silent) {
      this.log(`Creating agent "${agentName}"...`);
    }

    // Create the agent
    const initialResult = await this.http.post<DynamicWebAgentSetup, DynamicWebAgentSetupResult>(
      this.resource_path,
      data
    );

    // If not polling, return immediately
    if (!pollUntilComplete) {
      if (!silent) {
        this.log(`Setup initiated (ID: ${initialResult.id})`);
      }
      return initialResult;
    }

    // Check if already complete
    if (
      initialResult.processingState.status === 'completed' ||
      initialResult.processingState.status === 'failed'
    ) {
      this.logFinalResult(initialResult, startTime, silent);
      return initialResult;
    }

    // Poll until complete
    let lastState: DynamicAgentProcessingState = initialResult.processingState;

    while (true) {
      const result = await this.http.get<DynamicWebAgentSetupResult>(
        `${this.status_path}/${initialResult.id}`
      );
      lastState = result.processingState;

      // Log progress
      if (!silent) {
        this.logProgress(lastState);
      }

      // Invoke callback
      if (onProgress) {
        onProgress(lastState);
      }

      // Check for terminal states
      if (lastState.status === 'completed' || lastState.status === 'failed') {
        this.logFinalResult(result, startTime, silent);
        return result;
      }

      // Check for timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= pollTimeout) {
        if (!silent) {
          this.log(`✗ Timeout after ${this.formatDuration(elapsed)}`);
        }
        throw new PollTimeoutError(
          `Polling timed out after ${pollTimeout}ms. Last status: ${lastState.status} at ${lastState.progressPercentage}%`,
          lastState
        );
      }

      // Wait before next poll
      await this.sleep(pollInterval);
    }
  }

  /**
   * Retrieves a dynamic web agent configuration by ID.
   *
   * @param id - Web agent configuration ID
   * @returns Promise resolving to the web agent setup result
   *
   * @throws {@link WiilAPIError} - When the web agent is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const agent = await client.dynamicWebAgent.get('agent_123');
   * console.log('Agent Config ID:', agent.agentConfigurationId);
   * console.log('Integration snippets:', agent.integrationSnippets);
   * ```
   */
  public async get(id: string): Promise<DynamicWebAgentSetupResult> {
    return this.http.get<DynamicWebAgentSetupResult>(`${this.resource_path}/${id}`);
  }

  /**
   * Updates an existing dynamic web agent configuration.
   *
   * @param data - Web agent update data (must include id)
   * @returns Promise resolving to the updated web agent setup result
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the web agent is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.dynamicWebAgent.update({
   *   id: 'agent_123',
   *   assistantName: 'Updated Support Agent',
   *   websiteUrl: 'https://new-example.com'
   * });
   * console.log('Updated agent:', updated.agentConfigurationId);
   * ```
   */
  public async update(data: UpdateDynamicWebAgent): Promise<DynamicWebAgentSetupResult> {
    // Validate model configurations before proceeding
    await this.validateModelConfigurations(data.sttConfiguration, data.ttsConfiguration);

    return this.http.patch<UpdateDynamicWebAgent, DynamicWebAgentSetupResult>(
      this.resource_path,
      data
    );
  }

  /**
   * Deletes a dynamic web agent configuration.
   *
   * @param id - Web agent configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the web agent is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. The integration snippets associated with this
   * agent will no longer function. Ensure you have proper authorization before deleting.
   *
   * @example
   * ```typescript
   * const deleted = await client.dynamicWebAgent.delete('agent_123');
   * if (deleted) {
   *   console.log('Web agent deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves integration snippets for a web agent.
   *
   * @param id - Web agent configuration ID
   * @returns Promise resolving to an array of integration code snippets
   *
   * @throws {@link WiilAPIError} - When the web agent is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * Returns code snippets that can be embedded in websites to enable the AI agent.
   * The snippets typically include script tags and initialization code.
   *
   * @example
   * ```typescript
   * const snippets = await client.dynamicWebAgent.getIntegrationSnippets('agent_123');
   * snippets.forEach((snippet, index) => {
   *   console.log(`Snippet ${index + 1}:`, snippet);
   * });
   * ```
   */
  public async getIntegrationSnippets(id: string): Promise<string[]> {
    return this.http.get<string[]>(`${this.resource_path}/${id}/snippets`);
  }

  /**
   * Logs a message with agent context.
   */
  private log(message: string): void {
    console.log(`[Web Agent] ${message}`);
  }

  /**
   * Logs progress with a visual progress bar.
   */
  private logProgress(state: DynamicAgentProcessingState): void {
    const progressBar = this.createProgressBar(state.progressPercentage);
    const statusMsg = state.message || this.getStatusMessage(state.status);
    console.log(`[Web Agent] ${progressBar} ${state.progressPercentage}% | ${statusMsg}`);
  }

  /**
   * Logs the final result with summary.
   */
  private logFinalResult(
    result: DynamicWebAgentSetupResult,
    startTime: number,
    silent: boolean
  ): void {
    if (silent) return;

    const elapsed = Date.now() - startTime;
    const duration = this.formatDuration(elapsed);

    if (result.processingState.status === 'completed' && result.success) {
      console.log(`[Web Agent] ${this.createProgressBar(100)} 100% | Setup complete`);
      console.log(`[Web Agent] ✓ Ready in ${duration}`);
      if (result.agentConfigurationId) {
        console.log(`  → Agent ID: ${result.agentConfigurationId}`);
      }
      if (result.instructionConfigurationId) {
        console.log(`  → Instruction ID: ${result.instructionConfigurationId}`);
      }
      if (result.integrationSnippets && result.integrationSnippets.length > 0) {
        console.log(`  → Integration snippets: ${result.integrationSnippets.length} available`);
      }
    } else {
      console.log(`[Web Agent] ✗ Setup failed after ${duration}`);
      if (result.errorMessage) {
        console.log(`  → Error: ${result.errorMessage}`);
      }
    }
  }

  /**
   * Creates a visual progress bar.
   */
  private createProgressBar(percentage: number): string {
    const total = 20;
    const filled = Math.round((percentage / 100) * total);
    const empty = total - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  /**
   * Gets a human-readable status message.
   */
  private getStatusMessage(status: string): string {
    switch (status) {
      case 'pending':
        return 'Initializing...';
      case 'in_progress':
        return 'Processing...';
      case 'completed':
        return 'Setup complete';
      case 'failed':
        return 'Setup failed';
      default:
        return status;
    }
  }

  /**
   * Formats duration in human-readable form.
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  }

  /**
   * Sleeps for the specified duration.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validates STT and TTS model configurations against the support registry.
   *
   * @param sttConfig - Optional STT configuration to validate
   * @param ttsConfig - Optional TTS configuration to validate
   *
   * @throws {@link WiilValidationError} - When a model is not supported
   *
   * @private
   */
  private async validateModelConfigurations(
    sttConfig?: DynamicSTTModelConfiguration | null,
    ttsConfig?: DynamicTTSModelConfiguration | null
  ): Promise<void> {
    const validationPromises: Promise<void>[] = [];

    if (sttConfig?.providerType && sttConfig?.providerModelId) {
      validationPromises.push(
        this.validateModel(
          sttConfig.providerType,
          sttConfig.providerModelId,
          'STT'
        )
      );
    }

    if (ttsConfig?.providerType && ttsConfig?.providerModelId) {
      validationPromises.push(
        this.validateModel(
          ttsConfig.providerType,
          ttsConfig.providerModelId,
          'TTS'
        )
      );
    }

    await Promise.all(validationPromises);
  }

  /**
   * Validates a single model against the support registry.
   *
   * @param providerType - The model provider (e.g., 'Deepgram', 'ElevenLabs')
   * @param providerModelId - The provider-specific model identifier
   * @param modelType - Label for error messages ('STT' or 'TTS')
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
      `/supports/${providerType}/${providerModelId}`
    );

    if (!isSupported) {
      throw new WiilValidationError(
        `Unsupported ${modelType} model: ${providerType}/${providerModelId}. ` +
        `Please verify the model is available in the support registry.`
      );
    }
  }
}
