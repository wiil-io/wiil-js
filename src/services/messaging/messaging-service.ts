/**
 * @fileoverview Messaging service operations.
 * @module services/messaging/messaging-service
 */

import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';
import {
  BusinessCallRequest,
  BusinessCallRequestSchema,
  CreateCallRequest,
  CreateCallRequestSchema,
  CreateEmailRequest,
  CreateEmailRequestSchema,
  CreateSmsRequest,
  CreateSmsRequestSchema,
  EmailRequest,
  EmailRequestSchema,
  SmsRequest,
  SmsRequestSchema,
} from 'wiil-core-js';

const CALL_REQUEST_RESOURCE_PATH = '/messaging/call';
const SMS_REQUEST_RESOURCE_PATH = '/messaging/sms';
const EMAIL_REQUEST_RESOURCE_PATH = '/messaging/email';

/**
 * Service class for outbound messaging workflows.
 */
export class MessagingService {
  private readonly http: HttpClient;

  /**
   * Creates a new MessagingService instance.
   *
   * @param http - HTTP client for API communication
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Requests an outbound AI-powered phone call.
   *
   * Schedules or immediately initiates an outbound call using the configured AI agent.
   * Supports immediate execution, scheduled calls, and recurring patterns with
   * configurable retry logic and TCPA-compliant calling hours restrictions.
   *
   * @param request - Call request configuration containing:
   *   - `to` - Destination phone number in E.164 format (e.g., '+12125551234')
   *   - `from` - Caller ID phone number in E.164 format
   *   - `agentConfigurationId` - AI agent configuration defining behavior and persona
   *   - `scheduleType` - Timing strategy: 'IMMEDIATE', 'SCHEDULED', or 'RECURRING'
   *   - `callingHours` - Optional permitted calling window for TCPA compliance
   *   - `maxRetries` - Optional retry attempts if call fails (0-5)
   *   - `scheduledAt` - Optional Unix timestamp (ms) for scheduled execution
   *
   * @returns The created business call request record with assigned ID and status
   *
   * @throws {WiilValidationError} When response validation fails
   *
   * @example
   * ```typescript
   * const callRequest = await messaging.requestCall({
   *   to: '+12125551234',
   *   from: '+12125559999',
   *   agentConfigurationId: 'agent_456',
   *   scheduleType: 'IMMEDIATE',
   *   callingHours: {
   *     startTime: '09:00',
   *     endTime: '17:00',
   *     daysOfWeek: [1, 2, 3, 4, 5]
   *   }
   * });
   * ```
   */
  public async requestCall(
    request: CreateCallRequest
  ): Promise<BusinessCallRequest> {
    const response = await this.http.post<CreateCallRequest, BusinessCallRequest>(
      CALL_REQUEST_RESOURCE_PATH,
      request,
      CreateCallRequestSchema
    );

    const parsed = BusinessCallRequestSchema.safeParse(response);
    if (!parsed.success) {
      throw new WiilValidationError(
        'Response validation failed for business call request.',
        parsed.error.issues
      );
    }

    return parsed.data;
  }

  /**
   * Sends an outbound SMS text message.
   *
   * Delivers a text message to the specified recipient with support for
   * template-based composition, variable substitution, and scheduled delivery.
   * Standard SMS supports 160 characters (GSM-7) or 70 characters per segment (Unicode).
   *
   * @param request - SMS request configuration containing:
   *   - `to` - Recipient phone number in E.164 format (e.g., '+12125551234')
   *   - `body` - Text content of the message
   *   - `from` - Optional sender phone number in E.164 format
   *   - `templateId` - Optional pre-defined SMS template ID
   *   - `variables` - Optional template variable substitutions (e.g., `{firstName: 'John'}`)
   *   - `scheduledAt` - Optional Unix timestamp (ms) for scheduled delivery
   *
   * @returns The created SMS request record with assigned ID and delivery status
   *
   * @throws {WiilValidationError} When response validation fails
   *
   * @example
   * ```typescript
   * const sms = await messaging.sendSms({
   *   to: '+12125551234',
   *   body: 'Hi {{firstName}}, your appointment is confirmed for {{time}}.',
   *   variables: { firstName: 'John', time: '3:00 PM' }
   * });
   * ```
   */
  public async sendSms(
    request: CreateSmsRequest
  ): Promise<SmsRequest> {
    const response = await this.http.post<CreateSmsRequest, SmsRequest>(
      SMS_REQUEST_RESOURCE_PATH,
      request,
      CreateSmsRequestSchema
    );

    const parsed = SmsRequestSchema.safeParse(response);
    if (!parsed.success) {
      throw new WiilValidationError(
        'Response validation failed for SMS request.',
        parsed.error.issues
      );
    }

    return parsed.data;
  }

  /**
   * Sends an outbound email message.
   *
   * Delivers an email to specified recipients with support for HTML/text content,
   * file attachments, template-based composition with variable substitution,
   * and scheduled delivery. Integrates with SendGrid, SES, and other providers.
   *
   * @param request - Email request configuration containing:
   *   - `to` - Array of primary recipients with email and optional name
   *   - `subject` - Email subject line (supports `{{variable}}` substitution)
   *   - `bodyHtml` - HTML content of the email body
   *   - `bodyText` - Optional plain text alternative for accessibility
   *   - `cc` - Optional array of carbon copy recipients
   *   - `bcc` - Optional array of blind carbon copy recipients
   *   - `replyTo` - Optional reply-to email address
   *   - `templateId` - Optional pre-defined email template ID
   *   - `variables` - Optional template variable substitutions
   *   - `attachments` - Optional file attachments (base64-encoded, max 25MB total)
   *   - `scheduledAt` - Optional Unix timestamp (ms) for scheduled delivery
   *
   * @returns The created email request record with assigned ID and delivery status
   *
   * @throws {WiilValidationError} When response validation fails
   *
   * @example
   * ```typescript
   * const email = await messaging.sendEmail({
   *   to: [{ email: 'customer@example.com', name: 'Customer' }],
   *   subject: 'Your Order Confirmation - #{{orderId}}',
   *   bodyHtml: '<h1>Thank you, {{name}}!</h1><p>Your order is confirmed.</p>',
   *   variables: { orderId: '12345', name: 'John' }
   * });
   * ```
   */
  public async sendEmail(
    request: CreateEmailRequest
  ): Promise<EmailRequest> {
    const response = await this.http.post<CreateEmailRequest, EmailRequest>(
      EMAIL_REQUEST_RESOURCE_PATH,
      request,
      CreateEmailRequestSchema
    );

    const parsed = EmailRequestSchema.safeParse(response);
    if (!parsed.success) {
      throw new WiilValidationError(
        'Response validation failed for email request.',
        parsed.error.issues
      );
    }

    return parsed.data;
  }
}
