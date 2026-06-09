/**
 * @fileoverview Reservation Settings resource for managing location-level reservation configurations.
 * @module resources/reservation-mgt/reservation-settings
 */

import {
  ReservationSettings,
  CreateReservationSettings,
  CreateReservationSettingsSchema,
  UpdateReservationSettings,
  UpdateReservationSettingsSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';

/**
 * Resource class for managing reservation settings in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing reservation
 * settings. Reservation settings define location-level configurations for table,
 * room, and rental reservations including durations, booking windows, and policies.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create reservation settings for a location
 * const settings = await client.reservationSettings.create({
 *   locationId: 'loc_123',
 *   supportTableReservations: true,
 *   table: {
 *     defaultDurationMinutes: 90,
 *     turnoverMinutes: 15,
 *     slotIntervalMinutes: 30,
 *     advanceBookingDays: 30
 *   }
 * });
 * ```
 */
export class ReservationSettingsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/reservation-settings';

  /**
   * Creates a new ReservationSettingsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates new reservation settings.
   *
   * @param data - Reservation settings data
   * @returns Promise resolving to the created reservation settings
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const settings = await client.reservationSettings.create({
   *   locationId: 'loc_123',
   *   supportTableReservations: true,
   *   supportRoomReservations: true,
   *   table: {
   *     defaultDurationMinutes: 90,
   *     turnoverMinutes: 15,
   *     maxPartySize: 12
   *   },
   *   room: {
   *     checkInTime: '15:00',
   *     checkOutTime: '11:00',
   *     minStayNights: 1
   *   }
   * });
   * ```
   */
  public async create(data: CreateReservationSettings): Promise<ReservationSettings> {
    return this.http.post<CreateReservationSettings, ReservationSettings>(
      this.resource_path,
      data,
      CreateReservationSettingsSchema
    );
  }

  /**
   * Retrieves reservation settings by ID.
   *
   * @param id - Reservation settings ID
   * @returns Promise resolving to the reservation settings
   *
   * @throws {@link WiilAPIError} - When the settings are not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const settings = await client.reservationSettings.get('rs_123');
   * console.log('Table duration:', settings.table?.defaultDurationMinutes);
   * ```
   */
  public async get(id: string): Promise<ReservationSettings> {
    return this.http.get<ReservationSettings>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves reservation settings by location.
   *
   * @param locationId - Location ID
   * @returns Promise resolving to the reservation settings for the location
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const settings = await client.reservationSettings.getByLocation('loc_123');
   * if (settings.supportTableReservations) {
   *   console.log('Table reservations enabled');
   * }
   * ```
   */
  public async getByLocation(locationId: string): Promise<ReservationSettings> {
    return this.http.get<ReservationSettings>(`${this.resource_path}/by-location/${locationId}`);
  }

  /**
   * Updates existing reservation settings.
   *
   * @param data - Reservation settings update data (must include id)
   * @returns Promise resolving to the updated reservation settings
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the settings are not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.reservationSettings.update({
   *   id: 'rs_123',
   *   table: {
   *     advanceBookingDays: 60,
   *     maxPartySize: 20
   *   }
   * });
   * ```
   */
  public async update(data: UpdateReservationSettings): Promise<ReservationSettings> {
    return this.http.patch<UpdateReservationSettings, ReservationSettings>(
      this.resource_path,
      data,
      UpdateReservationSettingsSchema
    );
  }

  /**
   * Deletes reservation settings.
   *
   * @param id - Reservation settings ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the settings are not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.reservationSettings.delete('rs_123');
   * if (deleted) {
   *   console.log('Reservation settings deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists reservation settings with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of reservation settings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.reservationSettings.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} reservation settings`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ReservationSettings>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ReservationSettings>>(path);
  }
}
