/**
 * @fileoverview Menu Pricing Rules resource for managing menu-specific discounts.
 * @module resources/menu-pricing-rules
 */

import {
  MenuPricingRule,
  CreateMenuPricingRule,
  CreateMenuPricingRuleSchema,
  UpdateMenuPricingRule,
  UpdateMenuPricingRuleSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing menu pricing rules in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * menu pricing rules. Pricing rules define menu-specific discounts and
 * promotional pricing with conditions and time-based validity.
 * All methods require proper authentication via API key.
 */
export class MenuPricingRulesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/menu-pricing-rules';

  /**
   * Creates a new MenuPricingRulesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new menu pricing rule.
   *
   * @param data - Menu pricing rule data
   * @returns Promise resolving to the created menu pricing rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateMenuPricingRule): Promise<MenuPricingRule> {
    return this.http.post<CreateMenuPricingRule, MenuPricingRule>(
      this.resource_path,
      data,
      CreateMenuPricingRuleSchema
    );
  }

  /**
   * Retrieves a menu pricing rule by ID.
   *
   * @param id - Menu pricing rule ID
   * @returns Promise resolving to the menu pricing rule
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<MenuPricingRule> {
    return this.http.get<MenuPricingRule>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves pricing rules by menu set ID.
   *
   * @param menuSetId - Menu set ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByMenuSet(
    menuSetId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuPricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-menu-set/${menuSetId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuPricingRule>>(path);
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
  ): Promise<PaginatedResultType<MenuPricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-discount/${discountId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuPricingRule>>(path);
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
  ): Promise<PaginatedResultType<MenuPricingRule>> {
    const queryParams = new URLSearchParams();

    if (timestamp) queryParams.append('effectiveAt', timestamp.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuPricingRule>>(path);
  }

  /**
   * Updates an existing menu pricing rule.
   *
   * @param id - Menu pricing rule ID
   * @param data - Menu pricing rule update data
   * @returns Promise resolving to the updated menu pricing rule
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateMenuPricingRule): Promise<MenuPricingRule> {
    return this.http.patch<UpdateMenuPricingRule, MenuPricingRule>(
      `${this.resource_path}/${id}`,
      data,
      UpdateMenuPricingRuleSchema
    );
  }

  /**
   * Deletes a menu pricing rule.
   *
   * @param id - Menu pricing rule ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the rule is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists menu pricing rules with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of menu pricing rules
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuPricingRule>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuPricingRule>>(path);
  }

  /**
   * Creates multiple menu pricing rules in a single batch request.
   *
   * @param data - Array of menu pricing rule data (maximum 50 items)
   * @returns Promise resolving to paginated result of created menu pricing rules
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateMenuPricingRule[]
  ): Promise<PaginatedResultType<MenuPricingRule>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateMenuPricingRuleSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateMenuPricingRule[], PaginatedResultType<MenuPricingRule>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
