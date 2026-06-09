/**
 * @fileoverview Rental Assignments resource for managing rental-to-reservation assignments.
 * @module resources/reservation-mgt/assignment/rental-assignments
 */

import {
  RentalAssignment,
  CreateRentalAssignment,
  CreateRentalAssignmentSchema,
  UpdateRentalAssignment,
  UpdateRentalAssignmentSchema,
  RentalAssignmentStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../../client/HttpClient';

/**
 * Resource class for managing rental assignments in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing rental
 * assignments. Rental assignments record the physical rental unit assigned
 * to a rental reservation, with support for condition tracking at pickup
 * and return.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Assign a rental unit to a reservation
 * const assignment = await client.rentalAssignments.create({
 *   reservationId: 'res_123',
 *   rentalInstanceId: 'ri_456',
 *   assignmentType: 'hard',
 *   assignedAt: Date.now()
 * });
 * ```
 */
export class RentalAssignmentsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/rental-assignments';

  /**
   * Creates a new RentalAssignmentsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new rental assignment.
   *
   * @param data - Rental assignment data
   * @returns Promise resolving to the created rental assignment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignment = await client.rentalAssignments.create({
   *   locationId: 'loc_123',
   *   reservationId: 'res_456',
   *   rentalInstanceId: 'ri_789',
   *   assignmentType: 'hard',
   *   assignedAt: Date.now(),
   *   assignedBy: 'user_123',
   *   conditionAtPickup: {
   *     recordedAt: Date.now(),
   *     recordedBy: 'user_123',
   *     notes: 'Minor scratches on rear bumper',
   *     damageReported: false
   *   }
   * });
   * ```
   */
  public async create(data: CreateRentalAssignment): Promise<RentalAssignment> {
    return this.http.post<CreateRentalAssignment, RentalAssignment>(
      this.resource_path,
      data,
      CreateRentalAssignmentSchema
    );
  }

  /**
   * Retrieves a rental assignment by ID.
   *
   * @param id - Rental assignment ID
   * @returns Promise resolving to the rental assignment
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignment = await client.rentalAssignments.get('rna_123');
   * console.log('Rental unit:', assignment.rentalInstanceId);
   * console.log('Status:', assignment.status);
   * ```
   */
  public async get(id: string): Promise<RentalAssignment> {
    return this.http.get<RentalAssignment>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves rental assignments by reservation.
   *
   * @param reservationId - Reservation ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of rental assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignments = await client.rentalAssignments.getByReservation('res_123');
   * console.log(`Found ${assignments.meta.totalCount} rental assignments`);
   * ```
   */
  public async getByReservation(
    reservationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-reservation/${reservationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RentalAssignment>>(path);
  }

  /**
   * Retrieves rental assignments by rental instance.
   *
   * @param rentalInstanceId - Rental instance ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of rental assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignments = await client.rentalAssignments.getByRentalInstance('ri_123');
   * console.log(`Found ${assignments.meta.totalCount} assignments for rental unit`);
   * ```
   */
  public async getByRentalInstance(
    rentalInstanceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-rental-instance/${rentalInstanceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RentalAssignment>>(path);
  }

  /**
   * Retrieves rental assignments by status.
   *
   * @param status - Assignment status
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of rental assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeAssignments = await client.rentalAssignments.getByStatus('assigned');
   * console.log(`Found ${activeAssignments.meta.totalCount} active assignments`);
   * ```
   */
  public async getByStatus(
    status: RentalAssignmentStatus,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalAssignment>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<RentalAssignment>>(path);
  }

  /**
   * Retrieves rental assignments with damage reported.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of rental assignments with damage
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const damaged = await client.rentalAssignments.getWithDamage();
   * console.log(`Found ${damaged.meta.totalCount} assignments with damage reported`);
   * ```
   */
  public async getWithDamage(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalAssignment>> {
    const queryParams = new URLSearchParams();
    queryParams.append('damageReported', 'true');

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/with-damage?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<RentalAssignment>>(path);
  }

  /**
   * Updates an existing rental assignment.
   *
   * @param data - Rental assignment update data (must include id)
   * @returns Promise resolving to the updated rental assignment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.rentalAssignments.update({
   *   id: 'rna_123',
   *   conditionAtReturn: {
   *     recordedAt: Date.now(),
   *     recordedBy: 'user_456',
   *     notes: 'New scratch on driver door',
   *     damageReported: true,
   *     imageUrls: ['https://example.com/damage1.jpg']
   *   },
   *   status: 'released',
   *   releasedAt: Date.now()
   * });
   * ```
   */
  public async update(data: UpdateRentalAssignment): Promise<RentalAssignment> {
    return this.http.patch<UpdateRentalAssignment, RentalAssignment>(
      this.resource_path,
      data,
      UpdateRentalAssignmentSchema
    );
  }

  /**
   * Releases a rental assignment.
   *
   * @param id - Rental assignment ID
   * @param releasedBy - Staff user ID releasing the assignment
   * @returns Promise resolving to the released rental assignment
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const released = await client.rentalAssignments.release('rna_123', 'user_456');
   * console.log('Released at:', released.releasedAt);
   * ```
   */
  public async release(id: string, releasedBy?: string): Promise<RentalAssignment> {
    return this.http.post<{ releasedBy?: string }, RentalAssignment>(
      `${this.resource_path}/${id}/release`,
      { releasedBy }
    );
  }

  /**
   * Deletes a rental assignment.
   *
   * @param id - Rental assignment ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.rentalAssignments.delete('rna_123');
   * if (deleted) {
   *   console.log('Rental assignment deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists rental assignments with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of rental assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.rentalAssignments.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} rental assignments`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<RentalAssignment>>(path);
  }
}
