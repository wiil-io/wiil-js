/**
 * @fileoverview Maintenance Blocks resource for managing resource unavailability periods.
 * @module resources/reservation-mgt/maintenance-blocks
 */

import {
  MaintenanceBlock,
  CreateMaintenanceBlock,
  CreateMaintenanceBlockSchema,
  UpdateMaintenanceBlock,
  UpdateMaintenanceBlockSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing maintenance blocks in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing maintenance
 * blocks. Maintenance blocks represent time periods when a reservable resource
 * instance is unavailable for booking (e.g., cleaning, repairs, renovation).
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Block a room for maintenance
 * const block = await client.maintenanceBlocks.create({
 *   resourceInstanceId: 'ri_123',
 *   startDate: Date.now(),
 *   endDate: Date.now() + 86400000, // 24 hours
 *   reason: 'Deep cleaning'
 * });
 * ```
 */
export class MaintenanceBlocksResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/maintenance-blocks';

  /**
   * Creates a new MaintenanceBlocksResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new maintenance block.
   *
   * @param data - Maintenance block data
   * @returns Promise resolving to the created maintenance block
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const block = await client.maintenanceBlocks.create({
   *   locationId: 'loc_123',
   *   resourceInstanceId: 'ri_456',
   *   startDate: Date.now(),
   *   endDate: Date.now() + 172800000, // 48 hours
   *   reason: 'HVAC repair'
   * });
   * ```
   */
  public async create(data: CreateMaintenanceBlock): Promise<MaintenanceBlock> {
    return this.http.post<CreateMaintenanceBlock, MaintenanceBlock>(
      this.resource_path,
      data,
      CreateMaintenanceBlockSchema
    );
  }

  /**
   * Retrieves a maintenance block by ID.
   *
   * @param id - Maintenance block ID
   * @returns Promise resolving to the maintenance block
   *
   * @throws {@link WiilAPIError} - When the block is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const block = await client.maintenanceBlocks.get('mb_123');
   * console.log('Reason:', block.reason);
   * ```
   */
  public async get(id: string): Promise<MaintenanceBlock> {
    return this.http.get<MaintenanceBlock>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves maintenance blocks by resource instance.
   *
   * @param resourceInstanceId - Resource instance ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of maintenance blocks
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const blocks = await client.maintenanceBlocks.getByResourceInstance('ri_123');
   * console.log(`Found ${blocks.meta.totalCount} maintenance blocks`);
   * ```
   */
  public async getByResourceInstance(
    resourceInstanceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MaintenanceBlock>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-resource-instance/${resourceInstanceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MaintenanceBlock>>(path);
  }

  /**
   * Retrieves maintenance blocks by location.
   *
   * @param locationId - Location ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of maintenance blocks
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const blocks = await client.maintenanceBlocks.getByLocation('loc_123');
   * console.log(`Found ${blocks.meta.totalCount} maintenance blocks`);
   * ```
   */
  public async getByLocation(
    locationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MaintenanceBlock>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-location/${locationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MaintenanceBlock>>(path);
  }

  /**
   * Retrieves maintenance blocks within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of maintenance blocks
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
   * const blocks = await client.maintenanceBlocks.getByDateRange(Date.now(), nextWeek);
   * console.log(`Found ${blocks.meta.totalCount} scheduled maintenance blocks`);
   * ```
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MaintenanceBlock>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<MaintenanceBlock>>(path);
  }

  /**
   * Updates an existing maintenance block.
   *
   * @param data - Maintenance block update data (must include id)
   * @returns Promise resolving to the updated maintenance block
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the block is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.maintenanceBlocks.update({
   *   id: 'mb_123',
   *   endDate: Date.now() + 259200000, // Extend to 72 hours
   *   reason: 'Extended maintenance - parts delayed'
   * });
   * ```
   */
  public async update(data: UpdateMaintenanceBlock): Promise<MaintenanceBlock> {
    return this.http.patch<UpdateMaintenanceBlock, MaintenanceBlock>(
      this.resource_path,
      data,
      UpdateMaintenanceBlockSchema
    );
  }

  /**
   * Deletes a maintenance block.
   *
   * @param id - Maintenance block ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the block is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.maintenanceBlocks.delete('mb_123');
   * if (deleted) {
   *   console.log('Maintenance block deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists maintenance blocks with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of maintenance blocks
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.maintenanceBlocks.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} maintenance blocks`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MaintenanceBlock>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MaintenanceBlock>>(path);
  }

  /**
   * Creates multiple maintenance blocks in a single batch request.
   *
   * @param data - Array of maintenance block data (maximum 50 items)
   * @returns Promise resolving to paginated result of created maintenance blocks
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const blocks = await client.maintenanceBlocks.createBatch([
   *   { resourceInstanceId: 'ri_1', startDate: start1, endDate: end1, reason: 'Cleaning' },
   *   { resourceInstanceId: 'ri_2', startDate: start2, endDate: end2, reason: 'Repairs' }
   * ]);
   * console.log(`Created ${blocks.data.length} maintenance blocks`);
   * ```
   */
  public async createBatch(
    data: CreateMaintenanceBlock[]
  ): Promise<PaginatedResultType<MaintenanceBlock>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateMaintenanceBlockSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateMaintenanceBlock[], PaginatedResultType<MaintenanceBlock>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
