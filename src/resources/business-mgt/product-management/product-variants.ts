/**
 * @fileoverview Product Variants resource for managing SKU-level product variants.
 * @module resources/product-variants
 */

import {
  ProductVariant,
  CreateProductVariant,
  CreateProductVariantSchema,
  UpdateProductVariant,
  UpdateProductVariantSchema,
  PaginatedResultType,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 100;

/**
 * Resource class for managing product variants in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * product variants. Variants represent individual SKU-level items with axis
 * value selections (e.g., size, color). Variants can override parent product
 * attributes for pricing, inventory, and physical properties.
 * All methods require proper authentication via API key.
 */
export class ProductVariantsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/product-management/variants';

  /**
   * Creates a new ProductVariantsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new product variant.
   *
   * @param data - Product variant data
   * @returns Promise resolving to the created product variant
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateProductVariant): Promise<ProductVariant> {
    return this.http.post<CreateProductVariant, ProductVariant>(
      this.resource_path,
      data,
      CreateProductVariantSchema
    );
  }

  /**
   * Retrieves a product variant by ID.
   *
   * @param id - Product variant ID
   * @returns Promise resolving to the product variant
   *
   * @throws {@link WiilAPIError} - When the variant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ProductVariant> {
    return this.http.get<ProductVariant>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a product variant by SKU.
   *
   * @param sku - Stock Keeping Unit identifier
   * @returns Promise resolving to the product variant or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getBySku(sku: string): Promise<ProductVariant | null> {
    return this.http.get<ProductVariant | null>(`${this.resource_path}/by-sku/${sku}`);
  }

  /**
   * Retrieves the default variant for a product.
   *
   * @param productId - Parent product ID
   * @returns Promise resolving to the default variant or null if none set
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getDefault(productId: string): Promise<ProductVariant | null> {
    return this.http.get<ProductVariant | null>(`${this.resource_path}/default/${productId}`);
  }

  /**
   * Updates an existing product variant.
   *
   * @param id - Product variant ID
   * @param data - Product variant update data
   * @returns Promise resolving to the updated product variant
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the variant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateProductVariant): Promise<ProductVariant> {
    return this.http.patch<UpdateProductVariant, ProductVariant>(
      `${this.resource_path}/${id}`,
      data,
      UpdateProductVariantSchema
    );
  }

  /**
   * Deletes a product variant.
   *
   * @param id - Product variant ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the variant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Creates multiple product variants in a single batch request.
   *
   * @param data - Array of product variant data (maximum 100 items)
   * @returns Promise resolving to paginated result of created product variants
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateProductVariant[]
  ): Promise<PaginatedResultType<ProductVariant>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateProductVariantSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateProductVariant[], PaginatedResultType<ProductVariant>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
