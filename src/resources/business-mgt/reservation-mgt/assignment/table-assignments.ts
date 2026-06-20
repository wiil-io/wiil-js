/**
 * @fileoverview Table Assignments resource for reading table-to-reservation assignments.
 * @module resources/reservation-mgt/assignment/table-assignments
 */

import {
  TableAssignment,
  TableAssignmentStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../../client/HttpClient';

/**
 * Resource class for reading table assignments in the WIIL Platform.
 *
 * @remarks
 * Provides read-only methods for retrieving and listing table assignments.
 * Table assignments record the physical table instance assigned to a table
 * reservation. Assignments are managed by the system and are read-only
 * through this API.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a table assignment
 * const assignment = await client.tableAssignments.get('ta_123');
 * console.log('Table:', assignment.tableInstanceId);
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
   * Retrieves active table assignments.
   *
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of active table assignments
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeAssignments = await client.tableAssignments.getActive();
   * console.log(`Found ${activeAssignments.meta.totalCount} active assignments`);
   * ```
   */
  public async getActive(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TableAssignment>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TableAssignment>>(path);
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
