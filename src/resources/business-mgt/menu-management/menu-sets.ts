/**
 * @fileoverview Menu Sets resource for managing bundled menu items.
 * @module resources/menu-sets
 */

import {
  MenuSet,
  CreateMenuSet,
  CreateMenuSetSchema,
  UpdateMenuSet,
  UpdateMenuSetSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing menu sets in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * menu sets. Menu sets represent bundled menu items such as combos, deals,
 * and meal sets. Supports explicit and selector-based targeting modes.
 * All methods require proper authentication via API key.
 */
export class MenuSetsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/menu-sets';

  /**
   * Creates a new MenuSetsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new menu set.
   *
   * @param data - Menu set data
   * @returns Promise resolving to the created menu set
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateMenuSet): Promise<MenuSet> {
    return this.http.post<CreateMenuSet, MenuSet>(
      this.resource_path,
      data,
      CreateMenuSetSchema
    );
  }

  /**
   * Retrieves a menu set by ID.
   *
   * @param id - Menu set ID
   * @returns Promise resolving to the menu set
   *
   * @throws {@link WiilAPIError} - When the set is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<MenuSet> {
    return this.http.get<MenuSet>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a menu set by code.
   *
   * @param code - Menu set internal code
   * @returns Promise resolving to the menu set or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByCode(code: string): Promise<MenuSet | null> {
    return this.http.get<MenuSet | null>(`${this.resource_path}/code/${encodeURIComponent(code)}`);
  }

  /**
   * Retrieves active menu sets with optional pagination.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active menu sets
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuSet>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuSet>>(path);
  }

  /**
   * Updates an existing menu set.
   *
   * @param id - Menu set ID
   * @param data - Menu set update data
   * @returns Promise resolving to the updated menu set
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the set is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateMenuSet): Promise<MenuSet> {
    return this.http.patch<UpdateMenuSet, MenuSet>(
      `${this.resource_path}/${id}`,
      data,
      UpdateMenuSetSchema
    );
  }

  /**
   * Deletes a menu set.
   *
   * @param id - Menu set ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the set is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists menu sets with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of menu sets
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuSet>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuSet>>(path);
  }

  /**
   * Creates multiple menu sets in a single batch request.
   *
   * @param data - Array of menu set data (maximum 50 items)
   * @returns Promise resolving to paginated result of created menu sets
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateMenuSet[]
  ): Promise<PaginatedResultType<MenuSet>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateMenuSetSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateMenuSet[], PaginatedResultType<MenuSet>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
