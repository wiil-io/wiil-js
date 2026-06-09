/**
 * @fileoverview Menu Item Variants resource for managing menu item size/option variants.
 * @module resources/menu-item-variants
 */

import {
  MenuItemVariant,
  CreateMenuItemVariant,
  CreateMenuItemVariantSchema,
  UpdateMenuItemVariant,
  UpdateMenuItemVariantSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 100;

/**
 * Resource class for managing menu item variants in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * menu item variants. Variants represent different sizes or options for the
 * same menu item (e.g., Small, Medium, Large).
 * All methods require proper authentication via API key.
 */
export class MenuItemVariantsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/menu-item-variants';

  /**
   * Creates a new MenuItemVariantsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new menu item variant.
   *
   * @param data - Menu item variant data
   * @returns Promise resolving to the created menu item variant
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateMenuItemVariant): Promise<MenuItemVariant> {
    return this.http.post<CreateMenuItemVariant, MenuItemVariant>(
      this.resource_path,
      data,
      CreateMenuItemVariantSchema
    );
  }

  /**
   * Retrieves a menu item variant by ID.
   *
   * @param id - Menu item variant ID
   * @returns Promise resolving to the menu item variant
   *
   * @throws {@link WiilAPIError} - When the variant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<MenuItemVariant> {
    return this.http.get<MenuItemVariant>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves menu item variants by parent menu item ID.
   *
   * @param menuItemId - Parent menu item ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of menu item variants
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByMenuItem(
    menuItemId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuItemVariant>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-menu-item/${menuItemId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuItemVariant>>(path);
  }

  /**
   * Retrieves the default variant for a menu item.
   *
   * @param menuItemId - Parent menu item ID
   * @returns Promise resolving to the default variant or null if none set
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getDefault(menuItemId: string): Promise<MenuItemVariant | null> {
    return this.http.get<MenuItemVariant | null>(`${this.resource_path}/default/${menuItemId}`);
  }

  /**
   * Updates an existing menu item variant.
   *
   * @param id - Menu item variant ID
   * @param data - Menu item variant update data
   * @returns Promise resolving to the updated menu item variant
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the variant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateMenuItemVariant): Promise<MenuItemVariant> {
    return this.http.patch<UpdateMenuItemVariant, MenuItemVariant>(
      `${this.resource_path}/${id}`,
      data,
      UpdateMenuItemVariantSchema
    );
  }

  /**
   * Deletes a menu item variant.
   *
   * @param id - Menu item variant ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the variant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists menu item variants with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of menu item variants
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuItemVariant>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuItemVariant>>(path);
  }

  /**
   * Creates multiple menu item variants in a single batch request.
   *
   * @param data - Array of menu item variant data (maximum 100 items)
   * @returns Promise resolving to paginated result of created menu item variants
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateMenuItemVariant[]
  ): Promise<PaginatedResultType<MenuItemVariant>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateMenuItemVariantSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateMenuItemVariant[], PaginatedResultType<MenuItemVariant>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
