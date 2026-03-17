/**
 * @fileoverview Dynamic Agent Status resource for polling agent setup progress.
 * @module resources/service-mgt/dynamic-agent-status
 */

import {
  DynamicAgentSetupResult,
  DynamicWebAgentSetupResult,
  DynamicPhoneAgentSetupResult,
  DynamicAgentProcessingState,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Options for configuring long-polling behavior.
 *
 * @typedef {Object} PollOptions
 * @property {number} [interval] - Polling interval in milliseconds (default: 2000)
 * @property {number} [timeout] - Maximum wait time in milliseconds (default: 120000)
 * @property {function} [onProgress] - Callback invoked on each poll with current state
 */
export interface PollOptions {
  /**
   * Polling interval in milliseconds.
   * @default 2000
   */
  interval?: number;

  /**
   * Maximum wait time in milliseconds before timing out.
   * @default 120000
   */
  timeout?: number;

  /**
   * Callback invoked on each poll with the current processing state.
   * Useful for progress indicators and logging.
   */
  onProgress?: (state: DynamicAgentProcessingState) => void;
}

/**
 * Error thrown when polling times out before completion.
 */
export class PollTimeoutError extends Error {
  public readonly lastState: DynamicAgentProcessingState;

  constructor(message: string, lastState: DynamicAgentProcessingState) {
    super(message);
    this.name = 'PollTimeoutError';
    this.lastState = lastState;
  }
}

/**
 * Resource class for polling dynamic agent setup status.
 *
 * @remarks
 * Provides methods for checking and polling the status of dynamic agent setup
 * operations. Supports both phone and web agent configurations. Use this resource
 * to track long-running setup operations and wait for completion.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a dynamic agent (returns immediately)
 * const result = await client.dynamicPhoneAgent.create({
 *   assistantName: 'Support Agent',
 *   capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
 * });
 *
 * // Poll until setup completes
 * const final = await client.dynamicAgentStatus.poll(result.id, {
 *   interval: 2000,
 *   timeout: 60000,
 *   onProgress: (state) => {
 *     console.log(`${state.progressPercentage}% - ${state.message}`);
 *   }
 * });
 *
 * if (final.success) {
 *   console.log('Agent ready:', final.agentConfigurationId);
 * }
 * ```
 */
export class DynamicAgentStatusResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/dynamic-setup';

  /**
   * Creates a new DynamicAgentStatusResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves the current status of a dynamic agent setup operation.
   *
   * @param id - Dynamic agent setup ID
   * @returns Promise resolving to the setup result (base, web, or phone agent type)
   *
   * @throws {@link WiilAPIError} - When the setup ID is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * The returned type depends on the agent type that was created. Use property
   * checking to narrow the type and access specialized properties.
   *
   * @example
   * ```typescript
   * const status = await client.dynamicAgentStatus.get('setup_123');
   * console.log('Status:', status.processingState.status);
   * console.log('Progress:', status.processingState.progressPercentage);
   *
   * // Access web agent specific properties
   * if ('integrationSnippets' in status && status.integrationSnippets) {
   *   console.log('Snippets:', status.integrationSnippets);
   * }
   *
   * // Access phone agent specific properties
   * if ('phoneNumber' in status && status.phoneNumber) {
   *   console.log('Phone:', status.phoneNumber);
   * }
   * ```
   */
  public async get(id: string): Promise<DynamicAgentSetupResult | DynamicWebAgentSetupResult | DynamicPhoneAgentSetupResult> {
    return this.http.get<DynamicAgentSetupResult | DynamicWebAgentSetupResult | DynamicPhoneAgentSetupResult>(`${this.resource_path}/${id}`);
  }

  /**
   * Polls the status of a dynamic agent setup until completion or failure.
   *
   * @param id - Dynamic agent setup ID
   * @param options - Polling configuration options
   * @returns Promise resolving to the final setup result (base, web, or phone agent type)
   *
   * @throws {@link PollTimeoutError} - When polling times out before completion
   * @throws {@link WiilAPIError} - When the setup ID is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This method will continuously poll the API until the processing state reaches
   * 'completed' or 'failed'. If the timeout is reached before completion, a
   * PollTimeoutError is thrown containing the last known state.
   *
   * The returned type depends on the agent type that was created. Use property
   * checking to narrow the type and access specialized properties.
   *
   * @example
   * ```typescript
   * try {
   *   const result = await client.dynamicAgentStatus.poll('setup_123', {
   *     interval: 5000,
   *     timeout: 120000,
   *     onProgress: (state) => {
   *       console.log(`Progress: ${state.progressPercentage}%`);
   *     }
   *   });
   *
   *   if (result.success) {
   *     console.log('Agent ID:', result.agentConfigurationId);
   *
   *     // Web agent: access integration snippets
   *     if ('integrationSnippets' in result && result.integrationSnippets) {
   *       console.log('Snippets:', result.integrationSnippets);
   *     }
   *
   *     // Phone agent: access phone number
   *     if ('phoneNumber' in result && result.phoneNumber) {
   *       console.log('Phone:', result.phoneNumber);
   *     }
   *   }
   * } catch (error) {
   *   if (error instanceof PollTimeoutError) {
   *     console.error('Polling timed out at:', error.lastState.progressPercentage, '%');
   *   }
   * }
   * ```
   */
  public async poll(
    id: string,
    options?: PollOptions
  ): Promise<DynamicAgentSetupResult | DynamicWebAgentSetupResult | DynamicPhoneAgentSetupResult> {
    const interval = options?.interval ?? 5000; // Default to 5 seconds
    const timeout = options?.timeout ?? 120000; // Default to 2 minutes
    const onProgress = options?.onProgress;

    const startTime = Date.now();
    let lastState: DynamicAgentProcessingState | null = null;

    while (true) {
      const result = await this.get(id);
      lastState = result.processingState;

      // Invoke progress callback if provided
      if (onProgress) {
        onProgress(result.processingState);
      }

      // Check for terminal states
      if (
        result.processingState.status === 'completed' ||
        result.processingState.status === 'failed'
      ) {
        return result;
      }

      // Check for timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new PollTimeoutError(
          `Polling timed out after ${timeout}ms. Last status: ${lastState.status} at ${lastState.progressPercentage}%`,
          lastState
        );
      }

      // Wait before next poll
      await this.sleep(interval);
    }
  }

  /**
   * Utility method to sleep for a specified duration.
   *
   * @param ms - Duration to sleep in milliseconds
   * @returns Promise that resolves after the specified duration
   *
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
