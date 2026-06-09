/**
 * @fileoverview Floor Plans resource for managing table layout canvases.
 * @module resources/reservation-mgt/floor-plans
 */

import {
  FloorPlan,
  CreateFloorPlan,
  CreateFloorPlanSchema,
  UpdateFloorPlan,
  UpdateFloorPlanSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';

/**
 * Resource class for managing floor plans in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing floor plans.
 * Floor plans represent table layout canvases for reservable business locations,
 * defining the coordinate space for section and table placement.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a floor plan
 * const floorPlan = await client.floorPlans.create({
 *   locationId: 'loc_123',
 *   name: 'Main Dining Room',
 *   description: 'Primary dining area with 20 tables',
 *   capacity: 80,
 *   canvasDimensions: { width: 1000, height: 800, unit: 'px' }
 * });
 * ```
 */
export class FloorPlansResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/floor-plans';

  /**
   * Creates a new FloorPlansResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new floor plan.
   *
   * @param data - Floor plan data
   * @returns Promise resolving to the created floor plan
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const floorPlan = await client.floorPlans.create({
   *   locationId: 'loc_123',
   *   name: 'Patio',
   *   description: 'Outdoor seating area',
   *   capacity: 40,
   *   canvasDimensions: { width: 800, height: 600, unit: 'px' },
   *   isActive: true
   * });
   * ```
   */
  public async create(data: CreateFloorPlan): Promise<FloorPlan> {
    return this.http.post<CreateFloorPlan, FloorPlan>(
      this.resource_path,
      data,
      CreateFloorPlanSchema
    );
  }

  /**
   * Retrieves a floor plan by ID.
   *
   * @param id - Floor plan ID
   * @returns Promise resolving to the floor plan
   *
   * @throws {@link WiilAPIError} - When the floor plan is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const floorPlan = await client.floorPlans.get('fp_123');
   * console.log('Floor plan:', floorPlan.name);
   * console.log('Capacity:', floorPlan.capacity);
   * ```
   */
  public async get(id: string): Promise<FloorPlan> {
    return this.http.get<FloorPlan>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves floor plans by location.
   *
   * @param locationId - Location ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of floor plans
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const floorPlans = await client.floorPlans.getByLocation('loc_123');
   * console.log(`Found ${floorPlans.meta.totalCount} floor plans`);
   * ```
   */
  public async getByLocation(
    locationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<FloorPlan>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-location/${locationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<FloorPlan>>(path);
  }

  /**
   * Retrieves active floor plans.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active floor plans
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeFloorPlans = await client.floorPlans.getActive();
   * console.log(`Found ${activeFloorPlans.meta.totalCount} active floor plans`);
   * ```
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<FloorPlan>> {
    const queryParams = new URLSearchParams();
    queryParams.append('isActive', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<FloorPlan>>(path);
  }

  /**
   * Updates an existing floor plan.
   *
   * @param data - Floor plan update data (must include id)
   * @returns Promise resolving to the updated floor plan
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the floor plan is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.floorPlans.update({
   *   id: 'fp_123',
   *   name: 'Main Dining - Updated',
   *   capacity: 100
   * });
   * ```
   */
  public async update(data: UpdateFloorPlan): Promise<FloorPlan> {
    return this.http.patch<UpdateFloorPlan, FloorPlan>(
      this.resource_path,
      data,
      UpdateFloorPlanSchema
    );
  }

  /**
   * Deletes a floor plan.
   *
   * @param id - Floor plan ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the floor plan is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.floorPlans.delete('fp_123');
   * if (deleted) {
   *   console.log('Floor plan deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists floor plans with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of floor plans
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.floorPlans.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} floor plans`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<FloorPlan>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<FloorPlan>>(path);
  }
}
