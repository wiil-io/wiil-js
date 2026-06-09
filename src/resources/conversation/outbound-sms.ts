/**
 * @fileoverview Outbound SMS resource for managing SMS requests.
 * @module resources/conversation/outbound-sms
 */

import {
  SmsRequest,
  CreateSmsRequest,
  CreateSmsRequestSchema,
  UpdateSmsRequest,
  UpdateSmsRequestSchema,
  SmsRequestResult,
  SmsStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';

const BATCH_LIMIT = 100;

/**
 * Resource class for managing outbound SMS requests in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing outbound SMS
 * requests. Supports scheduling, templates, and delivery tracking with retry logic.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Send an immediate SMS
 * const sms = await client.outboundSms.create({
 *   to: '+14155551234',
 *   body: 'Your appointment is confirmed for tomorrow at 10am.'
 * });
 *
 * // Schedule an SMS
 * const scheduledSms = await client.outboundSms.create({
 *   to: '+14155551234',
 *   body: 'Reminder: Your appointment is in 1 hour.',
 *   scheduledAt: Date.now() + 3600000 // 1 hour from now
 * });
 * ```
 */
export class OutboundSmsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/outbound-sms';

  /**
   * Creates a new OutboundSmsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new outbound SMS request.
   *
   * @param data - SMS request data
   * @returns Promise resolving to the SMS request result
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundSms.create({
   *   to: '+14155551234',
   *   from: '+14155555678',
   *   body: 'Hello! Your verification code is 123456.',
   *   maxRetries: 2
   * });
   * console.log('SMS sent:', result.request?.id);
   * ```
   */
  public async create(data: CreateSmsRequest): Promise<SmsRequestResult> {
    return this.http.post<CreateSmsRequest, SmsRequestResult>(
      this.resource_path,
      data,
      CreateSmsRequestSchema
    );
  }

  /**
   * Retrieves an SMS request by ID.
   *
   * @param id - SMS request ID
   * @returns Promise resolving to the SMS request
   *
   * @throws {@link WiilAPIError} - When the SMS request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const sms = await client.outboundSms.get('sms_123');
   * console.log('SMS status:', sms.status);
   * console.log('Body:', sms.body);
   * ```
   */
  public async get(id: string): Promise<SmsRequest> {
    return this.http.get<SmsRequest>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves SMS requests by status.
   *
   * @param status - SMS status
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of SMS requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const pendingSms = await client.outboundSms.getByStatus('PENDING');
   * console.log(`Found ${pendingSms.meta.totalCount} pending SMS messages`);
   * ```
   */
  public async getByStatus(
    status: SmsStatus,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<SmsRequest>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<SmsRequest>>(path);
  }

  /**
   * Retrieves SMS requests by recipient phone number.
   *
   * @param phoneNumber - Recipient phone number in E.164 format
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of SMS requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const smsHistory = await client.outboundSms.getByRecipient('+14155551234');
   * console.log(`Found ${smsHistory.meta.totalCount} SMS messages to this number`);
   * ```
   */
  public async getByRecipient(
    phoneNumber: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<SmsRequest>> {
    const queryParams = new URLSearchParams();
    queryParams.append('to', phoneNumber);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-recipient?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<SmsRequest>>(path);
  }

  /**
   * Retrieves SMS requests by template.
   *
   * @param templateId - Template ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of SMS requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const sms = await client.outboundSms.getByTemplate('template_123');
   * console.log(`Found ${sms.meta.totalCount} SMS messages using this template`);
   * ```
   */
  public async getByTemplate(
    templateId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<SmsRequest>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-template/${templateId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<SmsRequest>>(path);
  }

  /**
   * Retrieves SMS requests scheduled within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of SMS requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
   * const sms = await client.outboundSms.getByDateRange(Date.now(), tomorrow);
   * console.log(`Found ${sms.meta.totalCount} SMS messages scheduled`);
   * ```
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<SmsRequest>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<SmsRequest>>(path);
  }

  /**
   * Updates an existing SMS request.
   *
   * @param data - SMS request update data (must include id)
   * @returns Promise resolving to the updated SMS request
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the SMS request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.outboundSms.update({
   *   id: 'sms_123',
   *   body: 'Updated message content'
   * });
   * console.log('Updated body:', updated.body);
   * ```
   */
  public async update(data: UpdateSmsRequest): Promise<SmsRequest> {
    return this.http.patch<UpdateSmsRequest, SmsRequest>(
      this.resource_path,
      data,
      UpdateSmsRequestSchema
    );
  }

  /**
   * Cancels an SMS request.
   *
   * @param id - SMS request ID
   * @param reason - Optional cancellation reason
   * @returns Promise resolving to the cancelled SMS request
   *
   * @throws {@link WiilAPIError} - When the SMS request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const cancelled = await client.outboundSms.cancel('sms_123', 'No longer needed');
   * console.log('SMS cancelled:', cancelled.id);
   * ```
   */
  public async cancel(id: string, reason?: string): Promise<SmsRequest> {
    return this.http.post<{ reason?: string }, SmsRequest>(
      `${this.resource_path}/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Retries a failed SMS request.
   *
   * @param id - SMS request ID
   * @returns Promise resolving to the SMS request result
   *
   * @throws {@link WiilAPIError} - When the SMS request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundSms.retry('sms_123');
   * console.log('Retry initiated:', result.success);
   * ```
   */
  public async retry(id: string): Promise<SmsRequestResult> {
    return this.http.post<Record<string, never>, SmsRequestResult>(
      `${this.resource_path}/${id}/retry`,
      {}
    );
  }

  /**
   * Deletes an SMS request.
   *
   * @param id - SMS request ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the SMS request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.outboundSms.delete('sms_123');
   * if (deleted) {
   *   console.log('SMS request deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists SMS requests with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of SMS requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundSms.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} SMS requests`);
   * result.data.forEach(sms => {
   *   console.log(`- ${sms.id}: ${sms.to} (${sms.status})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<SmsRequest>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<SmsRequest>>(path);
  }

  /**
   * Creates multiple SMS requests in a single batch request.
   *
   * @param data - Array of SMS request data (maximum 100 items)
   * @returns Promise resolving to paginated result of created SMS requests
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const smsMessages = await client.outboundSms.createBatch([
   *   { to: '+14155551234', body: 'Hello User 1' },
   *   { to: '+14155551235', body: 'Hello User 2' }
   * ]);
   * console.log(`Created ${smsMessages.data.length} SMS requests`);
   * ```
   */
  public async createBatch(
    data: CreateSmsRequest[]
  ): Promise<PaginatedResultType<SmsRequest>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateSmsRequestSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateSmsRequest[], PaginatedResultType<SmsRequest>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
