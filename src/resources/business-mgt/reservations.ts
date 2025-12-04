/**
 * @fileoverview Reservations resource for managing customer reservations.
 * @module resources/reservations
 */

import {
  Reservation,
  CreateReservation,
  CreateReservationSchema,
  UpdateReservation,
  UpdateReservationSchema,
  ReservationSettings,
  UpdateReservationSettings,
  UpdateReservationSettingsSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing reservations in the WIIL Platform.
 *
 * @remarks
 * Provides comprehensive methods for creating, retrieving, updating, canceling,
 * and rescheduling reservations. Supports filtering by customer and resource.
 * Includes reservation settings management. All methods require proper
 * authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a reservation
 * const reservation = await client.reservations.create({
 *   customerId: 'cust_123',
 *   resourceId: 'resource_456',
 *   startTime: '2024-03-15T18:00:00Z',
 *   endTime: '2024-03-15T20:00:00Z',
 *   partySize: 4
 * });
 *
 * // Get reservation by ID
 * const reservation = await client.reservations.get('reservation_123');
 *
 * // Reschedule reservation
 * const rescheduled = await client.reservations.reschedule('reservation_123', {
 *   startTime: '2024-03-16T18:00:00Z',
 *   endTime: '2024-03-16T20:00:00Z'
 * });
 *
 * // Cancel reservation
 * const cancelled = await client.reservations.cancel('reservation_123', {
 *   reason: 'Customer request'
 * });
 * ```
 */
export class ReservationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/reservations';

  /**
   * Creates a new ReservationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new reservation.
   *
   * @param data - Reservation data
   * @returns Promise resolving to the created reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateReservation): Promise<Reservation> {
    return this.http.post<CreateReservation, Reservation>(
      this.resource_path,
      data,
      CreateReservationSchema
    );
  }

  /**
   * Retrieves a reservation by ID.
   *
   * @param id - Reservation ID
   * @returns Promise resolving to the reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<Reservation> {
    return this.http.get<Reservation>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves reservations by customer.
   *
   * @param customerId - Customer ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Reservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Reservation>>(path);
  }

  /**
   * Retrieves reservations by resource.
   *
   * @param resourceId - Resource ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByResource(
    resourceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Reservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-resource/${resourceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Reservation>>(path);
  }

  /**
   * Updates an existing reservation.
   *
   * @param data - Reservation update data (must include id)
   * @returns Promise resolving to the updated reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdateReservation): Promise<Reservation> {
    return this.http.patch<UpdateReservation, Reservation>(
      this.resource_path,
      data,
      UpdateReservationSchema
    );
  }

  /**
   * Updates reservation status.
   *
   * @param id - Reservation ID
   * @param data - Status update data
   * @returns Promise resolving to the updated reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateStatus(id: string, data: { status: string }): Promise<Reservation> {
    return this.http.patch<{ status: string }, Reservation>(
      `${this.resource_path}/${id}/status`,
      data
    );
  }

  /**
   * Cancels a reservation.
   *
   * @param id - Reservation ID
   * @param data - Cancellation data (reason, etc.)
   * @returns Promise resolving to the cancelled reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async cancel(id: string, data: { reason?: string }): Promise<Reservation> {
    return this.http.post<{ reason?: string }, Reservation>(
      `${this.resource_path}/${id}/cancel`,
      data
    );
  }

  /**
   * Reschedules a reservation.
   *
   * @param id - Reservation ID
   * @param data - New scheduling data
   * @returns Promise resolving to the rescheduled reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async reschedule(
    id: string,
    data: { startTime: string; endTime: string; resourceId?: string }
  ): Promise<Reservation> {
    return this.http.post<{ startTime: string; endTime: string; resourceId?: string }, Reservation>(
      `${this.resource_path}/${id}/reschedule`,
      data
    );
  }

  /**
   * Deletes a reservation.
   *
   * @param id - Reservation ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists reservations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Reservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Reservation>>(path);
  }

  /**
   * Retrieves reservation settings for the organization.
   *
   * @returns Promise resolving to array of reservation settings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getSettings(): Promise<ReservationSettings[]> {
    return this.http.get<ReservationSettings[]>(`${this.resource_path}/settings`);
  }

  /**
   * Updates reservation settings.
   *
   * @param data - Reservation settings update data (must include id)
   * @returns Promise resolving to the updated settings
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the settings are not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateSettings(data: UpdateReservationSettings): Promise<ReservationSettings> {
    return this.http.patch<UpdateReservationSettings, ReservationSettings>(
      `${this.resource_path}/settings`,
      data,
      UpdateReservationSettingsSchema
    );
  }

  /**
   * Deletes reservation settings.
   *
   * @param id - Settings ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the settings are not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async deleteSettings(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/settings/${id}`);
  }
}
