/**
 * @fileoverview Service Pricing Rules resource for managing service pricing adjustments.
 * @module resources/service-pricing-rules
 */

import {
  ServicePricingRule,
  CreateServicePricingRule,
  CreateServicePricingRuleSchema,
  UpdateServicePricingRule,
  UpdateServicePricingRuleSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing service pricing rules in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * service pricing rules. Pricing rules define conditional pricing adjustments
 * for services including time-based promotions, channel-specific pricing,
 * and customer segment targeting.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a weekend discount rule
 * const rule = await client.servicePricingRules.create({
 *   name: 'Weekend Special',
 *   condition: {
 *     daysOfWeek: [0, 6], // Sunday and Saturday
 *     allServices: true
 *   },
 *   action: {
 *     adjustmentType: 'PERCENTAGE',
 *     adjustmentValue: -15 // 15% discount
 *   },
 *   isActive: true
 * });
 *
 * // List all pricing rules
 * const rules = await client.servicePricingRules.list({ page: 1, pageSize: 20 });
 * ```
 */
export class ServicePricingRulesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/service-pricing-rules';

  /**
   * Creates a new ServicePricingRulesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new service pricing rule.
   *
   * @param data - Service pricing rule data
   * @returns Promise resolving to the created pricing rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rule = await client.servicePricingRules.create({
   *   name: 'Happy Hour',
   *   condition: {
   *     daysOfWeek: [1, 2, 3, 4, 5],
   *     startMinute: 960, // 4 PM
   *     endMinute: 1080, // 6 PM
   *     allServices: true
   *   },
   *   action: {
   *     adjustmentType: 'PERCENTAGE',
   *     adjustmentValue: -20
   *   },
   *   priority: 10,
   *   isStackable: false,
   *   isActive: true
   * });
   * console.log('Created rule:', rule.id);
   * ```
   */
  public async create(data: CreateServicePricingRule): Promise<ServicePricingRule> {
    return this.http.post<CreateServicePricingRule, ServicePricingRule>(
      this.resource_path,
      data,
      CreateServicePricingRuleSchema
    );
  }

  /**
   * Retrieves a service pricing rule by ID.
   *
   * @param id - Service pricing rule ID
   * @returns Promise resolving to the pricing rule
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rule = await client.servicePricingRules.get('rule_123');
   * console.log('Rule:', rule.name);
   * console.log('Priority:', rule.priority);
   * ```
   */
  public async get(id: string): Promise<ServicePricingRule> {
    return this.http.get<ServicePricingRule>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves service pricing rules by location.
   *
   * @param locationId - Location ID (null for global rules)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rules = await client.servicePricingRules.getByLocation('loc_123');
   * console.log(`Found ${rules.meta.totalCount} rules for location`);
   * ```
   */
  public async getByLocation(
    locationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServicePricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-location/${locationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServicePricingRule>>(path);
  }

  /**
   * Updates an existing service pricing rule.
   *
   * @param data - Service pricing rule update data (must include id)
   * @returns Promise resolving to the updated pricing rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.servicePricingRules.update({
   *   id: 'rule_123',
   *   name: 'Extended Happy Hour',
   *   condition: {
   *     startMinute: 900, // 3 PM
   *     endMinute: 1140 // 7 PM
   *   }
   * });
   * console.log('Updated rule:', updated.name);
   * ```
   */
  public async update(data: UpdateServicePricingRule): Promise<ServicePricingRule> {
    return this.http.patch<UpdateServicePricingRule, ServicePricingRule>(
      `${this.resource_path}/${data.id}`,
      data,
      UpdateServicePricingRuleSchema
    );
  }

  /**
   * Deletes a service pricing rule.
   *
   * @param id - Service pricing rule ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Future pricing will no longer apply this rule.
   *
   * @example
   * ```typescript
   * const deleted = await client.servicePricingRules.delete('rule_123');
   * if (deleted) {
   *   console.log('Rule deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists service pricing rules with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.servicePricingRules.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} pricing rules`);
   * result.data.forEach(rule => {
   *   console.log(`- ${rule.name} (Priority: ${rule.priority})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServicePricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServicePricingRule>>(path);
  }

  /**
   * Creates multiple service pricing rules in a single batch request.
   *
   * @param data - Array of pricing rule data (maximum 50 items)
   * @returns Promise resolving to paginated result of created pricing rules
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rules = await client.servicePricingRules.createBatch([
   *   {
   *     name: 'Monday Special',
   *     condition: { daysOfWeek: [1], allServices: true },
   *     action: { adjustmentType: 'PERCENTAGE', adjustmentValue: -10 }
   *   },
   *   {
   *     name: 'Tuesday Special',
   *     condition: { daysOfWeek: [2], allServices: true },
   *     action: { adjustmentType: 'PERCENTAGE', adjustmentValue: -10 }
   *   }
   * ]);
   * console.log(`Created ${rules.data.length} pricing rules`);
   * ```
   */
  public async createBatch(
    data: CreateServicePricingRule[]
  ): Promise<PaginatedResultType<ServicePricingRule>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateServicePricingRuleSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateServicePricingRule[], PaginatedResultType<ServicePricingRule>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
