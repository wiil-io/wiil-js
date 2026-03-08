/**
 * @fileoverview Telephony Provider resource for managing phone numbers and telephony services.
 * @module resources/service-mgt/telephony-provider
 */


import {
  BasePhoneNumberInfo,
  PhoneNumberPricing,
  BusinessPhoneNumberPurchaseRequest,
  PhoneNumberPurchase,
  PhonePurchaseStatus,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Options for searching available phone numbers.
 */
export interface PhoneNumberSearchOptions {
  /** Area code filter (e.g., '206', '415') */
  areaCode?: string;
  /** Number pattern to search for */
  contains?: string;
  /** Postal code filter */
  postalCode?: string;
}

/**
 * Resource class for managing telephony provider services in the WIIL Platform.
 *
 * @remarks
 * Provides methods for searching for phone numbers, getting pricing information,
 * and purchasing phone numbers. All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Search for phone numbers
 * const numbers = await client.telephonyProvider.getPhoneNumbers({
 *   areaCode: '206'
 * });
 *
 * // Get pricing
 * const pricing = await client.telephonyProvider.getPricing();
 *
 * // Purchase a phone number
 * const purchase = await client.telephonyProvider.purchase({
 *   phoneNumber: '+12065551234'
 * });
 * ```
 */
export class TelephonyProviderResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/phone-configurations/telephony-provider';

  /**
   * Creates a new TelephonyProviderResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  // /**
  //  * Retrieves available regions for phone numbers by provider.
  //  *
  //  * @param provider - Telephony provider (e.g., 'SIGNALWIRE', 'TWILIO')
  //  * @returns Promise resolving to array of available regions
  //  *
  //  * @throws {@link TravnexAPIError} - When the API returns an error
  //  * @throws {@link TravnexNetworkError} - When network communication fails
  //  *
  //  * @example
  //  * ```typescript
  //  * const regions = await client.telephonyProvider.getRegions(ProviderType.SIGNALWIRE);
  //  * console.log(`Found ${regions.length} regions`);
  //  * regions.forEach(region => {
  //  *   console.log(`- ${region.regionName} (${region.regionId})`);
  //  * });
  //  * ```
  //  */
  // public async getRegions(
  //   provider: ProviderType
  // ): Promise<PhoneProviderRegion[]> {
  //   return this.http.get<PhoneProviderRegion[]>(
  //     `${this.resource_path}/${provider}/regions`
  //   );
  // }

  /**
   * Retrieves available phone numbers.
   *
   * @param options - Optional search filters
   * @returns Promise resolving to array of available phone numbers
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // Search for phone numbers
   * const numbers = await client.telephonyProvider.getPhoneNumbers();
   *
   * // Search with area code filter
   * const seattleNumbers = await client.telephonyProvider.getPhoneNumbers({
   *   areaCode: '206'
   * });
   *
   * numbers.forEach(number => {
   *   console.log(`${number.phoneNumber} - ${number.locality}, ${number.region}`);
   * });
   * ```
   */
  public async getPhoneNumbers(
    options?: PhoneNumberSearchOptions
  ): Promise<BasePhoneNumberInfo[]> {
    const queryParams = new URLSearchParams();

    if (options?.areaCode) queryParams.append('areaCode', options.areaCode);
    if (options?.contains) queryParams.append('contains', options.contains);
    if (options?.postalCode) queryParams.append('postalCode', options.postalCode);

    const query = queryParams.toString();
    return this.http.get<BasePhoneNumberInfo[]>(
      `${this.resource_path}/numbers${query ? `?${query}` : ''}`
    );
  }

  /**
   * Retrieves pricing information for phone numbers.
   *
   * @returns Promise resolving to array of pricing information
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const pricing = await client.telephonyProvider.getPricing();
   * pricing.forEach(price => {
   *   console.log(`Number Type: ${price.number_type}`);
   *   console.log(`Price: $${price.price}`);
   * });
   * ```
   */
  public async getPricing(): Promise<PhoneNumberPricing[]> {
    return this.http.get<PhoneNumberPricing[]>(
      `${this.resource_path}/pricing`
    );
  }

  /**
   * Purchases a phone number and polls until the purchase completes.
   *
   * @param data - Phone number purchase request data
   * @returns Promise resolving to the completed phone number purchase result
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   * @throws {@link Error} - When polling times out before completion
   *
   * @remarks
   * This method initiates a phone number purchase and automatically polls
   * until the purchase reaches a terminal state (completed, failed, or cancelled).
   * The polling interval is 5 seconds with a maximum timeout of 2 minutes.
   *
   * @example
   * ```typescript
   * const purchase = await client.telephonyProvider.purchase({
   *   phoneNumber: '+12065551234'
   * });
   * console.log('Purchase status:', purchase.status);
   * console.log('Purchased:', purchase.phoneNumber);
   * ```
   */
  public async purchase(
    data: BusinessPhoneNumberPurchaseRequest
  ): Promise<PhoneNumberPurchase> {
    const POLL_INTERVAL = 5000; // 5 seconds
    const POLL_TIMEOUT = 120000; // 2 minutes

    const initialResult = await this.http.post<BusinessPhoneNumberPurchaseRequest, PhoneNumberPurchase>(
      `${this.resource_path}/purchase`,
      data
    );

    const terminalStates = [
      PhonePurchaseStatus.COMPLETED,
      PhonePurchaseStatus.FAILED,
      PhonePurchaseStatus.CANCELLED,
    ];

    if (terminalStates.includes(initialResult.status as PhonePurchaseStatus)) {
      return initialResult;
    }

    const startTime = Date.now();

    while (Date.now() - startTime < POLL_TIMEOUT) {
      await this.sleep(POLL_INTERVAL);

      const status = await this.getPurchaseStatus(initialResult.id);

      if (terminalStates.includes(status.status as PhonePurchaseStatus)) {
        return status;
      }
    }

    throw new Error(
      `Phone number purchase timed out after ${POLL_TIMEOUT}ms. Last status: ${initialResult.status}`
    );
  }

  /**
   * Utility method to sleep for a specified duration.
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retrieves the status of a phone number purchase request.
   *
   * @param requestId - The purchase request ID returned from the purchase() method
   * @returns Promise resolving to the phone number purchase details
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // After initiating a purchase
   * const purchase = await client.telephonyProvider.purchase({
   *   phoneNumber: '+12065551234'
   * });
   *
   * // Poll for completion
   * const status = await client.telephonyProvider.getPurchaseStatus(purchase.id);
   * console.log('Purchase status:', status.status);
   * ```
   */
  public async getPurchaseStatus(requestId: string): Promise<PhoneNumberPurchase> {
    return this.http.get<PhoneNumberPurchase>(
      `${this.resource_path}/purchase-request/${requestId}`
    );
  }
}
