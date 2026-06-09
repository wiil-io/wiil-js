/**
 * @fileoverview Product Sets resource for managing product bundles.
 * @module resources/product-sets
 */

import {
  ProductSet,
  CreateProductSet,
  CreateProductSetSchema,
  UpdateProductSet,
  UpdateProductSetSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing product sets in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * product sets. Product sets enable bundling products into packages with
 * flexible pricing and targeting strategies. Sets can use fixed pricing or
 * sum of component prices.
 * All methods require proper authentication via API key.
 */
export class ProductSetsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/product-sets';

  /**
   * Creates a new ProductSetsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new product set.
   *
   * @param data - Product set data
   * @returns Promise resolving to the created product set
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateProductSet): Promise<ProductSet> {
    return this.http.post<CreateProductSet, ProductSet>(
      this.resource_path,
      data,
      CreateProductSetSchema
    );
  }

  /**
   * Retrieves a product set by ID.
   *
   * @param id - Product set ID
   * @returns Promise resolving to the product set
   *
   * @throws {@link WiilAPIError} - When the set is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ProductSet> {
    return this.http.get<ProductSet>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a product set by code.
   *
   * @param code - Product set code
   * @returns Promise resolving to the product set or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByCode(code: string): Promise<ProductSet | null> {
    return this.http.get<ProductSet | null>(`${this.resource_path}/code/${encodeURIComponent(code)}`);
  }

  /**
   * Retrieves active product sets.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active product sets
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductSet>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductSet>>(path);
  }

  /**
   * Updates an existing product set.
   *
   * @param id - Product set ID
   * @param data - Product set update data
   * @returns Promise resolving to the updated product set
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the set is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateProductSet): Promise<ProductSet> {
    return this.http.patch<UpdateProductSet, ProductSet>(
      `${this.resource_path}/${id}`,
      data,
      UpdateProductSetSchema
    );
  }

  /**
   * Deletes a product set.
   *
   * @param id - Product set ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the set is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists product sets with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of product sets
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductSet>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductSet>>(path);
  }

  /**
   * Creates multiple product sets in a single batch request.
   *
   * @param data - Array of product set data (maximum 50 items)
   * @returns Promise resolving to paginated result of created product sets
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateProductSet[]
  ): Promise<PaginatedResultType<ProductSet>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateProductSetSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateProductSet[], PaginatedResultType<ProductSet>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
