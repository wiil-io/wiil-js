/**
 * @fileoverview Floor Plan Sections resource for managing seating sections and table placements.
 * @module resources/reservation-mgt/floor-plan-sections
 */

import {
  Section,
  CreateSection,
  CreateSectionSchema,
  UpdateSection,
  UpdateSectionSchema,
  TablePlacement,
  CreateTablePlacement,
  CreateTablePlacementSchema,
  UpdateTablePlacement,
  UpdateTablePlacementSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';

/**
 * Resource class for managing floor plan sections in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing floor plan
 * sections and their table placements. Sections represent named seating areas
 * within a floor plan, containing table positions and capacity information.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a floor plan section
 * const section = await client.floorPlanSections.create({
 *   locationId: 'loc_123',
 *   floorPlanId: 'fp_123',
 *   name: 'Window Section',
 *   capacity: 24,
 *   color: '#3B82F6',
 *   isActive: true
 * });
 * ```
 */
export class FloorPlanSectionsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/floor-plan-sections';

  /**
   * Creates a new FloorPlanSectionsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new floor plan section.
   *
   * @param data - Section data
   * @returns Promise resolving to the created section
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const section = await client.floorPlanSections.create({
   *   locationId: 'loc_123',
   *   floorPlanId: 'fp_123',
   *   name: 'Bar Area',
   *   capacity: 16,
   *   color: '#EF4444',
   *   sortOrder: 2
   * });
   * ```
   */
  public async create(data: CreateSection): Promise<Section> {
    return this.http.post<CreateSection, Section>(
      this.resource_path,
      data,
      CreateSectionSchema
    );
  }

  /**
   * Retrieves a section by ID.
   *
   * @param id - Section ID
   * @returns Promise resolving to the section with table placements
   *
   * @throws {@link WiilAPIError} - When the section is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const section = await client.floorPlanSections.get('sec_123');
   * console.log('Section:', section.name);
   * console.log('Tables:', section.tables.length);
   * ```
   */
  public async get(id: string): Promise<Section> {
    return this.http.get<Section>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves sections by floor plan.
   *
   * @param floorPlanId - Floor plan ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of sections
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const sections = await client.floorPlanSections.getByFloorPlan('fp_123');
   * console.log(`Found ${sections.meta.totalCount} sections`);
   * ```
   */
  public async getByFloorPlan(
    floorPlanId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Section>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-floor-plan/${floorPlanId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Section>>(path);
  }

  /**
   * Retrieves sections by location.
   *
   * @param locationId - Location ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of sections
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const sections = await client.floorPlanSections.getByLocation('loc_123');
   * console.log(`Found ${sections.meta.totalCount} sections`);
   * ```
   */
  public async getByLocation(
    locationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Section>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-location/${locationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Section>>(path);
  }

  /**
   * Updates an existing section.
   *
   * @param data - Section update data (must include id)
   * @returns Promise resolving to the updated section
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the section is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.floorPlanSections.update({
   *   id: 'sec_123',
   *   name: 'VIP Section',
   *   capacity: 12
   * });
   * ```
   */
  public async update(data: UpdateSection): Promise<Section> {
    return this.http.patch<UpdateSection, Section>(
      `${this.resource_path}/${data.id}`,
      data,
      UpdateSectionSchema
    );
  }

  /**
   * Deletes a section.
   *
   * @param id - Section ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the section is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.floorPlanSections.delete('sec_123');
   * if (deleted) {
   *   console.log('Section deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists sections with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of sections
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.floorPlanSections.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} sections`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Section>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Section>>(path);
  }

  // ============================================================
  // Table Placement Methods
  // ============================================================

  /**
   * Adds a table placement to a section.
   *
   * @param sectionId - Section ID
   * @param data - Table placement data
   * @returns Promise resolving to the created table placement
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const placement = await client.floorPlanSections.addTablePlacement('sec_123', {
   *   tableResourceId: 'res_456',
   *   floorPlanSectionId: 'sec_123',
   *   number: 'T1',
   *   x: 100,
   *   y: 200,
   *   width: 80,
   *   height: 80,
   *   shape: 'round',
   *   minParty: 2,
   *   maxParty: 4
   * });
   * ```
   */
  public async addTablePlacement(
    sectionId: string,
    data: CreateTablePlacement
  ): Promise<TablePlacement> {
    return this.http.post<CreateTablePlacement, TablePlacement>(
      `${this.resource_path}/${sectionId}/tables`,
      data,
      CreateTablePlacementSchema
    );
  }

  /**
   * Retrieves a table placement by ID.
   *
   * @param sectionId - Section ID
   * @param placementId - Table placement ID
   * @returns Promise resolving to the table placement
   *
   * @throws {@link WiilAPIError} - When the placement is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const placement = await client.floorPlanSections.getTablePlacement('sec_123', 'tp_456');
   * console.log('Table:', placement.number);
   * ```
   */
  public async getTablePlacement(
    sectionId: string,
    placementId: string
  ): Promise<TablePlacement> {
    return this.http.get<TablePlacement>(
      `${this.resource_path}/${sectionId}/tables/${placementId}`
    );
  }

  /**
   * Updates a table placement.
   *
   * @param sectionId - Section ID
   * @param data - Table placement update data (must include id)
   * @returns Promise resolving to the updated table placement
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the placement is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.floorPlanSections.updateTablePlacement('sec_123', {
   *   id: 'tp_456',
   *   x: 150,
   *   y: 250,
   *   maxParty: 6
   * });
   * ```
   */
  public async updateTablePlacement(
    sectionId: string,
    data: UpdateTablePlacement
  ): Promise<TablePlacement> {
    return this.http.patch<UpdateTablePlacement, TablePlacement>(
      `${this.resource_path}/${sectionId}/tables`,
      data,
      UpdateTablePlacementSchema
    );
  }

  /**
   * Removes a table placement from a section.
   *
   * @param sectionId - Section ID
   * @param placementId - Table placement ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the placement is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const removed = await client.floorPlanSections.removeTablePlacement('sec_123', 'tp_456');
   * if (removed) {
   *   console.log('Table placement removed');
   * }
   * ```
   */
  public async removeTablePlacement(
    sectionId: string,
    placementId: string
  ): Promise<boolean> {
    return this.http.delete<boolean>(
      `${this.resource_path}/${sectionId}/tables/${placementId}`
    );
  }
}
