/**
 * @fileoverview Organizations resource for reading organization information.
 * @module resources/organizations
 */

import {
  Organization,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for reading organization information in the WIIL Platform.
 *
 * @remarks
 * Provides read-only access to retrieve the organization that owns the API key.
 * This resource only supports retrieving organization information - no create,
 * update, delete, or list operations are available.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get the organization that owns the API key
 * const organization = await client.organizations.get();
 * console.log('Organization:', organization.companyName);
 * console.log('Business Vertical:', organization.businessVerticalId);
 * ```
 */
export class OrganizationsResource {
  private readonly http: HttpClient;

  /**
   * Creates a new OrganizationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves the organization that owns the API key.
   *
   * @returns Promise resolving to the organization
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const org = await client.organizations.get();
   * console.log('Organization ID:', org.id);
   * console.log('Company Name:', org.companyName);
   * console.log('Business Vertical:', org.businessVerticalId);
   * console.log('Platform Email:', org.platformEmail);
   * console.log('Service Status:', org.serviceStatus);
   * ```
   */
  public async get(): Promise<Organization> {
    return this.http.get<Organization>('/organizations');
  }
}
