/**
 * @fileoverview Customers resource for managing customer records.
 * @module resources/customers
 */

import {
  Customer,
  CreateCustomer,
  CreateCustomerSchema,
  UpdateCustomer,
  UpdateCustomerSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing customers in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * customers. Customers represent individuals or entities that interact with
 * the business. Supports searching by phone number, email, or general query.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new customer
 * const customer = await client.customers.create({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email: 'john.doe@example.com',
 *   phoneNumber: '+1234567890'
 * });
 *
 * // Get a customer by ID
 * const customer = await client.customers.get('cust_123');
 *
 * // Search customers
 * const results = await client.customers.search('john', { page: 1, pageSize: 10 });
 *
 * // Get customer by phone
 * const customer = await client.customers.getByPhone('+1234567890');
 *
 * // Update a customer
 * const updated = await client.customers.update('cust_123', {
 *   email: 'john.newemail@example.com'
 * });
 *
 * // List all customers
 * const customers = await client.customers.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete a customer
 * const deleted = await client.customers.delete('cust_123');
 * ```
 */
export class CustomersResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/customers';

  /**
   * Creates a new CustomersResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new customer.
   *
   * @param data - Customer data
   * @returns Promise resolving to the created customer
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const customer = await client.customers.create({
   *   firstName: 'Jane',
   *   lastName: 'Smith',
   *   email: 'jane.smith@example.com',
   *   phoneNumber: '+1987654321',
   *   metadata: {
   *     source: 'website',
   *     referralCode: 'FRIEND2023'
   *   }
   * });
   * console.log('Created customer:', customer.id);
   * ```
   */
  public async create(data: CreateCustomer): Promise<Customer> {
    return this.http.post<CreateCustomer, Customer>(
      this.resource_path,
      data,
      CreateCustomerSchema
    );
  }

  /**
   * Retrieves a customer by ID.
   *
   * @param id - Customer ID
   * @returns Promise resolving to the customer
   *
   * @throws {@link WiilAPIError} - When the customer is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const customer = await client.customers.get('cust_123');
   * console.log('Customer:', customer.firstName, customer.lastName);
   * console.log('Email:', customer.email);
   * console.log('Phone:', customer.phoneNumber);
   * ```
   */
  public async get(id: string): Promise<Customer> {
    return this.http.get<Customer>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a customer by phone number.
   *
   * @param phoneNumber - Customer phone number
   * @returns Promise resolving to the customer or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const customer = await client.customers.getByPhone('+1234567890');
   * if (customer) {
   *   console.log('Found customer:', customer.firstName);
   * } else {
   *   console.log('No customer found with that phone number');
   * }
   * ```
   */
  public async getByPhone(phoneNumber: string): Promise<Customer | null> {
    return this.http.get<Customer | null>(`${this.resource_path}/phone/${encodeURIComponent(phoneNumber)}`);
  }

  /**
   * Retrieves a customer by email address.
   *
   * @param email - Customer email address
   * @returns Promise resolving to the customer or null if not found
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const customer = await client.customers.getByEmail('john@example.com');
   * if (customer) {
   *   console.log('Found customer:', customer.id);
   * }
   * ```
   */
  public async getByEmail(email: string): Promise<Customer | null> {
    return this.http.get<Customer | null>(`${this.resource_path}/email/${encodeURIComponent(email)}`);
  }

  /**
   * Searches customers by query string.
   *
   * @param query - Search query string
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated search results
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * The search query will match against customer names, email, and phone number.
   *
   * @example
   * ```typescript
   * const results = await client.customers.search('john', {
   *   page: 1,
   *   pageSize: 20
   * });
   *
   * console.log(`Found ${results.meta.totalCount} customers`);
   * results.data.forEach(customer => {
   *   console.log(`- ${customer.firstName} ${customer.lastName}`);
   * });
   * ```
   */
  public async search(
    query: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Customer>> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/search?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<Customer>>(path);
  }

  /**
   * Updates an existing customer.
   *
   * @param id - Customer ID
   * @param data - Customer update data
   * @returns Promise resolving to the updated customer
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the customer is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.customers.update('cust_123', {
   *   email: 'newemail@example.com',
   *   phoneNumber: '+1555555555',
   *   metadata: {
   *     updatedBy: 'admin-user',
   *     loyaltyTier: 'gold'
   *   }
   * });
   * console.log('Updated customer:', updated.email);
   * ```
   */
  public async update(id: string, data: UpdateCustomer): Promise<Customer> {
    return this.http.patch<UpdateCustomer, Customer>(
      `${this.resource_path}/${id}`,
      data,
      UpdateCustomerSchema
    );
  }

  /**
   * Deletes a customer.
   *
   * @param id - Customer ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the customer is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting a customer. Associated data may be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.customers.delete('cust_123');
   * if (deleted) {
   *   console.log('Customer deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists customers with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of customers
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.customers.list();
   *
   * // List with custom pagination
   * const page2 = await client.customers.list({
   *   page: 2,
   *   pageSize: 50
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} customers`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(customer => {
   *   console.log(`- ${customer.firstName} ${customer.lastName} (${customer.email})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Customer>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Customer>>(path);
  }
}
