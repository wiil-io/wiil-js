/**
 * @fileoverview Business Locations resource for managing business location configurations.
 * @module resources/business-locations
 */

import {
  BusinessLocation,
  CreateBusinessLocation,
  CreateBusinessLocationSchema,
  UpdateBusinessLocation,
  UpdateBusinessLocationSchema,
  BusinessLocationStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Filters for querying business locations.
 */
export interface BusinessLocationFilters {
  /** Filter by status */
  status?: BusinessLocationStatus;
  /** Filter by primary location */
  isPrimary?: boolean;
  /** Text search across name */
  search?: string;
}

/**
 * Resource class for managing business locations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * business locations. Business locations represent physical or operational sites
 * belonging to an organization (e.g., stores, branches, offices). All methods
 * require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new business location
 * const location = await client.businessLocations.create({
 *   name: 'Downtown Branch',
 *   timezone: 'America/New_York',
 *   businessHours: {
 *     monday: { open: '09:00', close: '17:00' },
 *     // ... other days
 *   }
 * });
 *
 * // Get a business location by ID
 * const location = await client.businessLocations.get('location_123');
 *
 * // Update a business location
 * const updated = await client.businessLocations.update({
 *   id: 'location_123',
 *   name: 'Downtown Branch - Main',
 *   status: BusinessLocationStatus.ACTIVE
 * });
 *
 * // List all business locations
 * const locations = await client.businessLocations.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete a business location
 * const deleted = await client.businessLocations.delete('location_123');
 * ```
 */
export class BusinessLocationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/business-locations';

  /**
   * Creates a new BusinessLocationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new business location.
   *
   * @param data - Business location data
   * @returns Promise resolving to the created business location
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const location = await client.businessLocations.create({
   *   name: 'Westside Store',
   *   timezone: 'America/Los_Angeles',
   *   isPrimary: false,
   *   businessHours: {
   *     monday: { open: '10:00', close: '20:00' },
   *     tuesday: { open: '10:00', close: '20:00' },
   *     // ... other days
   *   },
   *   address: {
   *     street: '123 Main St',
   *     city: 'Los Angeles',
   *     state: 'CA',
   *     postalCode: '90001',
   *     country: 'US'
   *   }
   * });
   * console.log('Created location:', location.id);
   * ```
   */
  public async create(data: CreateBusinessLocation): Promise<BusinessLocation> {
    return this.http.post<CreateBusinessLocation, BusinessLocation>(
      this.resource_path,
      data,
      CreateBusinessLocationSchema
    );
  }

  /**
   * Retrieves a business location by ID.
   *
   * @param id - Business location ID
   * @returns Promise resolving to the business location
   *
   * @throws {@link WiilAPIError} - When the location is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const location = await client.businessLocations.get('location_123');
   * console.log('Location:', location.name);
   * console.log('Status:', location.status);
   * console.log('Primary:', location.isPrimary);
   * ```
   */
  public async get(id: string): Promise<BusinessLocation> {
    return this.http.get<BusinessLocation>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a business location by code.
   *
   * @param code - Business location code
   * @returns Promise resolving to the business location or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const location = await client.businessLocations.getByCode('DOWNTOWN-001');
   * if (location) {
   *   console.log('Found location:', location.name);
   * }
   * ```
   */
  public async getByCode(code: string): Promise<BusinessLocation | null> {
    return this.http.get<BusinessLocation | null>(`${this.resource_path}/code/${code}`);
  }

  /**
   * Updates an existing business location.
   *
   * @param data - Business location update data (must include id)
   * @returns Promise resolving to the updated business location
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the location is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.businessLocations.update({
   *   id: 'location_123',
   *   name: 'Downtown Branch - Renovated',
   *   phoneNumber: '+1-555-123-4567',
   *   status: BusinessLocationStatus.ACTIVE
   * });
   * console.log('Updated location:', updated.name);
   * ```
   */
  public async update(data: UpdateBusinessLocation): Promise<BusinessLocation> {
    return this.http.patch<UpdateBusinessLocation, BusinessLocation>(
      `${this.resource_path}/${data.id}`,
      data,
      UpdateBusinessLocationSchema
    );
  }

  /**
   * Deletes a business location.
   *
   * @param id - Business location ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the location is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting a business location. Associated resources may be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.businessLocations.delete('location_123');
   * if (deleted) {
   *   console.log('Location deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists business locations with optional pagination and filters.
   *
   * @param params - Pagination parameters
   * @param filters - Optional filters
   * @returns Promise resolving to paginated list of business locations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.businessLocations.list();
   *
   * // List with custom pagination and filters
   * const activeLocations = await client.businessLocations.list(
   *   { page: 1, pageSize: 50 },
   *   { status: BusinessLocationStatus.ACTIVE }
   * );
   *
   * console.log(`Found ${activeLocations.meta.totalCount} active locations`);
   * activeLocations.data.forEach(location => {
   *   console.log(`- ${location.name} (${location.code})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>,
    filters?: BusinessLocationFilters
  ): Promise<PaginatedResultType<BusinessLocation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.isPrimary !== undefined) queryParams.append('isPrimary', filters.isPrimary.toString());
    if (filters?.search) queryParams.append('search', filters.search);

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessLocation>>(path);
  }

  /**
   * Gets active business locations.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active business locations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeLocations = await client.businessLocations.getActive();
   * activeLocations.data.forEach(location => {
   *   console.log(`- ${location.name}`);
   * });
   * ```
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessLocation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessLocation>>(path);
  }

  /**
   * Gets the primary business location for the organization.
   *
   * @returns Promise resolving to the primary business location or null
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const primary = await client.businessLocations.getPrimary();
   * if (primary) {
   *   console.log('Primary location:', primary.name);
   * }
   * ```
   */
  public async getPrimary(): Promise<BusinessLocation | null> {
    return this.http.get<BusinessLocation | null>(`${this.resource_path}/primary`);
  }

  /**
   * Creates multiple business locations in a single batch request.
   *
   * @param data - Array of business location data (maximum 50 items)
   * @returns Promise resolving to paginated result of created business locations
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const locations = await client.businessLocations.createBatch([
   *   { name: 'North Store', timezone: 'America/Chicago', businessHours: {...} },
   *   { name: 'South Store', timezone: 'America/Chicago', businessHours: {...} }
   * ]);
   * console.log(`Created ${locations.data.length} locations`);
   * ```
   */
  public async createBatch(
    data: CreateBusinessLocation[]
  ): Promise<PaginatedResultType<BusinessLocation>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateBusinessLocationSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateBusinessLocation[], PaginatedResultType<BusinessLocation>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
