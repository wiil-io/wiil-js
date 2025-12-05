/**
 * @fileoverview Telephony Provider resource for managing phone numbers and telephony services.
 * @module resources/service-mgt/telephony-provider
 */


import { BasePhoneNumberInfo, PhoneNumberPricing, PhoneProviderRegion, ProviderType } from 'wiil-core-js';
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
 * Resource class for managing telephony provider services in the Travnex Platform.
 *
 * @remarks
 * Provides methods for retrieving available regions, searching for phone numbers,
 * and getting pricing information from various telephony providers (SignalWire, Twilio, etc.).
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * import { ProviderType } from 'wiil-core-js';
 *
 * const client = new TravnexClient({ apiKey: 'your-api-key' });
 *
 * // Get available regions for SignalWire
 * const regions = await client.telephonyProvider.getRegions(ProviderType.SIGNALWIRE);
 *
 * // Search for phone numbers in a specific region
 * const numbers = await client.telephonyProvider.getPhoneNumbers(ProviderType.SIGNALWIRE, 'US', {
 *   areaCode: '206'
 * });
 *
 * // Get pricing for a region
 * const pricing = await client.telephonyProvider.getPricing(ProviderType.SIGNALWIRE, 'US');
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

  /**
   * Retrieves available regions for phone numbers by provider.
   *
   * @param provider - Telephony provider (e.g., 'SIGNALWIRE', 'TWILIO')
   * @returns Promise resolving to array of available regions
   *
   * @throws {@link TravnexAPIError} - When the API returns an error
   * @throws {@link TravnexNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const regions = await client.telephonyProvider.getRegions(ProviderType.SIGNALWIRE);
   * console.log(`Found ${regions.length} regions`);
   * regions.forEach(region => {
   *   console.log(`- ${region.regionName} (${region.regionId})`);
   * });
   * ```
   */
  public async getRegions(
    provider: ProviderType
  ): Promise<PhoneProviderRegion[]> {
    return this.http.get<PhoneProviderRegion[]>(
      `${this.resource_path}/${provider}/regions`
    );
  }

  /**
   * Retrieves available phone numbers for a specific provider and region.
   *
   * @param provider - Telephony provider (e.g., 'SIGNALWIRE', 'TWILIO')
   * @param countryCode - Country code (e.g., 'US', 'CA')
   * @param options - Optional search filters
   * @returns Promise resolving to array of available phone numbers
   *
   * @throws {@link TravnexAPIError} - When the API returns an error
   * @throws {@link TravnexNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // Search for phone numbers in US
   * const numbers = await client.telephonyProvider.getPhoneNumbers(ProviderType.SIGNALWIRE, 'US');
   *
   * // Search with area code filter
   * const seattleNumbers = await client.telephonyProvider.getPhoneNumbers(ProviderType.SIGNALWIRE, 'US', {
   *   areaCode: '206'
   * });
   *
   * // Search for specific number pattern
   * const customNumbers = await client.telephonyProvider.getPhoneNumbers(ProviderType.SIGNALWIRE, 'US', {
   *   contains: '555',
   *   postalCode: '98101'
   * });
   *
   * numbers.forEach(number => {
   *   console.log(`${number.phoneNumber} - ${number.locality}, ${number.region}`);
   * });
   * ```
   */
  public async getPhoneNumbers(
    provider: ProviderType,
    countryCode: string,
    options?: PhoneNumberSearchOptions
  ): Promise<BasePhoneNumberInfo[]> {
    const queryParams = new URLSearchParams({ countryCode });

    if (options?.areaCode) queryParams.append('areaCode', options.areaCode);
    if (options?.contains) queryParams.append('contains', options.contains);
    if (options?.postalCode) queryParams.append('postalCode', options.postalCode);

    return this.http.get<BasePhoneNumberInfo[]>(
      `${this.resource_path}/${provider}/numbers?${queryParams.toString()}`
    );
  }

  /**
   * Retrieves pricing information for phone numbers by provider and region.
   *
   * @param provider - Telephony provider (e.g., 'SIGNALWIRE', 'TWILIO')
   * @param countryCode - Country code (e.g., 'US', 'CA')
   * @returns Promise resolving to array of pricing information
   *
   * @throws {@link TravnexAPIError} - When the API returns an error
   * @throws {@link TravnexNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const pricing = await client.telephonyProvider.getPricing(ProviderType.SIGNALWIRE, 'US');
   * pricing.forEach(price => {
   *   console.log(`Number Type: ${price.number_type}`);
   *   console.log(`Price: $${price.price}`);
   * });
   * ```
   */
  public async getPricing(
    provider: ProviderType,
    countryCode: string
  ): Promise<PhoneNumberPricing[]> {
    const queryParams = new URLSearchParams({ countryCode });

    return this.http.get<PhoneNumberPricing[]>(
      `${this.resource_path}/${provider}/pricing?${queryParams.toString()}`
    );
  }
}
