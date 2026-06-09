/**
 * @fileoverview Product Pricing Rules resource for managing promotions and discounts.
 * @module resources/product-pricing-rules
 */

import {
  ProductPricingRule,
  CreateProductPricingRule,
  CreateProductPricingRuleSchema,
  UpdateProductPricingRule,
  UpdateProductPricingRuleSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing product pricing rules in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * product pricing rules. Pricing rules define promotional pricing logic
 * applied to product orders, including time-based conditions and customer
 * segment targeting.
 * All methods require proper authentication via API key.
 */
export class ProductPricingRulesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/product-pricing-rules';

  /**
   * Creates a new ProductPricingRulesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new product pricing rule.
   *
   * @param data - Product pricing rule data
   * @returns Promise resolving to the created pricing rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateProductPricingRule): Promise<ProductPricingRule> {
    return this.http.post<CreateProductPricingRule, ProductPricingRule>(
      this.resource_path,
      data,
      CreateProductPricingRuleSchema
    );
  }

  /**
   * Retrieves a product pricing rule by ID.
   *
   * @param id - Product pricing rule ID
   * @returns Promise resolving to the pricing rule
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ProductPricingRule> {
    return this.http.get<ProductPricingRule>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves pricing rules by product set ID.
   *
   * @param productSetId - Product set ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByProductSet(
    productSetId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductPricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-product-set/${productSetId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductPricingRule>>(path);
  }

  /**
   * Retrieves pricing rules by discount ID.
   *
   * @param discountId - Discount ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByDiscount(
    discountId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductPricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-discount/${discountId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductPricingRule>>(path);
  }

  /**
   * Retrieves active pricing rules effective at a given timestamp.
   *
   * @param timestamp - Unix timestamp to check effectiveness
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getActive(
    timestamp?: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductPricingRule>> {
    const queryParams = new URLSearchParams();

    if (timestamp) queryParams.append('effectiveAt', timestamp.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductPricingRule>>(path);
  }

  /**
   * Updates an existing product pricing rule.
   *
   * @param id - Product pricing rule ID
   * @param data - Pricing rule update data
   * @returns Promise resolving to the updated pricing rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateProductPricingRule): Promise<ProductPricingRule> {
    return this.http.patch<UpdateProductPricingRule, ProductPricingRule>(
      `${this.resource_path}/${id}`,
      data,
      UpdateProductPricingRuleSchema
    );
  }

  /**
   * Deletes a product pricing rule.
   *
   * @param id - Product pricing rule ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists product pricing rules with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductPricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductPricingRule>>(path);
  }

  /**
   * Creates multiple product pricing rules in a single batch request.
   *
   * @param data - Array of pricing rule data (maximum 50 items)
   * @returns Promise resolving to paginated result of created pricing rules
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateProductPricingRule[]
  ): Promise<PaginatedResultType<ProductPricingRule>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateProductPricingRuleSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateProductPricingRule[], PaginatedResultType<ProductPricingRule>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
