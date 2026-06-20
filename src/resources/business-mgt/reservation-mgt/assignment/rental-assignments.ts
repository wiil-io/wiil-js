/**
 * @fileoverview Rental Assignments resource for reading rental-to-reservation assignments.
 * @module resources/reservation-mgt/assignment/rental-assignments
 */

import {
  RentalAssignment,
  RentalAssignmentStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../../client/HttpClient';

/**
 * Resource class for reading rental assignments in the WIIL Platform.
 *
 * @remarks
 * Provides read-only methods for retrieving and listing rental assignments.
 * Rental assignments record the physical rental unit assigned to a rental
 * reservation. Assignments are managed by the system and are read-only
 * through this API.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a rental assignment
 * const assignment = await client.rentalAssignments.get('rna_123');
 * console.log('Rental unit:', assignment.rentalInstanceId);
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
   * Retrieves active rental assignments.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active rental assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeAssignments = await client.rentalAssignments.getActive();
   * console.log(`Found ${activeAssignments.meta.totalCount} active assignments`);
   * ```
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<RentalAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
