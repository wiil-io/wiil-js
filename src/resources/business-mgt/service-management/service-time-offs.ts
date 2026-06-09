/**
 * @fileoverview Service Time Offs resource for managing provider unavailability periods.
 * @module resources/service-time-offs
 */

import {
  ServiceProviderTimeOff,
  CreateServiceProviderTimeOff,
  CreateServiceProviderTimeOffSchema,
  UpdateServiceProviderTimeOff,
  UpdateServiceProviderTimeOffSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing service provider time off in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * time off records. Time off records represent periods when providers are
 * unavailable for appointments (vacation, sick leave, recurring breaks, etc.).
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a vacation time off
 * const timeOff = await client.serviceTimeOffs.create({
 *   providerId: 'person_123',
 *   type: 'SPECIFIC',
 *   startDate: Date.now(),
 *   endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
 *   reason: 'Annual vacation'
 * });
 *
 * // Get time offs for a provider
 * const timeOffs = await client.serviceTimeOffs.getByProvider('person_123');
 *
 * // List all time offs
 * const allTimeOffs = await client.serviceTimeOffs.list({ page: 1, pageSize: 20 });
 * ```
 */
export class ServiceTimeOffsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/service-time-offs';

  /**
   * Creates a new ServiceTimeOffsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new service provider time off record.
   *
   * @param data - Time off data
   * @returns Promise resolving to the created time off record
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // Create a specific (one-time) time off
   * const vacation = await client.serviceTimeOffs.create({
   *   providerId: 'person_123',
   *   type: 'SPECIFIC',
   *   startDate: 1700000000000,
   *   endDate: 1700604800000,
   *   reason: 'Family vacation'
   * });
   *
   * // Create a recurring time off (weekly lunch break)
   * const lunchBreak = await client.serviceTimeOffs.create({
   *   providerId: 'person_123',
   *   type: 'RECURRING',
   *   startDate: 1700000000000,
   *   endDate: 1700003600000,
   *   recurrence: { dayOfWeek: ['1', '2', '3', '4', '5'] },
   *   reason: 'Daily lunch break'
   * });
   * ```
   */
  public async create(data: CreateServiceProviderTimeOff): Promise<ServiceProviderTimeOff> {
    return this.http.post<CreateServiceProviderTimeOff, ServiceProviderTimeOff>(
      this.resource_path,
      data,
      CreateServiceProviderTimeOffSchema
    );
  }

  /**
   * Retrieves a service provider time off record by ID.
   *
   * @param id - Time off record ID
   * @returns Promise resolving to the time off record
   *
   * @throws {@link WiilAPIError} - When the record is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const timeOff = await client.serviceTimeOffs.get('to_123');
   * console.log('Provider:', timeOff.providerId);
   * console.log('Reason:', timeOff.reason);
   * console.log('Status:', timeOff.status);
   * ```
   */
  public async get(id: string): Promise<ServiceProviderTimeOff> {
    return this.http.get<ServiceProviderTimeOff>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves time off records for a specific provider.
   *
   * @param providerId - Provider ID (ServicePerson ID)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of time off records
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const timeOffs = await client.serviceTimeOffs.getByProvider('person_123');
   * console.log(`Found ${timeOffs.meta.totalCount} time off records`);
   * timeOffs.data.forEach(to => {
   *   console.log(`- ${to.reason}: ${new Date(to.startDate)} to ${new Date(to.endDate)}`);
   * });
   * ```
   */
  public async getByProvider(
    providerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceProviderTimeOff>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-provider/${providerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceProviderTimeOff>>(path);
  }

  /**
   * Retrieves time off records within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of time off records
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
   * const timeOffs = await client.serviceTimeOffs.getByDateRange(Date.now(), nextWeek);
   * console.log(`Found ${timeOffs.meta.totalCount} upcoming time off records`);
   * ```
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceProviderTimeOff>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<ServiceProviderTimeOff>>(path);
  }

  /**
   * Updates an existing service provider time off record.
   *
   * @param data - Time off update data (must include id)
   * @returns Promise resolving to the updated time off record
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the record is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.serviceTimeOffs.update({
   *   id: 'to_123',
   *   endDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // Extend to 2 weeks
   *   reason: 'Extended vacation'
   * });
   * console.log('Updated time off:', updated.id);
   * ```
   */
  public async update(data: UpdateServiceProviderTimeOff): Promise<ServiceProviderTimeOff> {
    return this.http.patch<UpdateServiceProviderTimeOff, ServiceProviderTimeOff>(
      this.resource_path,
      data,
      UpdateServiceProviderTimeOffSchema
    );
  }

  /**
   * Approves a pending time off request.
   *
   * @param id - Time off record ID
   * @returns Promise resolving to the approved time off record
   *
   * @throws {@link WiilAPIError} - When the record is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const approved = await client.serviceTimeOffs.approve('to_123');
   * console.log('Approved time off for:', approved.providerId);
   * ```
   */
  public async approve(id: string): Promise<ServiceProviderTimeOff> {
    return this.http.post<Record<string, never>, ServiceProviderTimeOff>(
      `${this.resource_path}/${id}/approve`,
      {}
    );
  }

  /**
   * Rejects a pending time off request.
   *
   * @param id - Time off record ID
   * @param reason - Optional rejection reason
   * @returns Promise resolving to the rejected time off record
   *
   * @throws {@link WiilAPIError} - When the record is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rejected = await client.serviceTimeOffs.reject('to_123', 'Schedule conflict');
   * console.log('Rejected time off:', rejected.id);
   * ```
   */
  public async reject(id: string, reason?: string): Promise<ServiceProviderTimeOff> {
    return this.http.post<{ reason?: string }, ServiceProviderTimeOff>(
      `${this.resource_path}/${id}/reject`,
      { reason }
    );
  }

  /**
   * Deletes a service provider time off record.
   *
   * @param id - Time off record ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the record is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. The provider will become available
   * for the previously blocked time period.
   *
   * @example
   * ```typescript
   * const deleted = await client.serviceTimeOffs.delete('to_123');
   * if (deleted) {
   *   console.log('Time off record deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists service provider time off records with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of time off records
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.serviceTimeOffs.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} time off records`);
   * result.data.forEach(timeOff => {
   *   console.log(`- ${timeOff.providerId}: ${timeOff.reason}`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceProviderTimeOff>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceProviderTimeOff>>(path);
  }

  /**
   * Creates multiple time off records in a single batch request.
   *
   * @param data - Array of time off data (maximum 50 items)
   * @returns Promise resolving to paginated result of created time off records
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const timeOffs = await client.serviceTimeOffs.createBatch([
   *   { providerId: 'person_1', type: 'SPECIFIC', startDate: now, endDate: nextWeek },
   *   { providerId: 'person_2', type: 'SPECIFIC', startDate: now, endDate: nextWeek }
   * ]);
   * console.log(`Created ${timeOffs.data.length} time off records`);
   * ```
   */
  public async createBatch(
    data: CreateServiceProviderTimeOff[]
  ): Promise<PaginatedResultType<ServiceProviderTimeOff>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateServiceProviderTimeOffSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateServiceProviderTimeOff[], PaginatedResultType<ServiceProviderTimeOff>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
