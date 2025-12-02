/**
 * @fileoverview Business Services resource for managing business service configurations.
 * @module resources/business-services
 */

import {
  BusinessService,
  CreateBusinessService,
  CreateBusinessServiceSchema,
  UpdateBusinessService,
  UpdateBusinessServiceSchema,
  ServiceQRCode,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing business services in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * business services. Business services represent the services offered by a business
 * within an organization (e.g., haircut, massage, consultation). Supports QR code
 * generation for service appointment booking. All methods require proper authentication
 * via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new business service
 * const service = await client.businessServices.create({
 *   name: 'Professional Haircut',
 *   description: 'Premium haircut service with styling',
 *   duration: 45,
 *   price: 50.00
 * });
 *
 * // Get a business service by ID
 * const service = await client.businessServices.get('service_123');
 *
 * // Update a business service
 * const updated = await client.businessServices.update({
 *   id: 'service_123',
 *   name: 'Premium Haircut & Style',
 *   price: 60.00
 * });
 *
 * // List all business services
 * const services = await client.businessServices.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Generate QR code for appointments
 * const qrCode = await client.businessServices.generateQRCode('service_123');
 *
 * // Delete a business service
 * const deleted = await client.businessServices.delete('service_123');
 * ```
 */
export class BusinessServicesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/business-services';

  /**
   * Creates a new BusinessServicesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new business service.
   *
   * @param data - Business service data
   * @returns Promise resolving to the created business service
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const service = await client.businessServices.create({
   *   name: 'Massage Therapy',
   *   description: '60-minute therapeutic massage',
   *   duration: 60,
   *   price: 80.00,
   *   metadata: {
   *     category: 'wellness',
   *     therapist: 'certified'
   *   }
   * });
   * console.log('Created service:', service.id);
   * ```
   */
  public async create(data: CreateBusinessService): Promise<BusinessService> {
    return this.http.post<CreateBusinessService, BusinessService>(
      this.resource_path,
      data,
      CreateBusinessServiceSchema
    );
  }

  /**
   * Retrieves a business service by ID.
   *
   * @param id - Business service ID
   * @returns Promise resolving to the business service
   *
   * @throws {@link WiilAPIError} - When the service is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const service = await client.businessServices.get('service_123');
   * console.log('Service:', service.name);
   * console.log('Duration:', service.duration, 'minutes');
   * console.log('Price:', service.price);
   * ```
   */
  public async get(id: string): Promise<BusinessService> {
    return this.http.get<BusinessService>(`${this.resource_path}/${id}`);
  }

  /**
   * Updates an existing business service.
   *
   * @param data - Business service update data (must include id)
   * @returns Promise resolving to the updated business service
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the service is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.businessServices.update({
   *   id: 'service_123',
   *   name: 'Premium Massage Therapy',
   *   price: 90.00,
   *   metadata: {
   *     updatedBy: 'admin-user',
   *     featured: true
   *   }
   * });
   * console.log('Updated service:', updated.name);
   * ```
   */
  public async update(data: UpdateBusinessService): Promise<BusinessService> {
    return this.http.patch<UpdateBusinessService, BusinessService>(
      this.resource_path,
      data,
      UpdateBusinessServiceSchema
    );
  }

  /**
   * Deletes a business service.
   *
   * @param id - Business service ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the service is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting a business service. Associated appointments may be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.businessServices.delete('service_123');
   * if (deleted) {
   *   console.log('Service deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists business services with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of business services
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.businessServices.list();
   *
   * // List with custom pagination
   * const page2 = await client.businessServices.list({
   *   page: 2,
   *   pageSize: 50
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} services`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(service => {
   *   console.log(`- ${service.name}: $${service.price}`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessService>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessService>>(path);
  }

  /**
   * Generates a QR code for service appointment booking.
   *
   * @param serviceId - Optional specific service ID for direct appointment booking
   * @returns Promise resolving to QR code data
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * If serviceId is provided, the QR code will link directly to booking that specific service.
   * If serviceId is omitted, the QR code will link to a general service selection page.
   *
   * @example
   * ```typescript
   * // Generate QR code for specific service
   * const qrCode = await client.businessServices.generateQRCode('service_123');
   * console.log('QR Code URL:', qrCode.url);
   * console.log('QR Code Data:', qrCode.qrCodeData);
   *
   * // Generate general service QR code
   * const generalQR = await client.businessServices.generateQRCode();
   * ```
   */
  public async generateQRCode(serviceId?: string): Promise<ServiceQRCode> {
    const queryParams = new URLSearchParams();
    if (serviceId) queryParams.append('serviceId', serviceId);

    const path = `${this.resource_path}/qr-code/generate${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<ServiceQRCode>(path);
  }
}
