/**
 * @fileoverview Resource Instances resource for managing physical reservation units.
 * @module resources/resource-instances
 */

import {
  ResourceInstance,
  CreateResourceInstance,
  CreateResourceInstanceSchema,
  UpdateResourceInstance,
  UpdateResourceInstanceSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../../client/HttpClient';
import { WiilValidationError } from '../../../../errors/WiilError';

const BATCH_LIMIT = 100;

/**
 * Resource class for managing resource instances in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * resource instances. Resource instances represent physical reservable units
 * such as specific tables, rooms, or rental equipment with operational status
 * tracking and availability management.
 * All methods require proper authentication via API key.
 */
export class ResourceInstancesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/resource-instances';

  /**
   * Creates a new ResourceInstancesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new resource instance.
   *
   * @param data - Resource instance data
   * @returns Promise resolving to the created instance
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateResourceInstance): Promise<ResourceInstance> {
    return this.http.post<CreateResourceInstance, ResourceInstance>(
      this.resource_path,
      data,
      CreateResourceInstanceSchema
    );
  }

  /**
   * Retrieves a resource instance by ID.
   *
   * @param id - Resource instance ID
   * @returns Promise resolving to the instance
   *
   * @throws {@link WiilAPIError} - When the instance is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ResourceInstance> {
    return this.http.get<ResourceInstance>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves resource instances by parent resource ID.
   *
   * @param resourceId - Parent resource ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of instances
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByResource(
    resourceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ResourceInstance>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-resource/${resourceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ResourceInstance>>(path);
  }

  /**
   * Retrieves resource instances by operational status.
   *
   * @param status - Operational status filter
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of instances
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByStatus(
    status: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ResourceInstance>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status/${status}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ResourceInstance>>(path);
  }

  /**
   * Retrieves available resource instances.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of available instances
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getAvailable(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ResourceInstance>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/available${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ResourceInstance>>(path);
  }

  /**
   * Updates an existing resource instance.
   *
   * @param id - Resource instance ID
   * @param data - Instance update data
   * @returns Promise resolving to the updated instance
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the instance is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateResourceInstance): Promise<ResourceInstance> {
    return this.http.patch<UpdateResourceInstance, ResourceInstance>(
      `${this.resource_path}/${id}`,
      data,
      UpdateResourceInstanceSchema
    );
  }

  /**
   * Updates the operational status of a resource instance.
   *
   * @param id - Resource instance ID
   * @param status - New operational status
   * @returns Promise resolving to the updated instance
   *
   * @throws {@link WiilAPIError} - When the instance is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateStatus(id: string, status: string): Promise<ResourceInstance> {
    return this.http.patch<{ status: string }, ResourceInstance>(
      `${this.resource_path}/${id}/status`,
      { status }
    );
  }

  /**
   * Deletes a resource instance.
   *
   * @param id - Resource instance ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the instance is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists resource instances with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of instances
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ResourceInstance>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ResourceInstance>>(path);
  }

  /**
   * Creates multiple resource instances in a single batch request.
   *
   * @param data - Array of instance data (maximum 100 items)
   * @returns Promise resolving to paginated result of created instances
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateResourceInstance[]
  ): Promise<PaginatedResultType<ResourceInstance>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateResourceInstanceSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateResourceInstance[], PaginatedResultType<ResourceInstance>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
