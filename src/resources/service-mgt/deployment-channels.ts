/**
 * @fileoverview Deployment Channels resource for managing deployment channel entities.
 * @module resources/service-mgt/deployment-channels
 */

import {
  DeploymentChannel,
  CreateDeploymentChannelSchema,
  CreateDeploymentChannel,
  DeploymentChannelUpdateRequest,
  PaginatedResultType,
  PaginationRequest,
  UpdateDeploymentChannel,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Deployment type enum for filtering channels
 */
export enum DeploymentType {
  CALLS = 'CALLS',
  SMS = 'SMS',
  WEB = 'WEB',
  MOBILE = 'MOBILE'
}

/**
 * Resource class for managing deployment channels in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * deployment channels. Deployment channels represent communication endpoints
 * (phone numbers, web URLs, etc.) used for AI deployments. All methods require
 * proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new deployment channel
 * const channel = await client.channels.create({
 *   channelIdentifier: '+1234567890',
 *   channelType: 'CALLS',
 *   name: 'Customer Support Line'
 * });
 *
 * // Get channels by type
 * const callChannels = await client.channels.listByType('CALLS');
 *
 * // Get channel by identifier
 * const channel = await client.channels.getByIdentifier('+1234567890', 'CALLS');
 * ```
 */
export class DeploymentChannelsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/deployment-channels';

  /**
   * Creates a new DeploymentChannelsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new deployment channel.
   *
   * @param data - Deployment channel data
   * @returns Promise resolving to the created deployment channel
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateDeploymentChannel): Promise<DeploymentChannel> {
    return this.http.post<CreateDeploymentChannel, DeploymentChannel>(
      this.resource_path,
      data,
      CreateDeploymentChannelSchema
    );
  }

  /**
   * Retrieves a deployment channel by ID.
   *
   * @param id - Deployment channel ID
   * @returns Promise resolving to the deployment channel
   *
   * @throws {@link WiilAPIError} - When the deployment channel is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<DeploymentChannel> {
    return this.http.get<DeploymentChannel>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a deployment channel by identifier and type.
   *
   * @param identifier - Channel identifier (phone number, URL, etc.)
   * @param type - Deployment type
   * @returns Promise resolving to the deployment channel
   *
   * @throws {@link WiilAPIError} - When the deployment channel is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByIdentifier(identifier: string, type: DeploymentType): Promise<DeploymentChannel> {
    return this.http.get<DeploymentChannel>(
      `${this.resource_path}/by-identifier/${encodeURIComponent(identifier)}?type=${type}`
    );
  }

  /**
   * Updates an existing deployment channel.
   *
   * @param data - Deployment channel update data (must include id)
   * @returns Promise resolving to the updated deployment channel
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the deployment channel is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdateDeploymentChannel): Promise<DeploymentChannel> {
    return this.http.patch<UpdateDeploymentChannel, DeploymentChannel>(
      this.resource_path,
      data
    );
  }

  /**
   * Deletes a deployment channel.
   *
   * @param id - Deployment channel ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the deployment channel is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists deployment channels with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of deployment channels
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DeploymentChannel>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DeploymentChannel>>(path);
  }

  /**
   * Lists deployment channels by deployment type with optional pagination.
   *
   * @param type - Deployment type (CALLS, SMS, WEB, MOBILE)
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of deployment channels
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listByType(
    type: DeploymentType,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DeploymentChannel>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-type/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DeploymentChannel>>(path);
  }
}
