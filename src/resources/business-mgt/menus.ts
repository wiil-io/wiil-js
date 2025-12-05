/**
 * @fileoverview Menus resource for managing menu categories and items.
 * @module resources/menus
 */

import {
  MenuCategory,
  CreateMenuCategory,
  CreateMenuCategorySchema,
  UpdateMenuCategory,
  UpdateMenuCategorySchema,
  BusinessMenuItem,
  CreateBusinessMenuItem,
  CreateBusinessMenuItemSchema,
  UpdateBusinessMenuItem,
  UpdateBusinessMenuItemSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing menus in the WIIL Platform.
 *
 * @remarks
 * Provides comprehensive methods for managing menu categories, menu items,
 * and menu QR codes. Supports batch operations and filtering. All methods
 * require proper authentication via API key.
 */
export class MenusResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/menu-management';

  /**
   * Creates a new MenusResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  // =============== Menu Category Methods ===============

  /**
   * Creates a new menu category.
   */
  public async createCategory(data: CreateMenuCategory): Promise<MenuCategory> {
    return this.http.post<CreateMenuCategory, MenuCategory>(
      `${this.resource_path}/categories`,
      data,
      CreateMenuCategorySchema
    );
  }

  /**
   * Retrieves a menu category by ID.
   */
  public async getCategory(id: string): Promise<MenuCategory> {
    return this.http.get<MenuCategory>(`${this.resource_path}/categories/${id}`);
  }

  /**
   * Lists all menu categories with optional pagination.
   */
  public async listCategories(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuCategory>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuCategory>>(path);
  }

  /**
   * Updates a menu category.
   */
  public async updateCategory(data: UpdateMenuCategory): Promise<MenuCategory> {
    return this.http.patch<UpdateMenuCategory, MenuCategory>(
      `${this.resource_path}/categories`,
      data,
      UpdateMenuCategorySchema
    );
  }

  /**
   * Deletes a menu category.
   */
  public async deleteCategory(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/categories/${id}`);
  }

  // =============== Menu Item Methods ===============

  /**
   * Creates a new menu item.
   */
  public async createItem(data: CreateBusinessMenuItem): Promise<BusinessMenuItem> {
    return this.http.post<CreateBusinessMenuItem, BusinessMenuItem>(
      `${this.resource_path}/items`,
      data,
      CreateBusinessMenuItemSchema
    );
  }

  /**
   * Retrieves a menu item by ID.
   */
  public async getItem(id: string): Promise<BusinessMenuItem> {
    return this.http.get<BusinessMenuItem>(`${this.resource_path}/items/${id}`);
  }

  /**
   * Lists menu items with pagination.
   */
  public async listItems(
    params?: Partial<PaginationRequest & { includeDeleted?: boolean }>
  ): Promise<PaginatedResultType<BusinessMenuItem>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', params.includeDeleted.toString());

    const path = `${this.resource_path}/items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessMenuItem>>(path);
  }

  /**
   * Retrieves menu items by category with optional pagination.
   */
  public async getItemsByCategory(
    categoryId: string,
    params?: Partial<PaginationRequest & { includeUnavailable?: boolean }>
  ): Promise<PaginatedResultType<BusinessMenuItem>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.includeUnavailable !== undefined) queryParams.append('includeUnavailable', params.includeUnavailable.toString());

    const path = `${this.resource_path}/items/by-category/${categoryId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessMenuItem>>(path);
  }

  /**
   * Retrieves popular menu items with optional pagination.
   */
  public async getPopularItems(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessMenuItem>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/items/popular${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessMenuItem>>(path);
  }

  /**
   * Updates a menu item.
   */
  public async updateItem(data: UpdateBusinessMenuItem): Promise<BusinessMenuItem> {
    return this.http.patch<UpdateBusinessMenuItem, BusinessMenuItem>(
      `${this.resource_path}/items`,
      data,
      UpdateBusinessMenuItemSchema
    );
  }

  /**
   * Deletes a menu item.
   */
  public async deleteItem(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/items/${id}`);
  }

}
