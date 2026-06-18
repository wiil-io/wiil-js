/**
 * @fileoverview Product Axis Bindings resource for linking products to variant axes.
 * @module resources/product-axis-bindings
 */

import {
  ProductAxisBinding,
  CreateProductAxisBinding,
  CreateProductAxisBindingSchema,
  UpdateProductAxisBinding,
  UpdateProductAxisBindingSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 100;

/**
 * Resource class for managing product axis bindings in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * product axis bindings. Bindings link products to their applicable variant
 * axes, defining which axes apply to each product (e.g., which products have
 * Size and Color options).
 * All methods require proper authentication via API key.
 */
export class ProductAxisBindingsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/product-management/axis-bindings';

  /**
   * Creates a new ProductAxisBindingsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new product axis binding.
   *
   * @param data - Product axis binding data
   * @returns Promise resolving to the created binding
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateProductAxisBinding): Promise<ProductAxisBinding> {
    return this.http.post<CreateProductAxisBinding, ProductAxisBinding>(
      this.resource_path,
      data,
      CreateProductAxisBindingSchema
    );
  }

  /**
   * Retrieves a product axis binding by ID.
   *
   * @param id - Product axis binding ID
   * @returns Promise resolving to the binding
   *
   * @throws {@link WiilAPIError} - When the binding is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ProductAxisBinding> {
    return this.http.get<ProductAxisBinding>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves product axis bindings by product ID.
   *
   * @param productId - Product ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of bindings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByProduct(
    productId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductAxisBinding>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-product/${productId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductAxisBinding>>(path);
  }

  /**
   * Retrieves product axis bindings by axis ID.
   *
   * @param axisId - Variant axis ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of bindings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByAxis(
    axisId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductAxisBinding>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-axis/${axisId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductAxisBinding>>(path);
  }

  /**
   * Updates an existing product axis binding.
   *
   * @param id - Product axis binding ID
   * @param data - Binding update data
   * @returns Promise resolving to the updated binding
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the binding is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateProductAxisBinding): Promise<ProductAxisBinding> {
    return this.http.patch<UpdateProductAxisBinding, ProductAxisBinding>(
      `${this.resource_path}/${id}`,
      data,
      UpdateProductAxisBindingSchema
    );
  }

  /**
   * Deletes a product axis binding.
   *
   * @param id - Product axis binding ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the binding is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists product axis bindings with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of bindings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductAxisBinding>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductAxisBinding>>(path);
  }

  /**
   * Creates multiple product axis bindings in a single batch request.
   *
   * @param data - Array of binding data (maximum 100 items)
   * @returns Promise resolving to paginated result of created bindings
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateProductAxisBinding[]
  ): Promise<PaginatedResultType<ProductAxisBinding>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateProductAxisBindingSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateProductAxisBinding[], PaginatedResultType<ProductAxisBinding>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
