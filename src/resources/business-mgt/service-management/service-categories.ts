/**
 * @fileoverview Service Categories resource for managing service category groupings.
 * @module resources/service-categories
 */

import {
  ServiceCategory,
  CreateServiceCategory,
  CreateServiceCategorySchema,
  UpdateServiceCategory,
  UpdateServiceCategorySchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing service categories in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * service categories. Service categories group related services for organization
 * and display (e.g., Hair Services, Spa Treatments, Consultations).
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new service category
 * const category = await client.serviceCategories.create({
 *   organizationId: 'org_123',
 *   name: 'Hair Services',
 *   description: 'All haircut and styling services'
 * });
 *
 * // Get a service category by ID
 * const category = await client.serviceCategories.get('cat_123');
 *
 * // Update a service category
 * const updated = await client.serviceCategories.update({
 *   id: 'cat_123',
 *   name: 'Premium Hair Services'
 * });
 *
 * // List all service categories
 * const categories = await client.serviceCategories.list({ page: 1, pageSize: 20 });
 * ```
 */
export class ServiceCategoriesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/service-categories';

  /**
   * Creates a new ServiceCategoriesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new service category.
   *
   * @param data - Service category data
   * @returns Promise resolving to the created service category
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const category = await client.serviceCategories.create({
   *   organizationId: 'org_123',
   *   name: 'Spa Treatments',
   *   description: 'Relaxation and wellness services',
   *   displayOrder: 2,
   *   isActive: true
   * });
   * console.log('Created category:', category.id);
   * ```
   */
  public async create(data: CreateServiceCategory): Promise<ServiceCategory> {
    return this.http.post<CreateServiceCategory, ServiceCategory>(
      this.resource_path,
      data,
      CreateServiceCategorySchema
    );
  }

  /**
   * Retrieves a service category by ID.
   *
   * @param id - Service category ID
   * @returns Promise resolving to the service category
   *
   * @throws {@link WiilAPIError} - When the category is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const category = await client.serviceCategories.get('cat_123');
   * console.log('Category:', category.name);
   * console.log('Services count:', category.displayOrder);
   * ```
   */
  public async get(id: string): Promise<ServiceCategory> {
    return this.http.get<ServiceCategory>(`${this.resource_path}/${id}`);
  }

  /**
   * Updates an existing service category.
   *
   * @param data - Service category update data (must include id)
   * @returns Promise resolving to the updated service category
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the category is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.serviceCategories.update({
   *   id: 'cat_123',
   *   name: 'Premium Spa Treatments',
   *   displayOrder: 1
   * });
   * console.log('Updated category:', updated.name);
   * ```
   */
  public async update(data: UpdateServiceCategory): Promise<ServiceCategory> {
    return this.http.patch<UpdateServiceCategory, ServiceCategory>(
      `${this.resource_path}/${data.id}`,
      data,
      UpdateServiceCategorySchema
    );
  }

  /**
   * Deletes a service category.
   *
   * @param id - Service category ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the category is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Services in this category will need to be
   * reassigned or will become uncategorized.
   *
   * @example
   * ```typescript
   * const deleted = await client.serviceCategories.delete('cat_123');
   * if (deleted) {
   *   console.log('Category deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Toggles the active status of a service category.
   */
  public async toggleActive(id: string): Promise<ServiceCategory> {
    return this.http.post<Record<string, never>, ServiceCategory>(
      `${this.resource_path}/${id}/toggle-active`,
      {}
    );
  }

  /**
   * Lists service categories with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of service categories
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.serviceCategories.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} categories`);
   * result.data.forEach(category => {
   *   console.log(`- ${category.name}`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceCategory>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceCategory>>(path);
  }

  /**
   * Creates multiple service categories in a single batch request.
   *
   * @param data - Array of service category data (maximum 50 items)
   * @returns Promise resolving to paginated result of created service categories
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const categories = await client.serviceCategories.createBatch([
   *   { organizationId: 'org_123', name: 'Hair Services' },
   *   { organizationId: 'org_123', name: 'Spa Treatments' }
   * ]);
   * console.log(`Created ${categories.data.length} categories`);
   * ```
   */
  public async createBatch(
    data: CreateServiceCategory[]
  ): Promise<PaginatedResultType<ServiceCategory>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateServiceCategorySchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateServiceCategory[], PaginatedResultType<ServiceCategory>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
