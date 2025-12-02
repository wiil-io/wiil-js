/**
 * @fileoverview Knowledge Sources resource for managing knowledge source entities.
 * @module resources/service-mgt/knowledge-sources
 */

import {
  KnowledgeSource,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing knowledge sources in the WIIL Platform.
 *
 * @remarks
 * Provides methods for retrieving and listing knowledge sources.
 * Knowledge sources represent repositories of information that AI agents
 * can access for context and factual grounding. This is a read-only resource.
 * All methods require proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a knowledge source by ID
 * const source = await client.knowledgeSources.get('ks_123');
 *
 * // List all knowledge sources
 * const sources = await client.knowledgeSources.list({
 *   page: 1,
 *   pageSize: 20
 * });
 * ```
 */
export class KnowledgeSourcesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/knowledge-sources';

  /**
   * Creates a new KnowledgeSourcesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a knowledge source by ID.
   *
   * @param id - Knowledge source ID
   * @returns Promise resolving to the knowledge source
   *
   * @throws {@link WiilAPIError} - When the knowledge source is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const source = await client.knowledgeSources.get('ks_123');
   * console.log('Source:', source.id);
   * console.log('Name:', source.name);
   * console.log('Type:', source.type);
   * ```
   */
  public async get(id: string): Promise<KnowledgeSource> {
    return this.http.get<KnowledgeSource>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists knowledge sources with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of knowledge sources
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.knowledgeSources.list();
   *
   * // List with custom pagination
   * const page2 = await client.knowledgeSources.list({
   *   page: 2,
   *   pageSize: 50
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} knowledge sources`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(source => {
   *   console.log(`- ${source.name} (${source.type})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<KnowledgeSource>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<KnowledgeSource>>(path);
  }
}
