/**
 * @fileoverview Table Reservations resource for managing restaurant table bookings.
 * @module resources/table-reservations
 */

import {
  TableReservation,
  CreateTableReservation,
  CreateTableReservationSchema,
  UpdateTableReservation,
  UpdateTableReservationSchema,
  PaginatedResultType,
  PaginationRequest,
  TableReservationSlotQueryRequest,
  TableReservationSlotQueryResponse,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing table reservations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * table reservations. Table reservations are used for restaurant and dining
 * venue bookings with party size, time slots, and floor plan assignments.
 * All methods require proper authentication via API key.
 */
export class TableReservationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/table-reservations';

  /**
   * Creates a new TableReservationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new table reservation.
   *
   * @param data - Table reservation data
   * @returns Promise resolving to the created reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateTableReservation): Promise<TableReservation> {
    return this.http.post<CreateTableReservation, TableReservation>(
      this.resource_path,
      data,
      CreateTableReservationSchema
    );
  }

  /**
   * Retrieves a table reservation by ID.
   *
   * @param id - Table reservation ID
   * @returns Promise resolving to the reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<TableReservation> {
    return this.http.get<TableReservation>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves table reservations by customer ID.
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
  ): Promise<PaginatedResultType<TableReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TableReservation>>(path);
  }

  /**
   * Retrieves table reservations by resource ID.
   *
   * @param resourceId - Table resource ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByResource(
    resourceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-resource/${resourceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TableReservation>>(path);
  }

  /**
   * Retrieves table reservations by date range.
   *
   * @param startTime - Start timestamp
   * @param endTime - End timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByDateRange(
    startTime: number,
    endTime: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableReservation>> {
    const queryParams = new URLSearchParams();

    queryParams.append('startTime', startTime.toString());
    queryParams.append('endTime', endTime.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<TableReservation>>(path);
  }

  /**
   * Updates an existing table reservation.
   *
   * @param id - Table reservation ID
   * @param data - Reservation update data
   * @returns Promise resolving to the updated reservation
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(id: string, data: UpdateTableReservation): Promise<TableReservation> {
    return this.http.patch<UpdateTableReservation, TableReservation>(
      `${this.resource_path}/${id}`,
      data,
      UpdateTableReservationSchema
    );
  }

  /**
   * Cancels a table reservation.
   *
   * @param id - Table reservation ID
   * @param reason - Optional cancellation reason
   * @returns Promise resolving to the cancelled reservation
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async cancel(id: string, reason?: string): Promise<TableReservation> {
    return this.http.post<{ reason?: string }, TableReservation>(
      `${this.resource_path}/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Deletes a table reservation.
   *
   * @param id - Table reservation ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the reservation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists table reservations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of reservations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableReservation>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TableReservation>>(path);
  }

  /**
   * Retrieves available table reservation time slots for a given date.
   *
   * @param request - Slot query request parameters
   * @returns Promise resolving to available table slots
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getAvailableSlots(
    request: TableReservationSlotQueryRequest
  ): Promise<TableReservationSlotQueryResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('resourceType', request.resourceType);
    queryParams.append('localDate', request.localDate);
    queryParams.append('partySize', request.partySize.toString());
    if (request.maxResults) queryParams.append('maxResults', request.maxResults.toString());
    if (request.locationId) queryParams.append('locationId', request.locationId);
    if (request.resourceId) queryParams.append('resourceId', request.resourceId);
    if (request.floorPlanId) queryParams.append('floorPlanId', request.floorPlanId);
    if (request.floorPlanSectionId) queryParams.append('floorPlanSectionId', request.floorPlanSectionId);

    return this.http.get<TableReservationSlotQueryResponse>(
      `${this.resource_path}/available-slots?${queryParams.toString()}`
    );
  }

  /**
   * Creates multiple table reservations in a single batch request.
   *
   * @param data - Array of reservation data (maximum 50 items)
   * @returns Promise resolving to paginated result of created reservations
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBatch(
    data: CreateTableReservation[]
  ): Promise<PaginatedResultType<TableReservation>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateTableReservationSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateTableReservation[], PaginatedResultType<TableReservation>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
