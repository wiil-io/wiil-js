/**
 * @fileoverview Deployment Configurations resource for managing deployment configuration entities.
 * @module resources/service-mgt/deployment-configs
 */

import {
  DeploymentConfigurationResult,
  DeploymentConfigurationDetails,
  CreateDeploymentConfigurationSchema,
  CreateDeploymentConfiguration,
  CreateChainDeploymentConfigurationSchema,
  CreateChainDeploymentConfiguration,
  UpdateDeploymentConfigurationSchema,
  UpdateDeploymentConfiguration,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing deployment configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * deployment configurations. Deployment configurations link agents, instructions,
 * and channels together to create complete AI deployments. All methods require
 * proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new deployment configuration
 * const deployment = await client.deployments.create({
 *   name: 'Customer Service Deployment',
 *   agentConfigId: 'agent_123',
 *   instructionConfigId: 'inst_456',
 *   projectId: 'proj_789'
 * });
 *
 * // Get deployments by project
 * const projectDeployments = await client.deployments.listByProject('proj_789');
 *
 * // Get deployments by agent
 * const agentDeployments = await client.deployments.listByAgent('agent_123');
 * ```
 */
export class DeploymentConfigurationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/deployment-configurations';

  /**
   * Creates a new DeploymentConfigurationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new deployment configuration.
   *
   * @param data - Deployment configuration data
   * @returns Promise resolving to the created deployment configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateDeploymentConfiguration): Promise<DeploymentConfigurationResult> {
    return this.http.post<CreateDeploymentConfiguration, DeploymentConfigurationResult>(
      this.resource_path,
      data,
      CreateDeploymentConfigurationSchema
    );
  }

  /**
   * Creates a chained deployment configuration.
   *
   * @param data - Chain deployment configuration data
   * @returns Promise resolving to the created deployment configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createChain(data: CreateChainDeploymentConfiguration): Promise<DeploymentConfigurationResult> {
    return this.http.post<CreateChainDeploymentConfiguration, DeploymentConfigurationResult>(
      this.resource_path,
      data,
      CreateChainDeploymentConfigurationSchema
    );
  }

  /**
   * Retrieves a deployment configuration by ID.
   *
   * @param id - Deployment configuration ID
   * @returns Promise resolving to the deployment configuration
   *
   * @throws {@link WiilAPIError} - When the deployment configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<DeploymentConfigurationResult> {
    return this.http.get<DeploymentConfigurationResult>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a deployment configuration by channel ID.
   *
   * @param channelId - Deployment channel ID
   * @returns Promise resolving to the deployment configuration
   *
   * @throws {@link WiilAPIError} - When the deployment configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByChannel(channelId: string): Promise<DeploymentConfigurationResult> {
    return this.http.get<DeploymentConfigurationResult>(`${this.resource_path}/by-channel/${channelId}`);
  }

  /**
   * Updates an existing deployment configuration.
   *
   * @param data - Deployment configuration update data (must include id)
   * @returns Promise resolving to the updated deployment configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the deployment configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdateDeploymentConfiguration): Promise<DeploymentConfigurationResult> {
    return this.http.patch<UpdateDeploymentConfiguration, DeploymentConfigurationResult>(
      this.resource_path,
      data,
      UpdateDeploymentConfigurationSchema
    );
  }

  /**
   * Deletes a deployment configuration.
   *
   * @param id - Deployment configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the deployment configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists deployment configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of deployment configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DeploymentConfigurationResult>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DeploymentConfigurationResult>>(path);
  }

  /**
   * Lists deployment configurations by project ID with optional pagination.
   *
   * @param projectId - Project ID
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of deployment configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listByProject(
    projectId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DeploymentConfigurationResult>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-project/${projectId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DeploymentConfigurationResult>>(path);
  }

  /**
   * Lists deployment configurations by agent configuration ID with optional pagination.
   *
   * @param agentId - Agent configuration ID
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of deployment configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listByAgent(
    agentId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DeploymentConfigurationResult>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-agent/${agentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DeploymentConfigurationResult>>(path);
  }

  /**
   * Lists deployment configurations by instruction configuration ID with optional pagination.
   *
   * @param instructionId - Instruction configuration ID
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of deployment configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listByInstruction(
    instructionId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DeploymentConfigurationResult>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-instruction/${instructionId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DeploymentConfigurationResult>>(path);
  }
}
