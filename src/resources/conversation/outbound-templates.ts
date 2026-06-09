/**
 * @fileoverview Outbound Templates resource for managing message templates.
 * @module resources/conversation/outbound-templates
 */

import {
  OutboundTemplate,
  EmailTemplate,
  SmsTemplate,
  WhatsappTemplate,
  CreateEmailTemplate,
  CreateEmailTemplateSchema,
  CreateSmsTemplate,
  CreateSmsTemplateSchema,
  CreateWhatsappTemplate,
  CreateWhatsappTemplateSchema,
  UpdateEmailTemplate,
  UpdateEmailTemplateSchema,
  UpdateSmsTemplate,
  UpdateSmsTemplateSchema,
  UpdateWhatsappTemplate,
  UpdateWhatsappTemplateSchema,
  OutboundTemplateChannel,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing outbound message templates in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing outbound
 * message templates for email, SMS, and WhatsApp channels. Templates support
 * variable substitution for personalized messaging. All methods require proper
 * authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create an email template
 * const emailTemplate = await client.outboundTemplates.createEmailTemplate({
 *   name: 'Welcome Email',
 *   code: 'welcome_email',
 *   channel: 'EMAIL',
 *   subjectTemplate: 'Welcome, {{name}}!',
 *   bodyHtmlTemplate: '<h1>Hello {{name}}</h1><p>Welcome to our service.</p>',
 *   variables: [{ key: 'name', required: true }]
 * });
 *
 * // Create an SMS template
 * const smsTemplate = await client.outboundTemplates.createSmsTemplate({
 *   name: 'Verification Code',
 *   code: 'verification_sms',
 *   channel: 'SMS',
 *   bodyTemplate: 'Your verification code is {{code}}. Valid for 10 minutes.',
 *   variables: [{ key: 'code', required: true }]
 * });
 * ```
 */
export class OutboundTemplatesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/outbound-templates';

  /**
   * Creates a new OutboundTemplatesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new email template.
   *
   * @param data - Email template data
   * @returns Promise resolving to the created email template
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.createEmailTemplate({
   *   name: 'Order Confirmation',
   *   code: 'order_confirm',
   *   channel: 'EMAIL',
   *   subjectTemplate: 'Order #{{orderNumber}} Confirmed',
   *   bodyHtmlTemplate: '<h1>Thank you for your order!</h1>',
   *   variables: [{ key: 'orderNumber', required: true }]
   * });
   * ```
   */
  public async createEmailTemplate(data: CreateEmailTemplate): Promise<EmailTemplate> {
    return this.http.post<CreateEmailTemplate, EmailTemplate>(
      `${this.resource_path}/email`,
      data,
      CreateEmailTemplateSchema
    );
  }

  /**
   * Creates a new SMS template.
   *
   * @param data - SMS template data
   * @returns Promise resolving to the created SMS template
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.createSmsTemplate({
   *   name: 'Appointment Reminder',
   *   code: 'appt_reminder',
   *   channel: 'SMS',
   *   bodyTemplate: 'Reminder: Your appointment is on {{date}} at {{time}}.',
   *   variables: [
   *     { key: 'date', required: true },
   *     { key: 'time', required: true }
   *   ]
   * });
   * ```
   */
  public async createSmsTemplate(data: CreateSmsTemplate): Promise<SmsTemplate> {
    return this.http.post<CreateSmsTemplate, SmsTemplate>(
      `${this.resource_path}/sms`,
      data,
      CreateSmsTemplateSchema
    );
  }

  /**
   * Creates a new WhatsApp template.
   *
   * @param data - WhatsApp template data
   * @returns Promise resolving to the created WhatsApp template
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.createWhatsappTemplate({
   *   name: 'Shipping Update',
   *   code: 'shipping_update',
   *   channel: 'WHATSAPP',
   *   bodyTemplate: 'Your order {{orderNumber}} has shipped! Track: {{trackingUrl}}',
   *   variables: [
   *     { key: 'orderNumber', required: true },
   *     { key: 'trackingUrl', required: true }
   *   ]
   * });
   * ```
   */
  public async createWhatsappTemplate(data: CreateWhatsappTemplate): Promise<WhatsappTemplate> {
    return this.http.post<CreateWhatsappTemplate, WhatsappTemplate>(
      `${this.resource_path}/whatsapp`,
      data,
      CreateWhatsappTemplateSchema
    );
  }

  /**
   * Retrieves a template by ID.
   *
   * @param id - Template ID
   * @returns Promise resolving to the template
   *
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.get('template_123');
   * console.log('Template name:', template.name);
   * console.log('Channel:', template.channel);
   * ```
   */
  public async get(id: string): Promise<OutboundTemplate> {
    return this.http.get<OutboundTemplate>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a template by code.
   *
   * @param code - Template code identifier
   * @returns Promise resolving to the template
   *
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.getByCode('welcome_email');
   * console.log('Template:', template.name);
   * ```
   */
  public async getByCode(code: string): Promise<OutboundTemplate> {
    return this.http.get<OutboundTemplate>(`${this.resource_path}/by-code/${code}`);
  }

  /**
   * Retrieves templates by channel.
   *
   * @param channel - Template channel (EMAIL, SMS, WHATSAPP)
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of templates
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const emailTemplates = await client.outboundTemplates.getByChannel('EMAIL');
   * console.log(`Found ${emailTemplates.meta.totalCount} email templates`);
   * ```
   */
  public async getByChannel(
    channel: OutboundTemplateChannel,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<OutboundTemplate>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-channel/${channel}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<OutboundTemplate>>(path);
  }

  /**
   * Retrieves templates by tags.
   *
   * @param tags - Array of tags to filter by
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of templates
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const templates = await client.outboundTemplates.getByTags(['marketing', 'promotional']);
   * console.log(`Found ${templates.meta.totalCount} marketing templates`);
   * ```
   */
  public async getByTags(
    tags: string[],
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<OutboundTemplate>> {
    const queryParams = new URLSearchParams();
    tags.forEach(tag => queryParams.append('tags', tag));

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-tags?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<OutboundTemplate>>(path);
  }

  /**
   * Updates an existing email template.
   *
   * @param data - Email template update data (must include id)
   * @returns Promise resolving to the updated email template
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.outboundTemplates.updateEmailTemplate({
   *   id: 'template_123',
   *   subjectTemplate: 'Updated Subject: {{name}}'
   * });
   * ```
   */
  public async updateEmailTemplate(data: UpdateEmailTemplate): Promise<EmailTemplate> {
    return this.http.patch<UpdateEmailTemplate, EmailTemplate>(
      `${this.resource_path}/email`,
      data,
      UpdateEmailTemplateSchema
    );
  }

  /**
   * Updates an existing SMS template.
   *
   * @param data - SMS template update data (must include id)
   * @returns Promise resolving to the updated SMS template
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.outboundTemplates.updateSmsTemplate({
   *   id: 'template_123',
   *   bodyTemplate: 'Updated message: {{content}}'
   * });
   * ```
   */
  public async updateSmsTemplate(data: UpdateSmsTemplate): Promise<SmsTemplate> {
    return this.http.patch<UpdateSmsTemplate, SmsTemplate>(
      `${this.resource_path}/sms`,
      data,
      UpdateSmsTemplateSchema
    );
  }

  /**
   * Updates an existing WhatsApp template.
   *
   * @param data - WhatsApp template update data (must include id)
   * @returns Promise resolving to the updated WhatsApp template
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.outboundTemplates.updateWhatsappTemplate({
   *   id: 'template_123',
   *   bodyTemplate: 'Updated WhatsApp message'
   * });
   * ```
   */
  public async updateWhatsappTemplate(data: UpdateWhatsappTemplate): Promise<WhatsappTemplate> {
    return this.http.patch<UpdateWhatsappTemplate, WhatsappTemplate>(
      `${this.resource_path}/whatsapp`,
      data,
      UpdateWhatsappTemplateSchema
    );
  }

  /**
   * Activates a template.
   *
   * @param id - Template ID
   * @returns Promise resolving to the activated template
   *
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.activate('template_123');
   * console.log('Template activated:', template.isActive);
   * ```
   */
  public async activate(id: string): Promise<OutboundTemplate> {
    return this.http.post<Record<string, never>, OutboundTemplate>(
      `${this.resource_path}/${id}/activate`,
      {}
    );
  }

  /**
   * Deactivates a template.
   *
   * @param id - Template ID
   * @returns Promise resolving to the deactivated template
   *
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.deactivate('template_123');
   * console.log('Template deactivated:', !template.isActive);
   * ```
   */
  public async deactivate(id: string): Promise<OutboundTemplate> {
    return this.http.post<Record<string, never>, OutboundTemplate>(
      `${this.resource_path}/${id}/deactivate`,
      {}
    );
  }

  /**
   * Renders a template with provided variables.
   *
   * @param id - Template ID
   * @param variables - Variable values for rendering
   * @returns Promise resolving to rendered content
   *
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const rendered = await client.outboundTemplates.render('template_123', {
   *   name: 'John Doe',
   *   orderNumber: '12345'
   * });
   * console.log('Rendered content:', rendered);
   * ```
   */
  public async render(
    id: string,
    variables: Record<string, string>
  ): Promise<{ subject?: string; bodyHtml?: string; bodyText?: string; body?: string }> {
    return this.http.post<
      { variables: Record<string, string> },
      { subject?: string; bodyHtml?: string; bodyText?: string; body?: string }
    >(`${this.resource_path}/${id}/render`, { variables });
  }

  /**
   * Deletes a template.
   *
   * @param id - Template ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the template is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.outboundTemplates.delete('template_123');
   * if (deleted) {
   *   console.log('Template deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists templates with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of templates
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.outboundTemplates.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} templates`);
   * result.data.forEach(template => {
   *   console.log(`- ${template.name} (${template.channel})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<OutboundTemplate>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<OutboundTemplate>>(path);
  }
}
