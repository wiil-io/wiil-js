/**
 * @fileoverview Room Assignments resource for reading room-to-reservation assignments.
 * @module resources/reservation-mgt/assignment/room-assignments
 */

import {
  RoomAssignment,
  RoomAssignmentStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../../client/HttpClient';

/**
 * Resource class for reading room assignments in the WIIL Platform.
 *
 * @remarks
 * Provides read-only methods for retrieving and listing room assignments.
 * Room assignments record the physical room instance assigned to a room
 * reservation. Assignments are managed by the system and are read-only
 * through this API.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a room assignment
 * const assignment = await client.roomAssignments.get('ra_123');
 * console.log('Room:', assignment.roomInstanceId);
 * ```
 */
export class RoomAssignmentsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/room-assignments';

  /**
   * Creates a new RoomAssignmentsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a room assignment by ID.
   *
   * @param id - Room assignment ID
   * @returns Promise resolving to the room assignment
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignment = await client.roomAssignments.get('ra_123');
   * console.log('Room:', assignment.roomInstanceId);
   * console.log('Status:', assignment.status);
   * ```
   */
  public async get(id: string): Promise<RoomAssignment> {
    return this.http.get<RoomAssignment>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves room assignments by reservation.
   *
   * @param reservationId - Reservation ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of room assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignments = await client.roomAssignments.getByReservation('res_123');
   * console.log(`Found ${assignments.meta.totalCount} room assignments`);
   * ```
   */
  public async getByReservation(
    reservationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-reservation/${reservationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RoomAssignment>>(path);
  }

  /**
   * Retrieves room assignments by room instance.
   *
   * @param roomInstanceId - Room instance ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of room assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignments = await client.roomAssignments.getByRoomInstance('ri_123');
   * console.log(`Found ${assignments.meta.totalCount} assignments for room`);
   * ```
   */
  public async getByRoomInstance(
    roomInstanceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-room-instance/${roomInstanceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RoomAssignment>>(path);
  }

  /**
   * Retrieves room assignments by status.
   *
   * @param status - Assignment status
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of room assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeAssignments = await client.roomAssignments.getByStatus('assigned');
   * console.log(`Found ${activeAssignments.meta.totalCount} active assignments`);
   * ```
   */
  public async getByStatus(
    status: RoomAssignmentStatus,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomAssignment>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<RoomAssignment>>(path);
  }

  /**
   * Lists room assignments with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of room assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.roomAssignments.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} room assignments`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RoomAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RoomAssignment>>(path);
  }
}
