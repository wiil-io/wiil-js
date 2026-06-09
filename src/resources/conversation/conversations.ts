/**
 * @fileoverview Conversations resource for managing conversation entities.
 * @module resources/conversation/conversations
 */

import {
  ServiceConversationConfigType,
  ConversationStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing conversations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for retrieving, updating, and listing conversations.
 * Conversations represent individual interaction sessions between users and AI agents
 * through various channels (phone, SMS, web chat, email). Supports filtering by
 * customer, channel, type, and date range. All methods require proper authentication
 * via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a conversation by ID
 * const conversation = await client.conversations.get('conv_123');
 *
 * // List conversations by customer
 * const customerConversations = await client.conversations.getByCustomer('cust_123');
 *
 * // Update conversation status
 * const updated = await client.conversations.updateStatus('conv_123', 'COMPLETED');
 * ```
 */
export class ConversationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/conversations';

  /**
   * Creates a new ConversationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a conversation by ID.
   *
   * @param id - Conversation ID
   * @returns Promise resolving to the conversation
   *
   * @throws {@link WiilAPIError} - When the conversation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const conversation = await client.conversations.get('conv_123');
   * console.log('Conversation:', conversation.id);
   * console.log('Type:', conversation.conversation_type);
   * console.log('Status:', conversation.status);
   * ```
   */
  public async get(id: string): Promise<ServiceConversationConfigType> {
    return this.http.get<ServiceConversationConfigType>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves conversations by customer.
   *
   * @param customerId - Customer ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of conversations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const conversations = await client.conversations.getByCustomer('cust_123');
   * console.log(`Found ${conversations.meta.totalCount} conversations`);
   * ```
   */
  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceConversationConfigType>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceConversationConfigType>>(path);
  }

  /**
   * Retrieves conversations by channel.
   *
   * @param channelId - Channel ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of conversations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const conversations = await client.conversations.getByChannel('channel_123');
   * console.log(`Found ${conversations.meta.totalCount} conversations`);
   * ```
   */
  public async getByChannel(
    channelId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceConversationConfigType>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-channel/${channelId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceConversationConfigType>>(path);
  }

  /**
   * Retrieves conversations by deployment configuration.
   *
   * @param deploymentConfigId - Deployment configuration ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of conversations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const conversations = await client.conversations.getByDeployment('deploy_123');
   * console.log(`Found ${conversations.meta.totalCount} conversations`);
   * ```
   */
  public async getByDeployment(
    deploymentConfigId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceConversationConfigType>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-deployment/${deploymentConfigId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceConversationConfigType>>(path);
  }

  /**
   * Retrieves conversations within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of conversations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
   * const conversations = await client.conversations.getByDateRange(lastWeek, Date.now());
   * console.log(`Found ${conversations.meta.totalCount} conversations in the last week`);
   * ```
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceConversationConfigType>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<ServiceConversationConfigType>>(path);
  }

  /**
   * Updates conversation status.
   *
   * @param id - Conversation ID
   * @param status - New conversation status
   * @param reason - Optional reason for status change
   * @returns Promise resolving to the updated conversation
   *
   * @throws {@link WiilAPIError} - When the conversation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.conversations.updateStatus(
   *   'conv_123',
   *   'COMPLETED',
   *   'Issue resolved'
   * );
   * console.log('Updated status:', updated.status);
   * ```
   */
  public async updateStatus(
    id: string,
    status: ConversationStatus,
    reason?: string
  ): Promise<ServiceConversationConfigType> {
    return this.http.patch<{ status: ConversationStatus; reason?: string }, ServiceConversationConfigType>(
      `${this.resource_path}/${id}/status`,
      { status, reason }
    );
  }

  /**
   * Retrieves messages for a conversation.
   *
   * @param id - Conversation ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to the conversation with messages
   *
   * @throws {@link WiilAPIError} - When the conversation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const conversation = await client.conversations.getMessages('conv_123');
   * console.log(`Conversation has ${conversation.messages?.length ?? 0} messages`);
   * ```
   */
  public async getMessages(
    id: string,
    params?: Partial<PaginationRequest>
  ): Promise<ServiceConversationConfigType> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/${id}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<ServiceConversationConfigType>(path);
  }

  /**
   * Generates a summary for a conversation.
   *
   * @param id - Conversation ID
   * @returns Promise resolving to the conversation with generated summary
   *
   * @throws {@link WiilAPIError} - When the conversation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const conversation = await client.conversations.generateSummary('conv_123');
   * console.log('Summary:', conversation.conversationSummary?.summary);
   * console.log('Key points:', conversation.conversationSummary?.key_points);
   * ```
   */
  public async generateSummary(id: string): Promise<ServiceConversationConfigType> {
    return this.http.post<Record<string, never>, ServiceConversationConfigType>(
      `${this.resource_path}/${id}/generate-summary`,
      {}
    );
  }

  /**
   * Deletes a conversation.
   *
   * @param id - Conversation ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the conversation is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.conversations.delete('conv_123');
   * if (deleted) {
   *   console.log('Conversation deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists conversations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of conversations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.conversations.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} conversations`);
   * result.data.forEach(conv => {
   *   console.log(`- ${conv.id}: ${conv.conversation_type} (${conv.status})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ServiceConversationConfigType>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ServiceConversationConfigType>>(path);
  }
}
