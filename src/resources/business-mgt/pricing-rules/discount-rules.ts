/**
 * @fileoverview Discount Rules resource for managing order discount configurations.
 * @module resources/pricing-rules/discount-rules
 */

import {
  DiscountRule,
  CreateDiscountRule,
  CreateDiscountRuleSchema,
  UpdateDiscountRule,
  UpdateDiscountRuleSchema,
  DiscountScope,
  DiscountType,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing discount rules in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * discount rules. Discount rules define discount configurations for orders
 * including percentage and fixed amount discounts, promo codes, customer
 * segments, and usage limits.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a promo code discount
 * const discount = await client.discountRules.create({
 *   name: 'Summer Sale',
 *   code: 'SUMMER20',
 *   scope: 'ORDER',
 *   type: 'PERCENTAGE',
 *   value: 20,
 *   minSubtotal: 5000, // $50.00 minimum
 *   isActive: true
 * });
 *
 * // List all discount rules
 * const rules = await client.discountRules.list({ page: 1, pageSize: 20 });
 * ```
 */
export class DiscountRulesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/discount-rules';

  /**
   * Creates a new DiscountRulesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new discount rule.
   *
   * @param data - Discount rule data
   * @returns Promise resolving to the created discount rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rule = await client.discountRules.create({
   *   name: 'First Order Discount',
   *   code: 'WELCOME10',
   *   scope: 'ORDER',
   *   type: 'PERCENTAGE',
   *   value: 10,
   *   firstOrderOnly: true,
   *   maxUsesPerCustomer: 1,
   *   priority: 1,
   *   isActive: true
   * });
   * console.log('Created discount rule:', rule.id);
   * ```
   */
  public async create(data: CreateDiscountRule): Promise<DiscountRule> {
    return this.http.post<CreateDiscountRule, DiscountRule>(
      this.resource_path,
      data,
      CreateDiscountRuleSchema
    );
  }

  /**
   * Retrieves a discount rule by ID.
   *
   * @param id - Discount rule ID
   * @returns Promise resolving to the discount rule
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rule = await client.discountRules.get('disc_123');
   * console.log('Discount rule:', rule.name);
   * console.log('Value:', rule.value);
   * ```
   */
  public async get(id: string): Promise<DiscountRule> {
    return this.http.get<DiscountRule>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves discount rules by location.
   *
   * @param locationId - Location ID (null for global rules)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of discount rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rules = await client.discountRules.getByLocation('loc_123');
   * console.log(`Found ${rules.meta.totalCount} discount rules for location`);
   * ```
   */
  public async getByLocation(
    locationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DiscountRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-location/${locationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DiscountRule>>(path);
  }

  /**
   * Retrieves a discount rule by promo code.
   *
   * @param code - Discount promo code
   * @returns Promise resolving to the discount rule
   *
   * @throws {@link WiilAPIError} - When the code is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rule = await client.discountRules.getByCode('SUMMER20');
   * if (rule.isActive) {
   *   console.log(`Discount ${rule.name} is active: ${rule.value}% off`);
   * }
   * ```
   */
  public async getByCode(code: string): Promise<DiscountRule> {
    return this.http.get<DiscountRule>(`${this.resource_path}/by-code/${code}`);
  }

  /**
   * Retrieves discount rules by scope.
   *
   * @param scope - Discount scope (ORDER, ITEM, CATEGORY)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of discount rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const orderDiscounts = await client.discountRules.getByScope('ORDER');
   * console.log(`Found ${orderDiscounts.meta.totalCount} order-level discounts`);
   * ```
   */
  public async getByScope(
    scope: DiscountScope,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DiscountRule>> {
    const queryParams = new URLSearchParams();
    queryParams.append('scope', scope);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-scope?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<DiscountRule>>(path);
  }

  /**
   * Retrieves discount rules by type.
   *
   * @param type - Discount type (PERCENTAGE, FIXED)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of discount rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const percentageDiscounts = await client.discountRules.getByType('PERCENTAGE');
   * console.log(`Found ${percentageDiscounts.meta.totalCount} percentage discounts`);
   * ```
   */
  public async getByType(
    type: DiscountType,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DiscountRule>> {
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-type?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<DiscountRule>>(path);
  }

  /**
   * Retrieves active discount rules.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active discount rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeDiscounts = await client.discountRules.getActive();
   * console.log(`Found ${activeDiscounts.meta.totalCount} active discount rules`);
   * ```
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DiscountRule>> {
    const queryParams = new URLSearchParams();
    queryParams.append('isActive', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<DiscountRule>>(path);
  }

  /**
   * Retrieves stackable discount rules.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of stackable discount rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const stackable = await client.discountRules.getStackable();
   * console.log(`Found ${stackable.meta.totalCount} stackable discounts`);
   * ```
   */
  public async getStackable(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DiscountRule>> {
    const queryParams = new URLSearchParams();
    queryParams.append('isStackable', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/stackable?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<DiscountRule>>(path);
  }

  /**
   * Updates an existing discount rule.
   *
   * @param data - Discount rule update data (must include id)
   * @returns Promise resolving to the updated discount rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.discountRules.update({
   *   id: 'disc_123',
   *   value: 25,
   *   effectiveTo: Date.now() + 7 * 24 * 60 * 60 * 1000 // Extend 7 days
   * });
   * console.log('Updated discount value:', updated.value);
   * ```
   */
  public async update(data: UpdateDiscountRule): Promise<DiscountRule> {
    return this.http.patch<UpdateDiscountRule, DiscountRule>(
      this.resource_path,
      data,
      UpdateDiscountRuleSchema
    );
  }

  /**
   * Deletes a discount rule.
   *
   * @param id - Discount rule ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Future orders will no longer apply this discount.
   *
   * @example
   * ```typescript
   * const deleted = await client.discountRules.delete('disc_123');
   * if (deleted) {
   *   console.log('Discount rule deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists discount rules with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of discount rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.discountRules.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} discount rules`);
   * result.data.forEach(rule => {
   *   console.log(`- ${rule.name}: ${rule.value}% (Code: ${rule.code || 'N/A'})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<DiscountRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<DiscountRule>>(path);
  }

  /**
   * Creates multiple discount rules in a single batch request.
   *
   * @param data - Array of discount rule data (maximum 50 items)
   * @returns Promise resolving to paginated result of created discount rules
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rules = await client.discountRules.createBatch([
   *   {
   *     name: 'Weekend Sale',
   *     code: 'WEEKEND10',
   *     scope: 'ORDER',
   *     type: 'PERCENTAGE',
   *     value: 10,
   *     priority: 1
   *   },
   *   {
   *     name: 'Free Shipping',
   *     code: 'FREESHIP',
   *     scope: 'ORDER',
   *     type: 'FIXED',
   *     value: 500, // $5.00
   *     minSubtotal: 2500, // $25.00 minimum
   *     priority: 2
   *   }
   * ]);
   * console.log(`Created ${rules.data.length} discount rules`);
   * ```
   */
  public async createBatch(
    data: CreateDiscountRule[]
  ): Promise<PaginatedResultType<DiscountRule>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateDiscountRuleSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateDiscountRule[], PaginatedResultType<DiscountRule>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
