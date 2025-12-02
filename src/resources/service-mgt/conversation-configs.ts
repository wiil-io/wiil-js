/**
 * @fileoverview Conversation Configurations resource for managing conversation configuration entities.
 * @module resources/service-mgt/conversation-configs
 */

import {
  ServiceConversationConfigType,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing conversation configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for retrieving and listing conversation configurations.
 * Conversation configurations define how AI agents manage conversation state,
 * context, and flow. This is a read-only resource. All methods require proper
 * authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a conversation configuration by ID
 * const config = await client.conversationConfigs.get('conv_123');
 *
 * // List all conversation configurations
 * const configs = await client.conversationConfigs.list({
 *   page: 1,
 *   pageSize: 20
 * });
 * ```
 */
export class ConversationConfigurationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/conversation-configs';

  /**
   * Creates a new ConversationConfigurationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a conversation configuration by ID.
   *
   * @param id - Conversation configuration ID
   * @returns Promise resolving to the conversation configuration
   *
   * @throws {@link WiilAPIError} - When the conversation configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const config = await client.conversationConfigs.get('conv_123');
   * console.log('Config:', config.id);
   * console.log('Max Turns:', config.maxTurns);
   * console.log('Context Window:', config.contextWindow);
   * ```
   */
  public async get(id: string): Promise<ServiceConversationConfigType> {
    return this.http.get<ServiceConversationConfigType>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists conversation configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of conversation configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.conversationConfigs.list();
   *
   * // List with custom pagination
   * const page2 = await client.conversationConfigs.list({
   *   page: 2,
   *   pageSize: 50,
   *   sortBy: 'createdAt',
   *   sortDirection: 'desc'
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} conversation configurations`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(config => {
   *   console.log(`- ${config.name} (Max Turns: ${config.maxTurns})`);
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
