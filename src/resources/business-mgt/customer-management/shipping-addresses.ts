/**
 * @fileoverview Shipping Addresses resource for managing customer delivery addresses.
 * @module resources/shipping-addresses
 */

import {
  ShippingAddress,
  CreateShippingAddress,
  CreateShippingAddressSchema,
  UpdateShippingAddress,
  UpdateShippingAddressSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing shipping addresses in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * shipping addresses. Shipping addresses store customer delivery addresses with
 * recipient details and special delivery instructions.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new shipping address
 * const address = await client.shippingAddresses.create({
 *   customerId: 'cust_123',
 *   street: '123 Main St',
 *   city: 'New York',
 *   state: 'NY',
 *   postalCode: '10001',
 *   country: 'US',
 *   isPrimary: true
 * });
 *
 * // Get a shipping address by ID
 * const address = await client.shippingAddresses.get('addr_123');
 *
 * // Get addresses by customer
 * const addresses = await client.shippingAddresses.getByCustomer('cust_123');
 *
 * // Update a shipping address
 * const updated = await client.shippingAddresses.update('addr_123', {
 *   street: '456 Oak Ave'
 * });
 *
 * // List all shipping addresses
 * const addresses = await client.shippingAddresses.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete a shipping address
 * const deleted = await client.shippingAddresses.delete('addr_123');
 * ```
 */
export class ShippingAddressesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/shipping-addresses';

  /**
   * Creates a new ShippingAddressesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new shipping address.
   *
   * @param data - Shipping address data
   * @returns Promise resolving to the created shipping address
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const address = await client.shippingAddresses.create({
   *   customerId: 'cust_123',
   *   street: '123 Main St',
   *   street2: 'Apt 4B',
   *   city: 'New York',
   *   state: 'NY',
   *   postalCode: '10001',
   *   country: 'US',
   *   recipientName: 'John Doe',
   *   phoneNumber: '+12125551234',
   *   instructions: 'Leave at front door',
   *   isPrimary: true
   * });
   * console.log('Created address:', address.id);
   * ```
   */
  public async create(data: CreateShippingAddress): Promise<ShippingAddress> {
    return this.http.post<CreateShippingAddress, ShippingAddress>(
      this.resource_path,
      data,
      CreateShippingAddressSchema
    );
  }

  /**
   * Retrieves a shipping address by ID.
   *
   * @param id - Shipping address ID
   * @returns Promise resolving to the shipping address
   *
   * @throws {@link WiilAPIError} - When the address is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const address = await client.shippingAddresses.get('addr_123');
   * console.log('Address:', address.street);
   * console.log('City:', address.city);
   * console.log('Is Primary:', address.isPrimary);
   * ```
   */
  public async get(id: string): Promise<ShippingAddress> {
    return this.http.get<ShippingAddress>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves shipping addresses by customer ID.
   *
   * @param customerId - Customer ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of shipping addresses
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const addresses = await client.shippingAddresses.getByCustomer('cust_123', {
   *   page: 1,
   *   pageSize: 10
   * });
   *
   * console.log(`Found ${addresses.meta.totalCount} addresses`);
   * addresses.data.forEach(addr => {
   *   console.log(`- ${addr.street}, ${addr.city} ${addr.isPrimary ? '(Primary)' : ''}`);
   * });
   * ```
   */
  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ShippingAddress>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ShippingAddress>>(path);
  }

  /**
   * Retrieves the primary shipping address for a customer.
   *
   * @param customerId - Customer ID
   * @returns Promise resolving to the primary shipping address or null if none set
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const primaryAddress = await client.shippingAddresses.getPrimary('cust_123');
   * if (primaryAddress) {
   *   console.log('Primary address:', primaryAddress.street);
   * }
   * ```
   */
  public async getPrimary(customerId: string): Promise<ShippingAddress | null> {
    return this.http.get<ShippingAddress | null>(`${this.resource_path}/primary/${customerId}`);
  }

  /**
   * Updates an existing shipping address.
   *
   * @param id - Shipping address ID
   * @param data - Shipping address update data
   * @returns Promise resolving to the updated shipping address
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the address is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.shippingAddresses.update('addr_123', {
   *   street: '789 New Ave',
   *   instructions: 'Ring doorbell twice',
   *   isPrimary: true
   * });
   * console.log('Updated address:', updated.street);
   * ```
   */
  public async update(id: string, data: UpdateShippingAddress): Promise<ShippingAddress> {
    return this.http.patch<UpdateShippingAddress, ShippingAddress>(
      `${this.resource_path}/${id}`,
      data,
      UpdateShippingAddressSchema
    );
  }

  /**
   * Sets a shipping address as primary for a customer.
   *
   * @param id - Shipping address ID to set as primary
   * @returns Promise resolving to the updated shipping address
   *
   * @throws {@link WiilAPIError} - When the address is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * Setting an address as primary will automatically unset any other primary
   * addresses for the same customer.
   *
   * @example
   * ```typescript
   * const primary = await client.shippingAddresses.setPrimary('addr_123');
   * console.log('New primary address:', primary.street);
   * ```
   */
  public async setPrimary(id: string): Promise<ShippingAddress> {
    return this.http.post<Record<string, never>, ShippingAddress>(
      `${this.resource_path}/${id}/set-primary`,
      {}
    );
  }

  /**
   * Deletes a shipping address.
   *
   * @param id - Shipping address ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the address is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting a shipping address.
   *
   * @example
   * ```typescript
   * const deleted = await client.shippingAddresses.delete('addr_123');
   * if (deleted) {
   *   console.log('Shipping address deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists shipping addresses with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of shipping addresses
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.shippingAddresses.list();
   *
   * // List with custom pagination
   * const page2 = await client.shippingAddresses.list({
   *   page: 2,
   *   pageSize: 50
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} addresses`);
   * page2.data.forEach(addr => {
   *   console.log(`- ${addr.street}, ${addr.city}, ${addr.country}`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ShippingAddress>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ShippingAddress>>(path);
  }

  /**
   * Creates multiple shipping addresses in a single batch request.
   *
   * @param data - Array of shipping address data (maximum 50 items)
   * @returns Promise resolving to paginated result of created shipping addresses
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const addresses = await client.shippingAddresses.createBatch([
   *   {
   *     customerId: 'cust_123',
   *     street: '123 Main St',
   *     city: 'New York',
   *     state: 'NY',
   *     postalCode: '10001',
   *     country: 'US',
   *     isPrimary: true
   *   },
   *   {
   *     customerId: 'cust_123',
   *     street: '456 Oak Ave',
   *     city: 'Los Angeles',
   *     state: 'CA',
   *     postalCode: '90001',
   *     country: 'US',
   *     isPrimary: false
   *   }
   * ]);
   * console.log(`Created ${addresses.data.length} shipping addresses`);
   * ```
   */
  public async createBatch(
    data: CreateShippingAddress[]
  ): Promise<PaginatedResultType<ShippingAddress>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateShippingAddressSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateShippingAddress[], PaginatedResultType<ShippingAddress>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
