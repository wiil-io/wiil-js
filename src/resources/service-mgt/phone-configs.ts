/**
 * @fileoverview Phone Configurations resource for managing phone configuration entities.
 * @module resources/service-mgt/phone-configs
 */

import {
  PhoneConfiguration,
  PhoneNumberPurchase,
  CreatePhoneNumberPurchaseSchema,
  CreatePhoneNumberPurchase,
  UpdatePhoneConfigurationSchema,
  UpdatePhoneConfiguration,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing phone configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * phone configurations. Phone configurations manage phone numbers and telephony
 * settings for voice-based AI deployments. All methods require proper
 * authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Purchase a new phone number
 * const purchase = await client.phoneConfigs.purchase({
 *   phoneNumber: '+1234567890',
 *   countryCode: 'US',
 *   capabilities: ['voice', 'sms']
 * });
 *
 * // Get a phone configuration by ID
 * const config = await client.phoneConfigs.get('phone_123');
 *
 * // Get phone configuration by phone number
 * const configByNumber = await client.phoneConfigs.getByPhoneNumber('+1234567890');
 *
 * // List all phone configurations
 * const configs = await client.phoneConfigs.list({
 *   page: 1,
 *   pageSize: 20
 * });
 * ```
 */
export class PhoneConfigurationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/phone-configurations';

  /**
   * Creates a new PhoneConfigurationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Purchases a new phone number and creates a phone configuration.
   *
   * @param data - Phone number purchase data
   * @returns Promise resolving to the phone number purchase result
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async purchase(data: CreatePhoneNumberPurchase): Promise<PhoneNumberPurchase> {
    return this.http.post<CreatePhoneNumberPurchase, PhoneNumberPurchase>(
      `${this.resource_path}/purchase`,
      data,
      CreatePhoneNumberPurchaseSchema
    );
  }

  /**
   * Retrieves a phone configuration by ID.
   *
   * @param id - Phone configuration ID
   * @returns Promise resolving to the phone configuration
   *
   * @throws {@link WiilAPIError} - When the phone configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<PhoneConfiguration> {
    return this.http.get<PhoneConfiguration>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a phone configuration by phone number.
   *
   * @param phoneNumber - Phone number
   * @returns Promise resolving to the phone configuration
   *
   * @throws {@link WiilAPIError} - When the phone configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByPhoneNumber(phoneNumber: string): Promise<PhoneConfiguration> {
    return this.http.get<PhoneConfiguration>(`${this.resource_path}/by-phone-number/${encodeURIComponent(phoneNumber)}`);
  }

  /**
   * Retrieves a phone configuration by request ID.
   *
   * @param requestId - Phone request ID
   * @returns Promise resolving to the phone configuration
   *
   * @throws {@link WiilAPIError} - When the phone configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByRequestId(requestId: string): Promise<PhoneConfiguration> {
    return this.http.get<PhoneConfiguration>(`${this.resource_path}/by-request/${requestId}`);
  }

  /**
   * Updates an existing phone configuration.
   *
   * @param data - Phone configuration update data (must include id)
   * @returns Promise resolving to the updated phone configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the phone configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdatePhoneConfiguration): Promise<PhoneConfiguration> {
    return this.http.patch<UpdatePhoneConfiguration, PhoneConfiguration>(
      this.resource_path,
      data,
      UpdatePhoneConfigurationSchema
    );
  }

  /**
   * Deletes a phone configuration.
   *
   * @param id - Phone configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the phone configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists phone configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of phone configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<PhoneConfiguration>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<PhoneConfiguration>>(path);
  }
}
