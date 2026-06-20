/**
 * @fileoverview Room Reservations resource for managing lodging bookings.
 * @module resources/room-reservations
 */

import {
  RoomReservation,
  CreateRoomReservation,
  CreateRoomReservationSchema,
  UpdateRoomReservation,
  UpdateRoomReservationSchema,
  PaginatedResultType,
  PaginationRequest,
  RoomReservationSlotQueryRequest,
  RoomReservationSlotQueryResponse,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing room reservations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * room reservations. Room reservations are used for hotel and lodging bookings
 * with check-in/check-out dates, nightly pricing, and payment tracking.
 * All methods require proper authentication via API key.
 */
export class RoomReservationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/room-reservations';

  /**
   * Creates a new RoomReservationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new room reservation.
   *
   * @param data - Room reservation data
   * @returns Promise resolving to the created reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateRoomReservation): Promise<RoomReservation> {
    return this.http.post<CreateRoomReservation, RoomReservation>(
      this.resource_path,
      data,
      CreateRoomReservationSchema
    );
  }

  /**
   * Retrieves a room reservation by ID.
   *
   * @param id - Room reservation ID
   * @returns Promise resolving to the reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<RoomReservation> {
    return this.http.get<RoomReservation>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves room reservations by guest ID.
   *
   * @param guestId - Guest ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByGuest(
    guestId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-guest/${guestId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RoomReservation>>(path);
  }

  /**
   * Retrieves room reservations by resource ID.
   *
   * @param resourceId - Room resource ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByResource(
    resourceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-resource/${resourceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RoomReservation>>(path);
  }

  /**
   * Retrieves room reservations by check-in date range.
   *
   * @param startDate - Start timestamp for check-in filter
   * @param endDate - End timestamp for check-in filter
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByCheckInRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomReservation>> {
    const queryParams = new URLSearchParams();

    queryParams.append('checkInStart', startDate.toString());
    queryParams.append('checkInEnd', endDate.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-check-in-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<RoomReservation>>(path);
  }

  /**
   * Updates an existing room reservation.
   *
   * @param id - Room reservation ID
   * @param data - Reservation update data
   * @returns Promise resolving to the updated reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateRoomReservation): Promise<RoomReservation> {
    return this.http.patch<UpdateRoomReservation, RoomReservation>(
      `${this.resource_path}/${id}`,
      data,
      UpdateRoomReservationSchema
    );
  }

  /**
   * Cancels a room reservation.
   *
   * @param id - Room reservation ID
   * @param reason - Optional cancellation reason
   * @returns Promise resolving to the cancelled reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async cancel(id: string, reason?: string): Promise<RoomReservation> {
    return this.http.post<{ reason?: string }, RoomReservation>(
      `${this.resource_path}/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Deletes a room reservation.
   *
   * @param id - Room reservation ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists room reservations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RoomReservation>>(path);
  }

  /**
   * Retrieves available room reservation slots for a given check-in date.
   *
   * @param request - Slot query request parameters
   * @returns Promise resolving to available room slots
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getAvailableSlots(
    request: RoomReservationSlotQueryRequest
  ): Promise<RoomReservationSlotQueryResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('resourceType', request.resourceType);
    queryParams.append('localDate', request.localDate);
    if (request.maxResults) queryParams.append('maxResults', request.maxResults.toString());
    if (request.locationId) queryParams.append('locationId', request.locationId);
    if (request.resourceId) queryParams.append('resourceId', request.resourceId);
    if (request.nights) queryParams.append('nights', request.nights.toString());
    if (request.occupancy) queryParams.append('occupancy', request.occupancy.toString());

    return this.http.get<RoomReservationSlotQueryResponse>(
      `${this.resource_path}/available-slots?${queryParams.toString()}`
    );
  }

  /**
   * Creates multiple room reservations in a single batch request.
   *
   * @param data - Array of reservation data (maximum 50 items)
   * @returns Promise resolving to paginated result of created reservations
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateRoomReservation[]
  ): Promise<PaginatedResultType<RoomReservation>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateRoomReservationSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateRoomReservation[], PaginatedResultType<RoomReservation>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
