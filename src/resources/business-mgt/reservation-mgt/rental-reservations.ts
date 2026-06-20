/**
 * @fileoverview Rental Reservations resource for managing equipment rental bookings.
 * @module resources/rental-reservations
 */

import {
  RentalReservation,
  CreateRentalReservation,
  CreateRentalReservationSchema,
  UpdateRentalReservation,
  UpdateRentalReservationSchema,
  PaginatedResultType,
  PaginationRequest,
  RentalReservationSlotQueryRequest,
  RentalReservationSlotQueryResponse,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing rental reservations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * rental reservations. Rental reservations are used for equipment and asset
 * rentals with time-bounded bookings, payment tracking, waiver management,
 * and identity verification.
 * All methods require proper authentication via API key.
 */
export class RentalReservationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/rental-reservations';

  /**
   * Creates a new RentalReservationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new rental reservation.
   *
   * @param data - Rental reservation data
   * @returns Promise resolving to the created reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateRentalReservation): Promise<RentalReservation> {
    return this.http.post<CreateRentalReservation, RentalReservation>(
      this.resource_path,
      data,
      CreateRentalReservationSchema
    );
  }

  /**
   * Retrieves a rental reservation by ID.
   *
   * @param id - Rental reservation ID
   * @returns Promise resolving to the reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<RentalReservation> {
    return this.http.get<RentalReservation>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves rental reservations by customer ID.
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
  ): Promise<PaginatedResultType<RentalReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RentalReservation>>(path);
  }

  /**
   * Retrieves rental reservations by resource ID.
   *
   * @param resourceId - Rental resource ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByResource(
    resourceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-resource/${resourceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RentalReservation>>(path);
  }

  /**
   * Retrieves rental reservations by tier ID.
   *
   * @param tierId - Rental tier ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByTier(
    tierId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-tier/${tierId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RentalReservation>>(path);
  }

  /**
   * Retrieves rental reservations by date range.
   *
   * @param startAt - Start timestamp filter
   * @param endAt - End timestamp filter
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByDateRange(
    startAt: number,
    endAt: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalReservation>> {
    const queryParams = new URLSearchParams();

    queryParams.append('startAt', startAt.toString());
    queryParams.append('endAt', endAt.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<RentalReservation>>(path);
  }

  /**
   * Updates an existing rental reservation.
   *
   * @param id - Rental reservation ID
   * @param data - Reservation update data
   * @returns Promise resolving to the updated reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateRentalReservation): Promise<RentalReservation> {
    return this.http.patch<UpdateRentalReservation, RentalReservation>(
      `${this.resource_path}/${id}`,
      data,
      UpdateRentalReservationSchema
    );
  }

  /**
   * Records the actual return of a rental item.
   *
   * @param id - Rental reservation ID
   * @param returnAt - Actual return timestamp
   * @returns Promise resolving to the updated reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async recordReturn(id: string, returnAt: number): Promise<RentalReservation> {
    return this.http.post<{ actualReturnAt: number }, RentalReservation>(
      `${this.resource_path}/${id}/return`,
      { actualReturnAt: returnAt }
    );
  }

  /**
   * Cancels a rental reservation.
   *
   * @param id - Rental reservation ID
   * @param reason - Optional cancellation reason
   * @returns Promise resolving to the cancelled reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async cancel(id: string, reason?: string): Promise<RentalReservation> {
    return this.http.post<{ reason?: string }, RentalReservation>(
      `${this.resource_path}/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Deletes a rental reservation.
   *
   * @param id - Rental reservation ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists rental reservations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RentalReservation>>(path);
  }

  /**
   * Retrieves available rental reservation time slots for a given date.
   *
   * @param request - Slot query request parameters
   * @returns Promise resolving to available rental slots
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getAvailableSlots(
    request: RentalReservationSlotQueryRequest
  ): Promise<RentalReservationSlotQueryResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('resourceType', request.resourceType);
    queryParams.append('localDate', request.localDate);
    if (request.maxResults) queryParams.append('maxResults', request.maxResults.toString());
    if (request.locationId) queryParams.append('locationId', request.locationId);
    if (request.resourceId) queryParams.append('resourceId', request.resourceId);
    if (request.returnDate) queryParams.append('returnDate', request.returnDate);
    if (request.tierId) queryParams.append('tierId', request.tierId);
    if (request.durationMinutes) queryParams.append('durationMinutes', request.durationMinutes.toString());

    return this.http.get<RentalReservationSlotQueryResponse>(
      `${this.resource_path}/available-slots?${queryParams.toString()}`
    );
  }

  /**
   * Creates multiple rental reservations in a single batch request.
   *
   * @param data - Array of reservation data (maximum 50 items)
   * @returns Promise resolving to paginated result of created reservations
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateRentalReservation[]
  ): Promise<PaginatedResultType<RentalReservation>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateRentalReservationSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateRentalReservation[], PaginatedResultType<RentalReservation>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
