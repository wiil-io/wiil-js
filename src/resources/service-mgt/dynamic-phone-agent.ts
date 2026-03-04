/**
 * @fileoverview Dynamic Phone Agent resource for provisioning and managing phone-based AI agents.
 * @module resources/service-mgt/dynamic-phone-agent
 */

import {
  DynamicPhoneAgentSetup,
  UpdateDynamicPhoneAgent,
  DynamicPhoneAgentSetupResult,
  DynamicAgentProcessingState,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { PollTimeoutError } from './dynamic-agent-status';

/**
 * Options for configuring agent creation behavior.
 */
export interface PhoneAgentCreateOptions {
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
 * Resource class for managing dynamic phone agent provisioning in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and deleting dynamic phone agent
 * configurations. Dynamic phone agents enable AI-powered phone interactions with configurable
 * STT (speech-to-text) and TTS (text-to-speech) capabilities. All methods require proper
 * authentication via API key.
 *
 * @example
 * ```typescript
 * import { BusinessSupportServices, AgentRoleTemplateIdentifier } from 'wiil-core-js';
 *
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new dynamic phone agent (waits for completion with progress logging)
 * const result = await client.dynamicPhoneAgent.create({
 *   assistantName: 'Sales Agent',
 *   language: 'en-US',
 *   capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
 *   role_template_identifier: AgentRoleTemplateIdentifier.SALES_REPRESENTATIVE,
 *   phoneConfigurationId: 'phone_config_123'
 * });
 *
 * // Create without waiting (returns immediately)
 * const pending = await client.dynamicPhoneAgent.create(data, {
 *   pollUntilComplete: false
 * });
 * ```
 */
export class DynamicPhoneAgentResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/dynamic-setup/phone-agent';
  private readonly status_path = '/dynamic-setup';

  /**
   * Creates a new DynamicPhoneAgentResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates and provisions a new dynamic phone agent.
   *
   * @param data - Phone agent configuration data
   * @param options - Creation options for polling and logging behavior
   * @returns Promise resolving to the setup result including provisioned phone number
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   * @throws {@link PollTimeoutError} - When polling times out before completion
   *
   * @example
   * ```typescript
   * import { BusinessSupportServices, AgentRoleTemplateIdentifier, SupportedProprietor } from 'wiil-core-js';
   *
   * // Create with default behavior (polls until complete, logs progress)
   * const result = await client.dynamicPhoneAgent.create({
   *   assistantName: 'Customer Service Agent',
   *   language: 'en-US',
   *   capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
   *   role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL,
   *   phoneConfigurationId: 'phone_config_123',
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
   * console.log('Provisioned phone number:', result.phoneNumber);
   *
   * // Create with custom progress handler
   * const result2 = await client.dynamicPhoneAgent.create(data, {
   *   onProgress: (state) => {
   *     updateProgressBar(state.progressPercentage);
   *   },
   *   silent: true // Suppress default logging
   * });
   * ```
   */
  public async create(
    data: DynamicPhoneAgentSetup,
    options?: PhoneAgentCreateOptions
  ): Promise<DynamicPhoneAgentSetupResult> {
    const pollUntilComplete = options?.pollUntilComplete ?? true;
    const pollInterval = options?.pollInterval ?? 5000;
    const pollTimeout = options?.pollTimeout ?? 120000;
    const onProgress = options?.onProgress;
    const silent = options?.silent ?? false;

    const startTime = Date.now();
    const agentName = data.assistantName;

    // Log initial creation
    if (!silent) {
      this.log(`Creating agent "${agentName}"...`);
    }

    // Create the agent
    const initialResult = await this.http.post<DynamicPhoneAgentSetup, DynamicPhoneAgentSetupResult>(
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
      const result = await this.http.get<DynamicPhoneAgentSetupResult>(
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
   * Retrieves a dynamic phone agent configuration by ID.
   *
   * @param id - Phone agent configuration ID
   * @returns Promise resolving to the phone agent setup result
   *
   * @throws {@link WiilAPIError} - When the phone agent is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const agent = await client.dynamicPhoneAgent.get('agent_123');
   * console.log('Phone Number:', agent.phoneNumber);
   * console.log('Agent Config ID:', agent.agentConfigurationId);
   * ```
   */
  public async get(id: string): Promise<DynamicPhoneAgentSetupResult> {
    return this.http.get<DynamicPhoneAgentSetupResult>(`${this.resource_path}/${id}`);
  }

  /**
   * Updates an existing dynamic phone agent configuration.
   *
   * @param data - Phone agent update data (must include id)
   * @returns Promise resolving to the updated phone agent setup result
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the phone agent is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.dynamicPhoneAgent.update({
   *   id: 'agent_123',
   *   assistantName: 'Updated Customer Service Agent',
   *   language: 'es-MX'
   * });
   * console.log('Updated agent:', updated.agentConfigurationId);
   * ```
   */
  public async update(data: UpdateDynamicPhoneAgent): Promise<DynamicPhoneAgentSetupResult> {
    return this.http.patch<UpdateDynamicPhoneAgent, DynamicPhoneAgentSetupResult>(
      this.resource_path,
      data
    );
  }

  /**
   * Deletes a dynamic phone agent configuration.
   *
   * @param id - Phone agent configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the phone agent is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. The provisioned phone number associated with this
   * agent will be released. Ensure you have proper authorization before deleting.
   *
   * @example
   * ```typescript
   * const deleted = await client.dynamicPhoneAgent.delete('agent_123');
   * if (deleted) {
   *   console.log('Phone agent deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Logs a message with agent context.
   */
  private log(message: string): void {
    console.log(`[Phone Agent] ${message}`);
  }

  /**
   * Logs progress with a visual progress bar.
   */
  private logProgress(state: DynamicAgentProcessingState): void {
    const progressBar = this.createProgressBar(state.progressPercentage);
    const statusMsg = state.message || this.getStatusMessage(state.status);
    console.log(`[Phone Agent] ${progressBar} ${state.progressPercentage}% | ${statusMsg}`);
  }

  /**
   * Logs the final result with summary.
   */
  private logFinalResult(
    result: DynamicPhoneAgentSetupResult,
    startTime: number,
    silent: boolean
  ): void {
    if (silent) return;

    const elapsed = Date.now() - startTime;
    const duration = this.formatDuration(elapsed);

    if (result.processingState.status === 'completed' && result.success) {
      console.log(`[Phone Agent] ${this.createProgressBar(100)} 100% | Setup complete`);
      console.log(`[Phone Agent] ✓ Ready in ${duration}`);
      if (result.phoneNumber) {
        console.log(`  → Phone: ${result.phoneNumber}`);
      }
      if (result.agentConfigurationId) {
        console.log(`  → Agent ID: ${result.agentConfigurationId}`);
      }
      if (result.instructionConfigurationId) {
        console.log(`  → Instruction ID: ${result.instructionConfigurationId}`);
      }
    } else {
      console.log(`[Phone Agent] ✗ Setup failed after ${duration}`);
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
}
