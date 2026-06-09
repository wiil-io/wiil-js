/**
 * @fileoverview Resource Categories resource for managing reservation resource groupings.
 * @module resources/resource-categories
 */

import {
  ResourceCategory,
  CreateResourceCategory,
  CreateResourceCategorySchema,
  UpdateResourceCategory,
  UpdateResourceCategorySchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../../client/HttpClient';
import { WiilValidationError } from '../../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing resource categories in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * resource categories. Resource categories group reservation resources by type,
 * location, and display order for organized resource management.
 * All methods require proper authentication via API key.
 */
export class ResourceCategoriesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/resource-categories';

  /**
   * Creates a new ResourceCategoriesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new resource category.
   *
   * @param data - Resource category data
   * @returns Promise resolving to the created category
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateResourceCategory): Promise<ResourceCategory> {
    return this.http.post<CreateResourceCategory, ResourceCategory>(
      this.resource_path,
      data,
      CreateResourceCategorySchema
    );
  }

  /**
   * Retrieves a resource category by ID.
   *
   * @param id - Resource category ID
   * @returns Promise resolving to the category
   *
   * @throws {@link WiilAPIError} - When the category is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ResourceCategory> {
    return this.http.get<ResourceCategory>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves resource categories by resource type.
   *
   * @param resourceType - Resource type filter
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of categories
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByResourceType(
    resourceType: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ResourceCategory>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-type/${resourceType}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ResourceCategory>>(path);
  }

  /**
   * Retrieves active resource categories.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active categories
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ResourceCategory>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ResourceCategory>>(path);
  }

  /**
   * Updates an existing resource category.
   *
   * @param id - Resource category ID
   * @param data - Category update data
   * @returns Promise resolving to the updated category
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the category is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateResourceCategory): Promise<ResourceCategory> {
    return this.http.patch<UpdateResourceCategory, ResourceCategory>(
      `${this.resource_path}/${id}`,
      data,
      UpdateResourceCategorySchema
    );
  }

  /**
   * Deletes a resource category.
   *
   * @param id - Resource category ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the category is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists resource categories with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of categories
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ResourceCategory>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ResourceCategory>>(path);
  }

  /**
   * Creates multiple resource categories in a single batch request.
   *
   * @param data - Array of category data (maximum 50 items)
   * @returns Promise resolving to paginated result of created categories
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateResourceCategory[]
  ): Promise<PaginatedResultType<ResourceCategory>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateResourceCategorySchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateResourceCategory[], PaginatedResultType<ResourceCategory>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
