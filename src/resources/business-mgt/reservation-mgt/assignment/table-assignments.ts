/**
 * @fileoverview Table Assignments resource for managing table-to-reservation assignments.
 * @module resources/reservation-mgt/assignment/table-assignments
 */

import {
  TableAssignment,
  CreateTableAssignment,
  CreateTableAssignmentSchema,
  UpdateTableAssignment,
  UpdateTableAssignmentSchema,
  TableAssignmentStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../../client/HttpClient';

/**
 * Resource class for managing table assignments in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing table
 * assignments. Table assignments record the physical table instance assigned
 * to a table reservation, supporting both soft and hard lock types.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Assign a table to a reservation
 * const assignment = await client.tableAssignments.create({
 *   reservationId: 'res_123',
 *   tableInstanceId: 'ti_456',
 *   floorPlanId: 'fp_789',
 *   assignmentType: 'hard',
 *   assignedAt: Date.now()
 * });
 * ```
 */
export class TableAssignmentsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/table-assignments';

  /**
   * Creates a new TableAssignmentsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new table assignment.
   *
   * @param data - Table assignment data
   * @returns Promise resolving to the created table assignment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignment = await client.tableAssignments.create({
   *   locationId: 'loc_123',
   *   reservationId: 'res_456',
   *   tableInstanceId: 'ti_789',
   *   floorPlanId: 'fp_abc',
   *   floorPlanSectionId: 'sec_def',
   *   assignmentType: 'soft',
   *   assignedAt: Date.now(),
   *   assignedBy: 'user_123'
   * });
   * ```
   */
  public async create(data: CreateTableAssignment): Promise<TableAssignment> {
    return this.http.post<CreateTableAssignment, TableAssignment>(
      this.resource_path,
      data,
      CreateTableAssignmentSchema
    );
  }

  /**
   * Retrieves a table assignment by ID.
   *
   * @param id - Table assignment ID
   * @returns Promise resolving to the table assignment
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignment = await client.tableAssignments.get('ta_123');
   * console.log('Table:', assignment.tableInstanceId);
   * console.log('Status:', assignment.status);
   * ```
   */
  public async get(id: string): Promise<TableAssignment> {
    return this.http.get<TableAssignment>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves table assignments by reservation.
   *
   * @param reservationId - Reservation ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of table assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignments = await client.tableAssignments.getByReservation('res_123');
   * console.log(`Found ${assignments.meta.totalCount} table assignments`);
   * ```
   */
  public async getByReservation(
    reservationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-reservation/${reservationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TableAssignment>>(path);
  }

  /**
   * Retrieves table assignments by table instance.
   *
   * @param tableInstanceId - Table instance ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of table assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const assignments = await client.tableAssignments.getByTableInstance('ti_123');
   * console.log(`Found ${assignments.meta.totalCount} assignments for table`);
   * ```
   */
  public async getByTableInstance(
    tableInstanceId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-table-instance/${tableInstanceId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TableAssignment>>(path);
  }

  /**
   * Retrieves table assignments by status.
   *
   * @param status - Assignment status
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of table assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeAssignments = await client.tableAssignments.getByStatus('assigned');
   * console.log(`Found ${activeAssignments.meta.totalCount} active assignments`);
   * ```
   */
  public async getByStatus(
    status: TableAssignmentStatus,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableAssignment>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<TableAssignment>>(path);
  }

  /**
   * Updates an existing table assignment.
   *
   * @param data - Table assignment update data (must include id)
   * @returns Promise resolving to the updated table assignment
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.tableAssignments.update({
   *   id: 'ta_123',
   *   status: 'released',
   *   releasedAt: Date.now(),
   *   releasedBy: 'user_456'
   * });
   * ```
   */
  public async update(data: UpdateTableAssignment): Promise<TableAssignment> {
    return this.http.patch<UpdateTableAssignment, TableAssignment>(
      this.resource_path,
      data,
      UpdateTableAssignmentSchema
    );
  }

  /**
   * Releases a table assignment.
   *
   * @param id - Table assignment ID
   * @param releasedBy - Staff user ID releasing the assignment
   * @returns Promise resolving to the released table assignment
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const released = await client.tableAssignments.release('ta_123', 'user_456');
   * console.log('Released at:', released.releasedAt);
   * ```
   */
  public async release(id: string, releasedBy?: string): Promise<TableAssignment> {
    return this.http.post<{ releasedBy?: string }, TableAssignment>(
      `${this.resource_path}/${id}/release`,
      { releasedBy }
    );
  }

  /**
   * Deletes a table assignment.
   *
   * @param id - Table assignment ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the assignment is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.tableAssignments.delete('ta_123');
   * if (deleted) {
   *   console.log('Table assignment deleted');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists table assignments with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of table assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.tableAssignments.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} table assignments`);
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TableAssignment>>(path);
  }
}
