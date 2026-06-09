/**
 * @fileoverview Outbound Calls resource for managing AI-powered voice call requests.
 * @module resources/conversation/outbound-calls
 */

import {
  BusinessCallRequest,
  CreateCallRequest,
  CreateCallRequestSchema,
  UpdateCallRequest,
  UpdateCallRequestSchema,
  CallRequestResult,
  CallRequestStatus,
  ScheduleType,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing outbound call requests in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, canceling, and listing
 * outbound call requests. Supports scheduling, retry logic, and calling hours
 * compliance for AI-powered voice calls. All methods require proper authentication
 * via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create an immediate outbound call
 * const call = await client.outboundCalls.create({
 *   to: '+14155551234',
 *   from: '+14155555678',
 *   agentConfigurationId: 'agent_123',
 *   scheduleType: 'IMMEDIATE'
 * });
 *
 * // Schedule a call for later
 * const scheduledCall = await client.outboundCalls.create({
 *   to: '+14155551234',
 *   from: '+14155555678',
 *   agentConfigurationId: 'agent_123',
 *   scheduleType: 'SCHEDULED',
 *   scheduledAt: Date.now() + 3600000 // 1 hour from now
 * });
 * ```
 */
export class OutboundCallsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/outbound-calls';

  /**
   * Creates a new OutboundCallsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new outbound call request.
   *
   * @param data - Call request data
   * @returns Promise resolving to the call request result
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundCalls.create({
   *   to: '+14155551234',
   *   from: '+14155555678',
   *   agentConfigurationId: 'agent_123',
   *   scheduleType: 'IMMEDIATE',
   *   maxDuration: 300, // 5 minutes
   *   maxRetries: 2
   * });
   * console.log('Call initiated:', result.request?.id);
   * ```
   */
  public async create(data: CreateCallRequest): Promise<CallRequestResult> {
    return this.http.post<CreateCallRequest, CallRequestResult>(
      this.resource_path,
      data,
      CreateCallRequestSchema
    );
  }

  /**
   * Retrieves a call request by ID.
   *
   * @param id - Call request ID
   * @returns Promise resolving to the call request
   *
   * @throws {@link WiilAPIError} - When the call request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const call = await client.outboundCalls.get('call_123');
   * console.log('Call status:', call.status);
   * console.log('Scheduled at:', call.scheduledAt);
   * ```
   */
  public async get(id: string): Promise<BusinessCallRequest> {
    return this.http.get<BusinessCallRequest>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves call requests by agent configuration.
   *
   * @param agentConfigurationId - Agent configuration ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of call requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const calls = await client.outboundCalls.getByAgent('agent_123');
   * console.log(`Found ${calls.meta.totalCount} calls for agent`);
   * ```
   */
  public async getByAgent(
    agentConfigurationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessCallRequest>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-agent/${agentConfigurationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessCallRequest>>(path);
  }

  /**
   * Retrieves call requests by status.
   *
   * @param status - Call request status
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of call requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const pendingCalls = await client.outboundCalls.getByStatus('PENDING');
   * console.log(`Found ${pendingCalls.meta.totalCount} pending calls`);
   * ```
   */
  public async getByStatus(
    status: CallRequestStatus,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessCallRequest>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<BusinessCallRequest>>(path);
  }

  /**
   * Retrieves call requests scheduled within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of call requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
   * const calls = await client.outboundCalls.getByDateRange(Date.now(), tomorrow);
   * console.log(`Found ${calls.meta.totalCount} calls scheduled for tomorrow`);
   * ```
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessCallRequest>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<BusinessCallRequest>>(path);
  }

  /**
   * Updates an existing call request.
   *
   * @param data - Call request update data (must include id)
   * @returns Promise resolving to the updated call request
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the call request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.outboundCalls.update({
   *   id: 'call_123',
   *   scheduledAt: Date.now() + 7200000 // Reschedule to 2 hours from now
   * });
   * console.log('Rescheduled to:', updated.scheduledAt);
   * ```
   */
  public async update(data: UpdateCallRequest): Promise<BusinessCallRequest> {
    return this.http.patch<UpdateCallRequest, BusinessCallRequest>(
      this.resource_path,
      data,
      UpdateCallRequestSchema
    );
  }

  /**
   * Updates call request status.
   *
   * @param id - Call request ID
   * @param status - New call request status
   * @returns Promise resolving to the updated call request
   *
   * @throws {@link WiilAPIError} - When the call request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.outboundCalls.updateStatus('call_123', 'CANCELLED');
   * console.log('Call cancelled:', updated.status);
   * ```
   */
  public async updateStatus(id: string, status: CallRequestStatus): Promise<BusinessCallRequest> {
    return this.http.patch<{ status: CallRequestStatus }, BusinessCallRequest>(
      `${this.resource_path}/${id}/status`,
      { status }
    );
  }

  /**
   * Cancels a call request.
   *
   * @param id - Call request ID
   * @param reason - Optional cancellation reason
   * @returns Promise resolving to the cancelled call request
   *
   * @throws {@link WiilAPIError} - When the call request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const cancelled = await client.outboundCalls.cancel('call_123', 'Customer requested');
   * console.log('Call cancelled:', cancelled.id);
   * ```
   */
  public async cancel(id: string, reason?: string): Promise<BusinessCallRequest> {
    return this.http.post<{ reason?: string }, BusinessCallRequest>(
      `${this.resource_path}/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Retries a failed call request.
   *
   * @param id - Call request ID
   * @returns Promise resolving to the call request result
   *
   * @throws {@link WiilAPIError} - When the call request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundCalls.retry('call_123');
   * console.log('Retry initiated:', result.success);
   * ```
   */
  public async retry(id: string): Promise<CallRequestResult> {
    return this.http.post<Record<string, never>, CallRequestResult>(
      `${this.resource_path}/${id}/retry`,
      {}
    );
  }

  /**
   * Deletes a call request.
   *
   * @param id - Call request ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the call request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.outboundCalls.delete('call_123');
   * if (deleted) {
   *   console.log('Call request deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists call requests with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of call requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundCalls.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} call requests`);
   * result.data.forEach(call => {
   *   console.log(`- ${call.id}: ${call.to} (${call.status})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<BusinessCallRequest>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<BusinessCallRequest>>(path);
  }

  /**
   * Creates multiple call requests in a single batch request.
   *
   * @param data - Array of call request data (maximum 50 items)
   * @returns Promise resolving to paginated result of created call requests
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const calls = await client.outboundCalls.createBatch([
   *   { to: '+14155551234', from: '+14155555678', agentConfigurationId: 'agent_123', scheduleType: 'IMMEDIATE' },
   *   { to: '+14155551235', from: '+14155555678', agentConfigurationId: 'agent_123', scheduleType: 'IMMEDIATE' }
   * ]);
   * console.log(`Created ${calls.data.length} call requests`);
   * ```
   */
  public async createBatch(
    data: CreateCallRequest[]
  ): Promise<PaginatedResultType<BusinessCallRequest>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateCallRequestSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateCallRequest[], PaginatedResultType<BusinessCallRequest>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
