/**
 * @fileoverview Service Persons resource for managing service providers/staff.
 * @module resources/service-persons
 */

import {
  ServicePerson,
  CreateServicePerson,
  CreateServicePersonSchema,
  UpdateServicePerson,
  UpdateServicePersonSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing service persons (staff/providers) in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * service persons. Service persons represent staff members who can be assigned
 * to perform services (e.g., stylists, therapists, consultants).
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new service person
 * const person = await client.servicePersons.create({
 *   name: 'Jane Smith',
 *   description: 'Senior Hair Stylist',
 *   bookableOnline: true,
 *   bookableByStaff: true
 * });
 *
 * // Get a service person by ID
 * const person = await client.servicePersons.get('person_123');
 *
 * // Update a service person
 * const updated = await client.servicePersons.update({
 *   id: 'person_123',
 *   commissionPercent: 40
 * });
 *
 * // List all service persons
 * const persons = await client.servicePersons.list({ page: 1, pageSize: 20 });
 * ```
 */
export class ServicePersonsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/service-persons';

  /**
   * Creates a new ServicePersonsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new service person.
   *
   * @param data - Service person data
   * @returns Promise resolving to the created service person
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const person = await client.servicePersons.create({
   *   name: 'John Doe',
   *   description: 'Massage Therapist',
   *   locationId: 'loc_123',
   *   skills: ['massage', 'aromatherapy'],
   *   commissionPercent: 35,
   *   bookableOnline: true,
   *   bookableByStaff: true,
   *   isActive: true
   * });
   * console.log('Created person:', person.id);
   * ```
   */
  public async create(data: CreateServicePerson): Promise<ServicePerson> {
    return this.http.post<CreateServicePerson, ServicePerson>(
      this.resource_path,
      data,
      CreateServicePersonSchema
    );
  }

  /**
   * Retrieves a service person by ID.
   *
   * @param id - Service person ID
   * @returns Promise resolving to the service person
   *
   * @throws {@link WiilAPIError} - When the person is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const person = await client.servicePersons.get('person_123');
   * console.log('Person:', person.name);
   * console.log('Commission:', person.commissionPercent, '%');
   * ```
   */
  public async get(id: string): Promise<ServicePerson> {
    return this.http.get<ServicePerson>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves service persons by location.
   *
   * @param locationId - Location ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of service persons
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const persons = await client.servicePersons.getByLocation('loc_123');
   * console.log(`Found ${persons.meta.totalCount} staff at location`);
   * ```
   */
  public async getByLocation(
    locationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServicePerson>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-location/${locationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServicePerson>>(path);
  }

  /**
   * Updates an existing service person.
   *
   * @param data - Service person update data (must include id)
   * @returns Promise resolving to the updated service person
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the person is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.servicePersons.update({
   *   id: 'person_123',
   *   commissionPercent: 45,
   *   bookableOnline: false
   * });
   * console.log('Updated person:', updated.name);
   * ```
   */
  public async update(data: UpdateServicePerson): Promise<ServicePerson> {
    return this.http.patch<UpdateServicePerson, ServicePerson>(
      this.resource_path,
      data,
      UpdateServicePersonSchema
    );
  }

  /**
   * Deletes a service person.
   *
   * @param id - Service person ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the person is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Existing appointments may be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.servicePersons.delete('person_123');
   * if (deleted) {
   *   console.log('Person deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists service persons with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of service persons
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.servicePersons.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} service persons`);
   * result.data.forEach(person => {
   *   console.log(`- ${person.name} (${person.isActive ? 'Active' : 'Inactive'})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServicePerson>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServicePerson>>(path);
  }

  /**
   * Creates multiple service persons in a single batch request.
   *
   * @param data - Array of service person data (maximum 50 items)
   * @returns Promise resolving to paginated result of created service persons
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const persons = await client.servicePersons.createBatch([
   *   { name: 'Jane Smith', bookableOnline: true, bookableByStaff: true },
   *   { name: 'John Doe', bookableOnline: true, bookableByStaff: true }
   * ]);
   * console.log(`Created ${persons.data.length} service persons`);
   * ```
   */
  public async createBatch(
    data: CreateServicePerson[]
  ): Promise<PaginatedResultType<ServicePerson>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateServicePersonSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateServicePerson[], PaginatedResultType<ServicePerson>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
