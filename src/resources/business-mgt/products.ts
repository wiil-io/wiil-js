/**
 * @fileoverview Products resource for managing product categories and products.
 * @module resources/products
 */

import {
  ProductCategory,
  CreateProductCategory,
  CreateProductCategorySchema,
  UpdateProductCategory,
  UpdateProductCategorySchema,
  BusinessProduct,
  CreateBusinessProduct,
  CreateBusinessProductSchema,
  UpdateBusinessProduct,
  UpdateBusinessProductSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';

const CATEGORY_BATCH_LIMIT = 50;
const PRODUCT_BATCH_LIMIT = 100;

/**
 * Resource class for managing products in the WIIL Platform.
 */
export class ProductsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/product-management';

  constructor(http: HttpClient) {
    this.http = http;
  }

  // =============== Product Category Methods ===============

  public async createCategory(data: CreateProductCategory): Promise<ProductCategory> {
    return this.http.post<CreateProductCategory, ProductCategory>(
      `${this.resource_path}/categories`,
      data,
      CreateProductCategorySchema
    );
  }

  public async getCategory(id: string): Promise<ProductCategory> {
    return this.http.get<ProductCategory>(`${this.resource_path}/categories/${id}`);
  }

  public async listCategories(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductCategory>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductCategory>>(path);
  }

  public async updateCategory(data: UpdateProductCategory): Promise<ProductCategory> {
    return this.http.patch<UpdateProductCategory, ProductCategory>(
      `${this.resource_path}/categories`,
      data,
      UpdateProductCategorySchema
    );
  }

  public async deleteCategory(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/categories/${id}`);
  }

  // =============== Product Methods ===============

  public async create(data: CreateBusinessProduct): Promise<BusinessProduct> {
    return this.http.post<CreateBusinessProduct, BusinessProduct>(
      `${this.resource_path}/products`,
      data,
      CreateBusinessProductSchema
    );
  }

  public async get(id: string): Promise<BusinessProduct> {
    return this.http.get<BusinessProduct>(`${this.resource_path}/products/${id}`);
  }

  public async getBySku(sku: string): Promise<BusinessProduct> {
    return this.http.get<BusinessProduct>(`${this.resource_path}/products/by-sku/${sku}`);
  }

  public async getByBarcode(barcode: string): Promise<BusinessProduct> {
    return this.http.get<BusinessProduct>(`${this.resource_path}/products/by-barcode/${barcode}`);
  }

  public async list(
    params?: Partial<PaginationRequest & { includeDeleted?: boolean }>
  ): Promise<PaginatedResultType<BusinessProduct>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', params.includeDeleted.toString());

    const path = `${this.resource_path}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessProduct>>(path);
  }

  public async getByCategory(
    categoryId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessProduct>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/products/by-category/${categoryId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessProduct>>(path);
  }

  public async search(
    query: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessProduct>> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/products/search?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<BusinessProduct>>(path);
  }

  public async update(data: UpdateBusinessProduct): Promise<BusinessProduct> {
    return this.http.patch<UpdateBusinessProduct, BusinessProduct>(
      `${this.resource_path}/products`,
      data,
      UpdateBusinessProductSchema
    );
  }

  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/products/${id}`);
  }

  /**
   * Creates multiple product categories in a single batch request.
   *
   * @param data - Array of product category data (maximum 50 items)
   * @returns Promise resolving to paginated result of created product categories
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createCategoryBatch(
    data: CreateProductCategory[]
  ): Promise<PaginatedResultType<ProductCategory>> {
    if (data.length > CATEGORY_BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${CATEGORY_BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${CATEGORY_BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateProductCategorySchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateProductCategory[], PaginatedResultType<ProductCategory>>(
      `${this.resource_path}/categories/batch`,
      data
    );
  }

  /**
   * Creates multiple products in a single batch request.
   *
   * @param data - Array of product data (maximum 100 items)
   * @returns Promise resolving to paginated result of created products
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateBusinessProduct[]
  ): Promise<PaginatedResultType<BusinessProduct>> {
    if (data.length > PRODUCT_BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${PRODUCT_BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${PRODUCT_BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateBusinessProductSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateBusinessProduct[], PaginatedResultType<BusinessProduct>>(
      `${this.resource_path}/products/batch`,
      data
    );
  }
}
