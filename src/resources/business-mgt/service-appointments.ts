/**
 * @fileoverview Service Appointments resource for managing service appointments.
 * @module resources/service-appointments
 */

import {
  ServiceAppointment,
  CreateServiceAppointment,
  CreateServiceAppointmentSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

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
   * Updates appointment status.
   *
   * @param id - Appointment ID
   * @param data - Status update data
   * @returns Promise resolving to the updated appointment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateStatus(id: string, data: { status: string }): Promise<ServiceAppointment> {
    return this.http.patch<{ status: string }, ServiceAppointment>(
      `${this.resource_path}/${id}/status`,
      data
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
   * @param data - New scheduling data
   * @returns Promise resolving to the rescheduled appointment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the appointment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async reschedule(
    id: string,
    data: { startTime: string; endTime: string; serviceId?: string }
  ): Promise<ServiceAppointment> {
    return this.http.post<{ startTime: string; endTime: string; serviceId?: string }, ServiceAppointment>(
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
}
