/**
 * @fileoverview Reservation Resources resource for managing reservation resources.
 * @module resources/reservation-resources
 */

import {
  Resource,
  CreateResource,
  CreateResourceSchema,
  UpdateResource,
  UpdateResourceSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing reservation resources in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * reservation resources. Reservation resources represent bookable items such as
 * tables, rooms, equipment, or staff that can be reserved by customers. Supports
 * filtering by resource type. All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new reservation resource
 * const resource = await client.reservationResources.create({
 *   name: 'Table 5',
 *   type: 'TABLE',
 *   capacity: 4,
 *   description: 'Window-side table for 4 guests'
 * });
 *
 * // Get a resource by ID
 * const resource = await client.reservationResources.get('resource_123');
 *
 * // Get resources by type
 * const tables = await client.reservationResources.getByType('TABLE', {
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Update a resource
 * const updated = await client.reservationResources.update({
 *   id: 'resource_123',
 *   capacity: 6,
 *   description: 'Expanded table for 6 guests'
 * });
 *
 * // List all resources
 * const resources = await client.reservationResources.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete a resource
 * const deleted = await client.reservationResources.delete('resource_123');
 * ```
 */
export class ReservationResourcesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/reservation-resources';

  /**
   * Creates a new ReservationResourcesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new reservation resource.
   *
   * @param data - Reservation resource data
   * @returns Promise resolving to the created reservation resource
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const resource = await client.reservationResources.create({
   *   name: 'Conference Room A',
   *   type: 'ROOM',
   *   capacity: 12,
   *   description: 'Large conference room with projector',
   *   metadata: {
   *     floor: '2',
   *     amenities: ['projector', 'whiteboard', 'video-conference']
   *   }
   * });
   * console.log('Created resource:', resource.id);
   * ```
   */
  public async create(data: CreateResource): Promise<Resource> {
    return this.http.post<CreateResource, Resource>(
      this.resource_path,
      data,
      CreateResourceSchema
    );
  }

  /**
   * Retrieves a reservation resource by ID.
   *
   * @param id - Reservation resource ID
   * @returns Promise resolving to the reservation resource
   *
   * @throws {@link WiilAPIError} - When the resource is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const resource = await client.reservationResources.get('resource_123');
   * console.log('Resource:', resource.name);
   * console.log('Type:', resource.type);
   * console.log('Capacity:', resource.capacity);
   * ```
   */
  public async get(id: string): Promise<Resource> {
    return this.http.get<Resource>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves reservation resources by type.
   *
   * @param type - Resource type (e.g., 'TABLE', 'ROOM', 'EQUIPMENT', 'STAFF')
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of resources
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const tables = await client.reservationResources.getByType('TABLE', {
   *   page: 1,
   *   pageSize: 50
   * });
   *
   * console.log(`Found ${tables.meta.totalCount} tables`);
   * tables.data.forEach(table => {
   *   console.log(`- ${table.name} (capacity: ${table.capacity})`);
   * });
   * ```
   */
  public async getByType(
    type: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Resource>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-type/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Resource>>(path);
  }

  /**
   * Updates an existing reservation resource.
   *
   * @param data - Reservation resource update data (must include id)
   * @returns Promise resolving to the updated reservation resource
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the resource is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.reservationResources.update({
   *   id: 'resource_123',
   *   name: 'Table 5 (Premium)',
   *   capacity: 6,
   *   metadata: {
   *     updatedBy: 'admin-user',
   *     isPremium: true
   *   }
   * });
   * console.log('Updated resource:', updated.name);
   * ```
   */
  public async update(data: UpdateResource): Promise<Resource> {
    return this.http.patch<UpdateResource, Resource>(
      this.resource_path,
      data,
      UpdateResourceSchema
    );
  }

  /**
   * Deletes a reservation resource.
   *
   * @param id - Reservation resource ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the resource is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting a resource. Existing reservations using this resource may be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.reservationResources.delete('resource_123');
   * if (deleted) {
   *   console.log('Resource deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists reservation resources with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of reservation resources
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.reservationResources.list();
   *
   * // List with custom pagination
   * const page2 = await client.reservationResources.list({
   *   page: 2,
   *   pageSize: 50
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} resources`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(resource => {
   *   console.log(`- ${resource.name} (${resource.type}): ${resource.capacity} capacity`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Resource>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Resource>>(path);
  }
}
