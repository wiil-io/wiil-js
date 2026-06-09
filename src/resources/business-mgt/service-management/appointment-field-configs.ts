/**
 * @fileoverview Appointment Field Configs resource for managing organization-level field configurations.
 * @module resources/service-management/appointment-field-configs
 */

import {
  AppointmentFieldConfig,
  CreateAppointmentFieldConfig,
  CreateAppointmentFieldConfigSchema,
  UpdateAppointmentFieldConfig,
  UpdateAppointmentFieldConfigSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';

/**
 * Resource class for managing appointment field configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing appointment
 * field configurations. These define organization-level field libraries for
 * appointment booking forms, including field definitions, groupings, and
 * customer data reuse settings.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a field configuration
 * const config = await client.appointmentFieldConfigs.create({
 *   fields: [
 *     { fieldKey: 'allergies', fieldType: 'text', label: 'Allergies' },
 *     { fieldKey: 'notes', fieldType: 'textarea', label: 'Special Notes' }
 *   ],
 *   groups: [
 *     { groupKey: 'medical', label: 'Medical Information' }
 *   ],
 *   reuseDetails: true,
 *   ensureEmail: true,
 *   ensurePhone: true
 * });
 * ```
 */
export class AppointmentFieldConfigsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/appointment-field-configs';

  /**
   * Creates a new AppointmentFieldConfigsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new appointment field configuration.
   *
   * @param data - Appointment field config data
   * @returns Promise resolving to the created appointment field config
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const config = await client.appointmentFieldConfigs.create({
   *   fields: [
   *     {
   *       fieldKey: 'hairLength',
   *       fieldType: 'select',
   *       label: 'Hair Length',
   *       options: ['Short', 'Medium', 'Long']
   *     }
   *   ],
   *   reuseDetails: true
   * });
   * ```
   */
  public async create(data: CreateAppointmentFieldConfig): Promise<AppointmentFieldConfig> {
    return this.http.post<CreateAppointmentFieldConfig, AppointmentFieldConfig>(
      this.resource_path,
      data,
      CreateAppointmentFieldConfigSchema
    );
  }

  /**
   * Retrieves an appointment field configuration by ID.
   *
   * @param id - Appointment field config ID
   * @returns Promise resolving to the appointment field config
   *
   * @throws {@link WiilAPIError} - When the config is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const config = await client.appointmentFieldConfigs.get('afc_123');
   * console.log('Fields:', config.fields.length);
   * console.log('Reuse details:', config.reuseDetails);
   * ```
   */
  public async get(id: string): Promise<AppointmentFieldConfig> {
    return this.http.get<AppointmentFieldConfig>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves appointment field configurations with email requirement.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of appointment field configs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const configs = await client.appointmentFieldConfigs.getWithEmailRequired();
   * console.log(`Found ${configs.meta.totalCount} configs requiring email`);
   * ```
   */
  public async getWithEmailRequired(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AppointmentFieldConfig>> {
    const queryParams = new URLSearchParams();
    queryParams.append('ensureEmail', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/with-email-required?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<AppointmentFieldConfig>>(path);
  }

  /**
   * Retrieves appointment field configurations with phone requirement.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of appointment field configs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const configs = await client.appointmentFieldConfigs.getWithPhoneRequired();
   * console.log(`Found ${configs.meta.totalCount} configs requiring phone`);
   * ```
   */
  public async getWithPhoneRequired(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AppointmentFieldConfig>> {
    const queryParams = new URLSearchParams();
    queryParams.append('ensurePhone', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/with-phone-required?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<AppointmentFieldConfig>>(path);
  }

  /**
   * Retrieves appointment field configurations with reuse details enabled.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of appointment field configs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const configs = await client.appointmentFieldConfigs.getWithReuseEnabled();
   * console.log(`Found ${configs.meta.totalCount} configs with reuse enabled`);
   * ```
   */
  public async getWithReuseEnabled(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AppointmentFieldConfig>> {
    const queryParams = new URLSearchParams();
    queryParams.append('reuseDetails', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/with-reuse-enabled?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<AppointmentFieldConfig>>(path);
  }

  /**
   * Updates an existing appointment field configuration.
   *
   * @param data - Appointment field config update data (must include id)
   * @returns Promise resolving to the updated appointment field config
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the config is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.appointmentFieldConfigs.update({
   *   id: 'afc_123',
   *   fields: [
   *     { fieldKey: 'allergies', fieldType: 'text', label: 'Known Allergies', required: true }
   *   ],
   *   ensureEmail: true
   * });
   * ```
   */
  public async update(data: UpdateAppointmentFieldConfig): Promise<AppointmentFieldConfig> {
    return this.http.patch<UpdateAppointmentFieldConfig, AppointmentFieldConfig>(
      this.resource_path,
      data,
      UpdateAppointmentFieldConfigSchema
    );
  }

  /**
   * Deletes an appointment field configuration.
   *
   * @param id - Appointment field config ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the config is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.appointmentFieldConfigs.delete('afc_123');
   * if (deleted) {
   *   console.log('Appointment field config deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists appointment field configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of appointment field configs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.appointmentFieldConfigs.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} appointment field configs`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<AppointmentFieldConfig>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<AppointmentFieldConfig>>(path);
  }
}
