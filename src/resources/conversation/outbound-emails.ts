/**
 * @fileoverview Outbound Emails resource for managing email requests and delivery tracking.
 * @module resources/conversation/outbound-emails
 */

import {
  EmailRequest,
  CreateEmailRequest,
  CreateEmailRequestSchema,
  UpdateEmailRequest,
  UpdateEmailRequestSchema,
  EmailRequestResult,
  EmailRecord,
  EmailStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing outbound email requests in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing outbound email
 * requests. Supports scheduling, templates, attachments, and delivery tracking
 * with retry logic. All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Send an immediate email
 * const email = await client.outboundEmails.create({
 *   to: [{ email: 'customer@example.com', name: 'Customer' }],
 *   subject: 'Order Confirmation',
 *   bodyHtml: '<h1>Thank you for your order!</h1>'
 * });
 *
 * // Schedule an email
 * const scheduledEmail = await client.outboundEmails.create({
 *   to: [{ email: 'customer@example.com' }],
 *   subject: 'Reminder',
 *   bodyHtml: '<p>Your appointment is tomorrow</p>',
 *   scheduledAt: Date.now() + 86400000 // 24 hours from now
 * });
 * ```
 */
export class OutboundEmailsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/outbound-emails';

  /**
   * Creates a new OutboundEmailsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new outbound email request.
   *
   * @param data - Email request data
   * @returns Promise resolving to the email request result
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundEmails.create({
   *   to: [{ email: 'customer@example.com', name: 'John Doe' }],
   *   cc: [{ email: 'team@example.com' }],
   *   subject: 'Welcome to Our Service',
   *   bodyHtml: '<h1>Welcome!</h1><p>Thank you for signing up.</p>',
   *   bodyText: 'Welcome! Thank you for signing up.',
   *   replyTo: 'support@example.com'
   * });
   * console.log('Email sent:', result.request?.id);
   * ```
   */
  public async create(data: CreateEmailRequest): Promise<EmailRequestResult> {
    return this.http.post<CreateEmailRequest, EmailRequestResult>(
      this.resource_path,
      data,
      CreateEmailRequestSchema
    );
  }

  /**
   * Retrieves an email request by ID.
   *
   * @param id - Email request ID
   * @returns Promise resolving to the email request
   *
   * @throws {@link WiilAPIError} - When the email request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const email = await client.outboundEmails.get('email_123');
   * console.log('Email status:', email.status);
   * console.log('Subject:', email.subject);
   * ```
   */
  public async get(id: string): Promise<EmailRequest> {
    return this.http.get<EmailRequest>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves email requests by status.
   *
   * @param status - Email status
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of email requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const pendingEmails = await client.outboundEmails.getByStatus('PENDING');
   * console.log(`Found ${pendingEmails.meta.totalCount} pending emails`);
   * ```
   */
  public async getByStatus(
    status: EmailStatus,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<EmailRequest>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<EmailRequest>>(path);
  }

  /**
   * Retrieves email requests by template.
   *
   * @param templateId - Template ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of email requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const emails = await client.outboundEmails.getByTemplate('template_123');
   * console.log(`Found ${emails.meta.totalCount} emails using this template`);
   * ```
   */
  public async getByTemplate(
    templateId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<EmailRequest>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-template/${templateId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<EmailRequest>>(path);
  }

  /**
   * Retrieves email requests scheduled within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of email requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
   * const emails = await client.outboundEmails.getByDateRange(Date.now(), tomorrow);
   * console.log(`Found ${emails.meta.totalCount} emails scheduled`);
   * ```
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<EmailRequest>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<EmailRequest>>(path);
  }

  /**
   * Updates an existing email request.
   *
   * @param data - Email request update data (must include id)
   * @returns Promise resolving to the updated email request
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the email request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.outboundEmails.update({
   *   id: 'email_123',
   *   subject: 'Updated Subject Line'
   * });
   * console.log('Updated subject:', updated.subject);
   * ```
   */
  public async update(data: UpdateEmailRequest): Promise<EmailRequest> {
    return this.http.patch<UpdateEmailRequest, EmailRequest>(
      this.resource_path,
      data,
      UpdateEmailRequestSchema
    );
  }

  /**
   * Cancels an email request.
   *
   * @param id - Email request ID
   * @param reason - Optional cancellation reason
   * @returns Promise resolving to the cancelled email request
   *
   * @throws {@link WiilAPIError} - When the email request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const cancelled = await client.outboundEmails.cancel('email_123', 'No longer needed');
   * console.log('Email cancelled:', cancelled.id);
   * ```
   */
  public async cancel(id: string, reason?: string): Promise<EmailRequest> {
    return this.http.post<{ reason?: string }, EmailRequest>(
      `${this.resource_path}/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Retries a failed email request.
   *
   * @param id - Email request ID
   * @returns Promise resolving to the email request result
   *
   * @throws {@link WiilAPIError} - When the email request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundEmails.retry('email_123');
   * console.log('Retry initiated:', result.success);
   * ```
   */
  public async retry(id: string): Promise<EmailRequestResult> {
    return this.http.post<Record<string, never>, EmailRequestResult>(
      `${this.resource_path}/${id}/retry`,
      {}
    );
  }

  /**
   * Retrieves delivery records for an email request.
   *
   * @param id - Email request ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of email records
   *
   * @throws {@link WiilAPIError} - When the email request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const records = await client.outboundEmails.getRecords('email_123');
   * records.data.forEach(record => {
   *   console.log(`Delivery status: ${record.status} at ${record.sentAt}`);
   * });
   * ```
   */
  public async getRecords(
    id: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<EmailRecord>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/${id}/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<EmailRecord>>(path);
  }

  /**
   * Deletes an email request.
   *
   * @param id - Email request ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the email request is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.outboundEmails.delete('email_123');
   * if (deleted) {
   *   console.log('Email request deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists email requests with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of email requests
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundEmails.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} email requests`);
   * result.data.forEach(email => {
   *   console.log(`- ${email.id}: ${email.subject} (${email.status})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<EmailRequest>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<EmailRequest>>(path);
  }

  /**
   * Creates multiple email requests in a single batch request.
   *
   * @param data - Array of email request data (maximum 50 items)
   * @returns Promise resolving to paginated result of created email requests
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const emails = await client.outboundEmails.createBatch([
   *   { to: [{ email: 'user1@example.com' }], subject: 'Hello', bodyHtml: '<p>Hi!</p>' },
   *   { to: [{ email: 'user2@example.com' }], subject: 'Hello', bodyHtml: '<p>Hi!</p>' }
   * ]);
   * console.log(`Created ${emails.data.length} email requests`);
   * ```
   */
  public async createBatch(
    data: CreateEmailRequest[]
  ): Promise<PaginatedResultType<EmailRequest>> {
    if (data.length > BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateEmailRequestSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateEmailRequest[], PaginatedResultType<EmailRequest>>(
      `${this.resource_path}/batch`,
      data
    );
  }
}
