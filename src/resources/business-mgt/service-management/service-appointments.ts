/**
 * @fileoverview Service Appointments resource for managing service appointments.
 * @module resources/service-appointments
 */

import {
  ServiceAppointment,
  CreateServiceAppointment,
  CreateServiceAppointmentSchema,
  UpdateServiceAppointment,
  UpdateServiceAppointmentSchema,
  AppointmentStatus,
  ServiceSlotQueryRequest,
  ServiceSlotQueryResponse,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing service appointments in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, canceling, and listing
 * service appointments. Service appointments represent scheduled sessions for
 * business services with customers. Supports filtering by customer and service.
 * All methods require proper authentication via API key.
 */
export class ServiceAppointmentsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/service-appointments';

  /**
   * Creates a new ServiceAppointmentsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new service appointment.
   *
   * @param data - Service appointment data
   * @returns Promise resolving to the created service appointment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateServiceAppointment): Promise<ServiceAppointment> {
    return this.http.post<CreateServiceAppointment, ServiceAppointment>(
      this.resource_path,
      data,
      CreateServiceAppointmentSchema
    );
  }

  /**
   * Retrieves a service appointment by ID.
   *
   * @param id - Service appointment ID
   * @returns Promise resolving to the service appointment
   *
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ServiceAppointment> {
    return this.http.get<ServiceAppointment>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves service appointments by customer.
   *
   * @param customerId - Customer ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of service appointments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceAppointment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceAppointment>>(path);
  }

  /**
   * Retrieves service appointments by service.
   *
   * @param serviceId - Service ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of service appointments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByService(
    serviceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceAppointment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-service/${serviceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceAppointment>>(path);
  }

  /**
   * Retrieves service appointments by provider.
   *
   * @param providerId - Provider ID (ServicePerson ID)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of service appointments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByProvider(
    providerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceAppointment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-provider/${providerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceAppointment>>(path);
  }

  /**
   * Retrieves service appointments within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of service appointments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceAppointment>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<ServiceAppointment>>(path);
  }

  /**
   * Updates an existing service appointment.
   *
   * @param data - Service appointment update data (must include id)
   * @returns Promise resolving to the updated service appointment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdateServiceAppointment): Promise<ServiceAppointment> {
    return this.http.patch<UpdateServiceAppointment, ServiceAppointment>(
      this.resource_path,
      data,
      UpdateServiceAppointmentSchema
    );
  }

  /**
   * Updates appointment status.
   *
   * @param id - Appointment ID
   * @param status - New appointment status
   * @returns Promise resolving to the updated appointment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateStatus(id: string, status: AppointmentStatus): Promise<ServiceAppointment> {
    return this.http.patch<{ status: AppointmentStatus }, ServiceAppointment>(
      `${this.resource_path}/${id}/status`,
      { status }
    );
  }

  /**
   * Cancels a service appointment.
   *
   * @param id - Appointment ID
   * @param data - Cancellation data
   * @returns Promise resolving to the cancelled appointment
   *
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async cancel(id: string, data: { cancelReason?: string }): Promise<ServiceAppointment> {
    return this.http.post<{ cancelReason?: string }, ServiceAppointment>(
      `${this.resource_path}/${id}/cancel`,
      data
    );
  }

  /**
   * Reschedules a service appointment.
   *
   * @param id - Appointment ID
   * @param data - New scheduling data with timestamps
   * @returns Promise resolving to the rescheduled appointment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async reschedule(
    id: string,
    data: { startTime: number; endTime?: number; businessServiceId?: string }
  ): Promise<ServiceAppointment> {
    return this.http.post<{ startTime: number; endTime?: number; businessServiceId?: string }, ServiceAppointment>(
      `${this.resource_path}/${id}/reschedule`,
      data
    );
  }

  /**
   * Deletes a service appointment.
   *
   * @param id - Appointment ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists service appointments with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of service appointments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceAppointment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceAppointment>>(path);
  }

  /**
   * Creates multiple service appointments in a single batch request.
   *
   * @param data - Array of service appointment data (maximum 50 items)
   * @returns Promise resolving to paginated result of created service appointments
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const appointments = await client.serviceAppointments.createBatch([
   *   { businessServiceId: 'svc_1', customerId: 'cust_1', startTime: Date.now() },
   *   { businessServiceId: 'svc_1', customerId: 'cust_2', startTime: Date.now() + 3600000 }
   * ]);
   * console.log(`Created ${appointments.data.length} appointments`);
   * ```
   */
  public async createBatch(
    data: CreateServiceAppointment[]
  ): Promise<PaginatedResultType<ServiceAppointment>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateServiceAppointmentSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateServiceAppointment[], PaginatedResultType<ServiceAppointment>>(
      `${this.resource_path}/batch`,
      data
    );
  }

  /**
   * Retrieves available appointment slots for a service.
   *
   * @param request - Slot query request parameters
   * @returns Promise resolving to available appointment slots
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const slots = await client.serviceAppointments.getAvailableSlots({
   *   serviceId: 'svc_456',
   *   localDate: '2024-03-15',
   *   providerId: 'prov_789',
   *   maxResults: 10
   * });
   *
   * console.log(`Found ${slots.slots.length} available slots`);
   * slots.slots.forEach(slot => {
   *   console.log(`${slot.startTimeOfDay} - Provider: ${slot.providerId}`);
   * });
   * ```
   */
  public async getAvailableSlots(
    request: ServiceSlotQueryRequest
  ): Promise<ServiceSlotQueryResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('serviceId', request.serviceId);
    queryParams.append('localDate', request.localDate);
    queryParams.append('providerId', request.providerId);
    if (request.locationId) queryParams.append('locationId', request.locationId);
    if (request.maxResults) queryParams.append('maxResults', request.maxResults.toString());

    return this.http.get<ServiceSlotQueryResponse>(
      `${this.resource_path}/available-slots?${queryParams.toString()}`
    );
  }
}
