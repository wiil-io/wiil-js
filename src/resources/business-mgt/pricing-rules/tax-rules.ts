/**
 * @fileoverview Tax Rules resource for managing order tax configurations.
 * @module resources/pricing-rules/tax-rules
 */

import {
  TaxRule,
  CreateTaxRule,
  CreateTaxRuleSchema,
  UpdateTaxRule,
  UpdateTaxRuleSchema,
  TaxScope,
  TaxRateType,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing tax rules in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * tax rules. Tax rules define tax configurations for orders including
 * percentage and fixed amount taxes, compound taxes, and inclusive/exclusive
 * tax calculations.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a sales tax rule
 * const taxRule = await client.taxRules.create({
 *   name: 'State Sales Tax',
 *   scope: 'ORDER',
 *   rateType: 'PERCENTAGE',
 *   rateValue: 8.25,
 *   isInclusive: false,
 *   priority: 1,
 *   isActive: true
 * });
 *
 * // List all tax rules
 * const rules = await client.taxRules.list({ page: 1, pageSize: 20 });
 * ```
 */
export class TaxRulesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/tax-rules';

  /**
   * Creates a new TaxRulesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new tax rule.
   *
   * @param data - Tax rule data
   * @returns Promise resolving to the created tax rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rule = await client.taxRules.create({
   *   name: 'VAT 20%',
   *   scope: 'ORDER',
   *   rateType: 'PERCENTAGE',
   *   rateValue: 20,
   *   isInclusive: true,
   *   priority: 1,
   *   isCompound: false,
   *   isActive: true
   * });
   * console.log('Created tax rule:', rule.id);
   * ```
   */
  public async create(data: CreateTaxRule): Promise<TaxRule> {
    return this.http.post<CreateTaxRule, TaxRule>(
      this.resource_path,
      data,
      CreateTaxRuleSchema
    );
  }

  /**
   * Retrieves a tax rule by ID.
   *
   * @param id - Tax rule ID
   * @returns Promise resolving to the tax rule
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rule = await client.taxRules.get('tax_123');
   * console.log('Tax rule:', rule.name);
   * console.log('Rate:', rule.rateValue);
   * ```
   */
  public async get(id: string): Promise<TaxRule> {
    return this.http.get<TaxRule>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves tax rules by location.
   *
   * @param locationId - Location ID (null for global rules)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of tax rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rules = await client.taxRules.getByLocation('loc_123');
   * console.log(`Found ${rules.meta.totalCount} tax rules for location`);
   * ```
   */
  public async getByLocation(
    locationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TaxRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-location/${locationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TaxRule>>(path);
  }

  /**
   * Retrieves tax rules by scope.
   *
   * @param scope - Tax scope (ORDER, ITEM, CATEGORY)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of tax rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const orderTaxes = await client.taxRules.getByScope('ORDER');
   * console.log(`Found ${orderTaxes.meta.totalCount} order-level taxes`);
   * ```
   */
  public async getByScope(
    scope: TaxScope,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TaxRule>> {
    const queryParams = new URLSearchParams();
    queryParams.append('scope', scope);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-scope?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<TaxRule>>(path);
  }

  /**
   * Retrieves tax rules by rate type.
   *
   * @param rateType - Tax rate type (PERCENTAGE, FIXED)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of tax rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const percentageTaxes = await client.taxRules.getByRateType('PERCENTAGE');
   * console.log(`Found ${percentageTaxes.meta.totalCount} percentage-based taxes`);
   * ```
   */
  public async getByRateType(
    rateType: TaxRateType,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TaxRule>> {
    const queryParams = new URLSearchParams();
    queryParams.append('rateType', rateType);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-rate-type?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<TaxRule>>(path);
  }

  /**
   * Retrieves active tax rules.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active tax rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeTaxes = await client.taxRules.getActive();
   * console.log(`Found ${activeTaxes.meta.totalCount} active tax rules`);
   * ```
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TaxRule>> {
    const queryParams = new URLSearchParams();
    queryParams.append('isActive', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<TaxRule>>(path);
  }

  /**
   * Updates an existing tax rule.
   *
   * @param data - Tax rule update data (must include id)
   * @returns Promise resolving to the updated tax rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.taxRules.update({
   *   id: 'tax_123',
   *   rateValue: 10,
   *   isActive: true
   * });
   * console.log('Updated rate:', updated.rateValue);
   * ```
   */
  public async update(data: UpdateTaxRule): Promise<TaxRule> {
    return this.http.patch<UpdateTaxRule, TaxRule>(
      this.resource_path,
      data,
      UpdateTaxRuleSchema
    );
  }

  /**
   * Deletes a tax rule.
   *
   * @param id - Tax rule ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Future orders will no longer apply this tax.
   *
   * @example
   * ```typescript
   * const deleted = await client.taxRules.delete('tax_123');
   * if (deleted) {
   *   console.log('Tax rule deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists tax rules with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of tax rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.taxRules.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} tax rules`);
   * result.data.forEach(rule => {
   *   console.log(`- ${rule.name}: ${rule.rateValue}% (Priority: ${rule.priority})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TaxRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TaxRule>>(path);
  }

  /**
   * Creates multiple tax rules in a single batch request.
   *
   * @param data - Array of tax rule data (maximum 50 items)
   * @returns Promise resolving to paginated result of created tax rules
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rules = await client.taxRules.createBatch([
   *   {
   *     name: 'State Tax',
   *     scope: 'ORDER',
   *     rateType: 'PERCENTAGE',
   *     rateValue: 6,
   *     priority: 1
   *   },
   *   {
   *     name: 'County Tax',
   *     scope: 'ORDER',
   *     rateType: 'PERCENTAGE',
   *     rateValue: 2.25,
   *     priority: 2
   *   }
   * ]);
   * console.log(`Created ${rules.data.length} tax rules`);
   * ```
   */
  public async createBatch(
    data: CreateTaxRule[]
  ): Promise<PaginatedResultType<TaxRule>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateTaxRuleSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateTaxRule[], PaginatedResultType<TaxRule>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
