/**
 * @fileoverview Service Providers resource for managing service-to-provider assignments.
 * @module resources/service-providers
 */

import {
  ServiceProvider,
  CreateServiceProvider,
  CreateServiceProviderSchema,
  UpdateServiceProvider,
  UpdateServiceProviderSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 100;

/**
 * Resource class for managing service provider assignments in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * service provider assignments. This is a join table that links services to
 * providers (ServicePerson) with optional price and duration overrides.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Assign a provider to a service
 * const assignment = await client.serviceProviders.create({
 *   serviceId: 'svc_123',
 *   providerId: 'person_456',
 *   priceOverride: 75.00,
 *   active: true
 * });
 *
 * // Get assignments for a service
 * const providers = await client.serviceProviders.getByService('svc_123');
 *
 * // Get assignments for a provider
 * const services = await client.serviceProviders.getByProvider('person_456');
 * ```
 */
export class ServiceProvidersResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/service-providers';

  /**
   * Creates a new ServiceProvidersResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new service provider assignment.
   *
   * @param data - Service provider assignment data
   * @returns Promise resolving to the created assignment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignment = await client.serviceProviders.create({
   *   serviceId: 'svc_123',
   *   providerId: 'person_456',
   *   priceOverride: 80.00,
   *   durationOverride: 45,
   *   active: true
   * });
   * console.log('Created assignment:', assignment.id);
   * ```
   */
  public async create(data: CreateServiceProvider): Promise<ServiceProvider> {
    return this.http.post<CreateServiceProvider, ServiceProvider>(
      this.resource_path,
      data,
      CreateServiceProviderSchema
    );
  }

  /**
   * Retrieves a service provider assignment by ID.
   *
   * @param id - Service provider assignment ID
   * @returns Promise resolving to the assignment
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignment = await client.serviceProviders.get('sp_123');
   * console.log('Service:', assignment.serviceId);
   * console.log('Provider:', assignment.providerId);
   * ```
   */
  public async get(id: string): Promise<ServiceProvider> {
    return this.http.get<ServiceProvider>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves service provider assignments by service.
   *
   * @param serviceId - Service ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const providers = await client.serviceProviders.getByService('svc_123');
   * console.log(`Found ${providers.meta.totalCount} providers for service`);
   * ```
   */
  public async getByService(
    serviceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceProvider>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-service/${serviceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceProvider>>(path);
  }

  /**
   * Retrieves service provider assignments by provider.
   *
   * @param providerId - Provider ID (ServicePerson ID)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const services = await client.serviceProviders.getByProvider('person_456');
   * console.log(`Provider is assigned to ${services.meta.totalCount} services`);
   * ```
   */
  public async getByProvider(
    providerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceProvider>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-provider/${providerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceProvider>>(path);
  }

  /**
   * Updates an existing service provider assignment.
   *
   * @param data - Service provider update data (must include id)
   * @returns Promise resolving to the updated assignment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.serviceProviders.update({
   *   id: 'sp_123',
   *   priceOverride: 90.00,
   *   active: false
   * });
   * console.log('Updated assignment:', updated.id);
   * ```
   */
  public async update(data: UpdateServiceProvider): Promise<ServiceProvider> {
    return this.http.patch<UpdateServiceProvider, ServiceProvider>(
      this.resource_path,
      data,
      UpdateServiceProviderSchema
    );
  }

  /**
   * Deletes a service provider assignment.
   *
   * @param id - Service provider assignment ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This removes the assignment between a service and provider.
   * The service and provider records themselves are not affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.serviceProviders.delete('sp_123');
   * if (deleted) {
   *   console.log('Assignment deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists service provider assignments with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.serviceProviders.list({ page: 1, pageSize: 50 });
   * console.log(`Found ${result.meta.totalCount} assignments`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceProvider>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceProvider>>(path);
  }

  /**
   * Creates multiple service provider assignments in a single batch request.
   *
   * @param data - Array of assignment data (maximum 100 items)
   * @returns Promise resolving to paginated result of created assignments
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignments = await client.serviceProviders.createBatch([
   *   { serviceId: 'svc_123', providerId: 'person_1', active: true },
   *   { serviceId: 'svc_123', providerId: 'person_2', active: true },
   *   { serviceId: 'svc_456', providerId: 'person_1', active: true }
   * ]);
   * console.log(`Created ${assignments.data.length} assignments`);
   * ```
   */
  public async createBatch(
    data: CreateServiceProvider[]
  ): Promise<PaginatedResultType<ServiceProvider>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateServiceProviderSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateServiceProvider[], PaginatedResultType<ServiceProvider>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
