/**
 * @fileoverview Agent Configurations resource for managing agent configuration entities.
 * @module resources/service-mgt/agent-configs
 */

import {
  AgentConfiguration,
  CreateAgentConfiguration,
  UpdateAgentConfiguration,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing agent configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * agent configurations. Agent configurations define the behavior and settings
 * for AI agents in the system. All methods require proper authentication via
 * API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new agent configuration
 * const agentConfig = await client.agents.create({
 *   name: 'Customer Service Agent',
 *   description: 'AI agent for customer support',
 *   modelId: 'gpt-4',
 *   temperature: 0.7
 * });
 *
 * // Get an agent configuration by ID
 * const agent = await client.agents.get('agent_123');
 *
 * // Update an agent configuration
 * const updated = await client.agents.update({
 *   id: 'agent_123',
 *   temperature: 0.8
 * });
 *
 * // List all agent configurations
 * const agents = await client.agents.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete an agent configuration
 * await client.agents.delete('agent_123');
 * ```
 */
export class AgentConfigurationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/agent-configurations';

  /**
   * Creates a new AgentConfigurationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new agent configuration.
   *
   * @param data - Agent configuration data
   * @returns Promise resolving to the created agent configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const agentConfig = await client.agents.create({
   *   name: 'Sales Assistant',
   *   description: 'AI agent for sales inquiries',
   *   modelId: 'gpt-4-turbo',
   *   temperature: 0.7,
   *   systemPrompt: 'You are a helpful sales assistant...'
   * });
   * console.log('Created agent:', agentConfig.id);
   * ```
   */
  public async create(data: CreateAgentConfiguration): Promise<AgentConfiguration> {
    return this.http.post<CreateAgentConfiguration, AgentConfiguration>(
      this.resource_path,
      data
    );
  }

  /**
   * Retrieves an agent configuration by ID.
   *
   * @param id - Agent configuration ID
   * @returns Promise resolving to the agent configuration
   *
   * @throws {@link WiilAPIError} - When the agent configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const agentConfig = await client.agents.get('agent_123');
   * console.log('Agent:', agentConfig.name);
   * console.log('Model:', agentConfig.modelId);
   * ```
   */
  public async get(id: string): Promise<AgentConfiguration> {
    return this.http.get<AgentConfiguration>(`${this.resource_path}/${id}`);
  }

  /**
   * Updates an existing agent configuration.
   *
   * @param data - Agent configuration update data (must include id)
   * @returns Promise resolving to the updated agent configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the agent configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.agents.update({
   *   id: 'agent_123',
   *   temperature: 0.8,
   *   systemPrompt: 'Updated system prompt...'
   * });
   * console.log('Updated agent:', updated.name);
   * ```
   */
  public async update(data: UpdateAgentConfiguration): Promise<AgentConfiguration> {
    return this.http.patch<UpdateAgentConfiguration, AgentConfiguration>(
      this.resource_path,
      data
    );
  }

  /**
   * Deletes an agent configuration.
   *
   * @param id - Agent configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the agent configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting an agent configuration. Deployments using this agent
   * configuration may be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.agents.delete('agent_123');
   * if (deleted) {
   *   console.log('Agent configuration deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists agent configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of agent configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.agents.list();
   *
   * // List with custom pagination
   * const page2 = await client.agents.list({
   *   page: 2,
   *   pageSize: 50,
   *   sortBy: 'name',
   *   sortDirection: 'desc'
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} agent configurations`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(agent => {
   *   console.log(`- ${agent.name} (${agent.id})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AgentConfiguration>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<AgentConfiguration>>(path);
  }
}
