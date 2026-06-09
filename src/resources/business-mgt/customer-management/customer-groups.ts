/**
 * @fileoverview Customer Groups resource for managing customer segmentation.
 * @module resources/customer-groups
 */

import {
  CustomerGroup,
  CreateCustomerGroup,
  CreateCustomerGroupSchema,
  UpdateCustomerGroup,
  UpdateCustomerGroupSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing customer groups in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * customer groups. Customer groups enable segmentation for pricing tiers and
 * special terms (e.g., Retail, Wholesale, VIP, Gold Tier).
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new customer group
 * const group = await client.customerGroups.create({
 *   name: 'VIP Customers',
 *   description: 'High-value customers with premium benefits',
 *   code: 'VIP',
 *   isDefault: false
 * });
 *
 * // Get a customer group by ID
 * const group = await client.customerGroups.get('group_123');
 *
 * // Get the default customer group
 * const defaultGroup = await client.customerGroups.getDefault();
 *
 * // Update a customer group
 * const updated = await client.customerGroups.update('group_123', {
 *   description: 'Updated description'
 * });
 *
 * // List all customer groups
 * const groups = await client.customerGroups.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete a customer group
 * const deleted = await client.customerGroups.delete('group_123');
 * ```
 */
export class CustomerGroupsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/customer-groups';

  /**
   * Creates a new CustomerGroupsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new customer group.
   *
   * @param data - Customer group data
   * @returns Promise resolving to the created customer group
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const group = await client.customerGroups.create({
   *   name: 'Wholesale',
   *   description: 'Wholesale customers with bulk pricing',
   *   code: 'WS',
   *   isDefault: false
   * });
   * console.log('Created group:', group.id);
   * ```
   */
  public async create(data: CreateCustomerGroup): Promise<CustomerGroup> {
    return this.http.post<CreateCustomerGroup, CustomerGroup>(
      this.resource_path,
      data,
      CreateCustomerGroupSchema
    );
  }

  /**
   * Retrieves a customer group by ID.
   *
   * @param id - Customer group ID
   * @returns Promise resolving to the customer group
   *
   * @throws {@link WiilAPIError} - When the group is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const group = await client.customerGroups.get('group_123');
   * console.log('Group:', group.name);
   * console.log('Code:', group.code);
   * console.log('Is Default:', group.isDefault);
   * ```
   */
  public async get(id: string): Promise<CustomerGroup> {
    return this.http.get<CustomerGroup>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a customer group by code.
   *
   * @param code - Customer group code (e.g., 'VIP', 'WS', 'GOLD')
   * @returns Promise resolving to the customer group or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const group = await client.customerGroups.getByCode('VIP');
   * if (group) {
   *   console.log('Found group:', group.name);
   * }
   * ```
   */
  public async getByCode(code: string): Promise<CustomerGroup | null> {
    return this.http.get<CustomerGroup | null>(`${this.resource_path}/code/${encodeURIComponent(code)}`);
  }

  /**
   * Retrieves the default customer group.
   *
   * @returns Promise resolving to the default customer group or null if none set
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const defaultGroup = await client.customerGroups.getDefault();
   * if (defaultGroup) {
   *   console.log('Default group:', defaultGroup.name);
   * }
   * ```
   */
  public async getDefault(): Promise<CustomerGroup | null> {
    return this.http.get<CustomerGroup | null>(`${this.resource_path}/default`);
  }

  /**
   * Updates an existing customer group.
   *
   * @param id - Customer group ID
   * @param data - Customer group update data
   * @returns Promise resolving to the updated customer group
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the group is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.customerGroups.update('group_123', {
   *   name: 'Premium VIP',
   *   description: 'Updated premium tier',
   *   isDefault: true
   * });
   * console.log('Updated group:', updated.name);
   * ```
   */
  public async update(id: string, data: UpdateCustomerGroup): Promise<CustomerGroup> {
    return this.http.patch<UpdateCustomerGroup, CustomerGroup>(
      `${this.resource_path}/${id}`,
      data,
      UpdateCustomerGroupSchema
    );
  }

  /**
   * Deletes a customer group.
   *
   * @param id - Customer group ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the group is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting a customer group. Customers in this group may be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.customerGroups.delete('group_123');
   * if (deleted) {
   *   console.log('Customer group deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists customer groups with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of customer groups
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.customerGroups.list();
   *
   * // List with custom pagination
   * const page2 = await client.customerGroups.list({
   *   page: 2,
   *   pageSize: 50
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} groups`);
   * page2.data.forEach(group => {
   *   console.log(`- ${group.name} (${group.code})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<CustomerGroup>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<CustomerGroup>>(path);
  }

  /**
   * Creates multiple customer groups in a single batch request.
   *
   * @param data - Array of customer group data (maximum 50 items)
   * @returns Promise resolving to paginated result of created customer groups
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const groups = await client.customerGroups.createBatch([
   *   { name: 'Retail', code: 'RTL', isDefault: true },
   *   { name: 'Wholesale', code: 'WS', isDefault: false },
   *   { name: 'VIP', code: 'VIP', isDefault: false }
   * ]);
   * console.log(`Created ${groups.data.length} customer groups`);
   * ```
   */
  public async createBatch(
    data: CreateCustomerGroup[]
  ): Promise<PaginatedResultType<CustomerGroup>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateCustomerGroupSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateCustomerGroup[], PaginatedResultType<CustomerGroup>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
