/**
 * @fileoverview Product Variant Axes resource for managing variant dimensions.
 * @module resources/product-variant-axes
 */

import {
  VariantAxis,
  CreateVariantAxis,
  CreateVariantAxisSchema,
  UpdateVariantAxis,
  UpdateVariantAxisSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing product variant axes in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * variant axes. Variant axes define the dimensions along which products can
 * vary (e.g., Size, Color, Material). Each axis contains a set of values that
 * can be selected when creating product variants.
 * All methods require proper authentication via API key.
 */
export class ProductVariantAxesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/product-variant-axes';

  /**
   * Creates a new ProductVariantAxesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new variant axis.
   *
   * @param data - Variant axis data
   * @returns Promise resolving to the created variant axis
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateVariantAxis): Promise<VariantAxis> {
    return this.http.post<CreateVariantAxis, VariantAxis>(
      this.resource_path,
      data,
      CreateVariantAxisSchema
    );
  }

  /**
   * Retrieves a variant axis by ID.
   *
   * @param id - Variant axis ID
   * @returns Promise resolving to the variant axis
   *
   * @throws {@link WiilAPIError} - When the axis is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<VariantAxis> {
    return this.http.get<VariantAxis>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a variant axis by name.
   *
   * @param name - Variant axis name
   * @returns Promise resolving to the variant axis or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByName(name: string): Promise<VariantAxis | null> {
    return this.http.get<VariantAxis | null>(`${this.resource_path}/by-name/${encodeURIComponent(name)}`);
  }

  /**
   * Updates an existing variant axis.
   *
   * @param id - Variant axis ID
   * @param data - Variant axis update data
   * @returns Promise resolving to the updated variant axis
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the axis is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateVariantAxis): Promise<VariantAxis> {
    return this.http.patch<UpdateVariantAxis, VariantAxis>(
      `${this.resource_path}/${id}`,
      data,
      UpdateVariantAxisSchema
    );
  }

  /**
   * Deletes a variant axis.
   *
   * @param id - Variant axis ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the axis is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists variant axes with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of variant axes
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<VariantAxis>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<VariantAxis>>(path);
  }

  /**
   * Creates multiple variant axes in a single batch request.
   *
   * @param data - Array of variant axis data (maximum 50 items)
   * @returns Promise resolving to paginated result of created variant axes
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateVariantAxis[]
  ): Promise<PaginatedResultType<VariantAxis>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateVariantAxisSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateVariantAxis[], PaginatedResultType<VariantAxis>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
