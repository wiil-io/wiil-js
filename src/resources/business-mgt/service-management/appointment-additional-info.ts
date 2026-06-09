/**
 * @fileoverview Appointment Additional Info resource for managing dynamic field values.
 * @module resources/service-management/appointment-additional-info
 */

import {
  AppointmentAdditionalInfo,
  CreateAppointmentAdditionalInfo,
  CreateAppointmentAdditionalInfoSchema,
  UpdateAppointmentAdditionalInfo,
  UpdateAppointmentAdditionalInfoSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';

/**
 * Resource class for managing appointment additional info in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing appointment
 * additional info records. These store dynamic field values captured during
 * appointment booking, supporting custom data collection per appointment.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Store additional info for an appointment
 * const info = await client.appointmentAdditionalInfo.create({
 *   businessServiceId: 'svc_123',
 *   appointmentId: 'apt_456',
 *   customerId: 'cust_789',
 *   data: {
 *     allergies: 'None',
 *     preferredStylist: 'Jane',
 *     notes: 'First time customer'
 *   }
 * });
 * ```
 */
export class AppointmentAdditionalInfoResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/appointment-additional-info';

  /**
   * Creates a new AppointmentAdditionalInfoResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates new appointment additional info.
   *
   * @param data - Appointment additional info data
   * @returns Promise resolving to the created appointment additional info
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const info = await client.appointmentAdditionalInfo.create({
   *   businessServiceId: 'svc_123',
   *   appointmentId: 'apt_456',
   *   customerId: 'cust_789',
   *   data: {
   *     medicalHistory: 'No known conditions',
   *     emergencyContact: '+1-555-0100'
   *   }
   * });
   * ```
   */
  public async create(data: CreateAppointmentAdditionalInfo): Promise<AppointmentAdditionalInfo> {
    return this.http.post<CreateAppointmentAdditionalInfo, AppointmentAdditionalInfo>(
      this.resource_path,
      data,
      CreateAppointmentAdditionalInfoSchema
    );
  }

  /**
   * Retrieves appointment additional info by ID.
   *
   * @param id - Appointment additional info ID
   * @returns Promise resolving to the appointment additional info
   *
   * @throws {@link WiilAPIError} - When the info is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const info = await client.appointmentAdditionalInfo.get('aai_123');
   * console.log('Custom data:', info.data);
   * ```
   */
  public async get(id: string): Promise<AppointmentAdditionalInfo> {
    return this.http.get<AppointmentAdditionalInfo>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves appointment additional info by appointment.
   *
   * @param appointmentId - Appointment ID
   * @returns Promise resolving to the appointment additional info
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const info = await client.appointmentAdditionalInfo.getByAppointment('apt_123');
   * console.log('Allergies:', info.data.allergies);
   * ```
   */
  public async getByAppointment(appointmentId: string): Promise<AppointmentAdditionalInfo> {
    return this.http.get<AppointmentAdditionalInfo>(
      `${this.resource_path}/by-appointment/${appointmentId}`
    );
  }

  /**
   * Retrieves appointment additional info by customer.
   *
   * @param customerId - Customer ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of appointment additional info
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const infos = await client.appointmentAdditionalInfo.getByCustomer('cust_123');
   * console.log(`Found ${infos.meta.totalCount} records for customer`);
   * ```
   */
  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AppointmentAdditionalInfo>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<AppointmentAdditionalInfo>>(path);
  }

  /**
   * Retrieves appointment additional info by business service.
   *
   * @param businessServiceId - Business service ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of appointment additional info
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const infos = await client.appointmentAdditionalInfo.getByBusinessService('svc_123');
   * console.log(`Found ${infos.meta.totalCount} records for service`);
   * ```
   */
  public async getByBusinessService(
    businessServiceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AppointmentAdditionalInfo>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-business-service/${businessServiceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<AppointmentAdditionalInfo>>(path);
  }

  /**
   * Updates existing appointment additional info.
   *
   * @param data - Appointment additional info update data (must include id)
   * @returns Promise resolving to the updated appointment additional info
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the info is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.appointmentAdditionalInfo.update({
   *   id: 'aai_123',
   *   data: {
   *     allergies: 'Penicillin',
   *     notes: 'Updated notes'
   *   }
   * });
   * ```
   */
  public async update(data: UpdateAppointmentAdditionalInfo): Promise<AppointmentAdditionalInfo> {
    return this.http.patch<UpdateAppointmentAdditionalInfo, AppointmentAdditionalInfo>(
      this.resource_path,
      data,
      UpdateAppointmentAdditionalInfoSchema
    );
  }

  /**
   * Deletes appointment additional info.
   *
   * @param id - Appointment additional info ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the info is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.appointmentAdditionalInfo.delete('aai_123');
   * if (deleted) {
   *   console.log('Appointment additional info deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists appointment additional info with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of appointment additional info
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.appointmentAdditionalInfo.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} appointment additional info records`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AppointmentAdditionalInfo>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<AppointmentAdditionalInfo>>(path);
  }
}
