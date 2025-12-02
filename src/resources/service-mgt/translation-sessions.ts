/**
 * @fileoverview Translation Sessions resource for managing translation session entities.
 * @module resources/service-mgt/translation-sessions
 */

import {
  TranslationServiceLog,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing translation sessions in the WIIL Platform.
 *
 * @remarks
 * Provides methods for retrieving and listing translation sessions.
 * Translation sessions represent logs and records of translation operations
 * performed by the AI system. All methods require proper authentication via
 * API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Get a translation session by ID
 * const session = await client.translationSessions.get('session_123');
 *
 * // List all translation sessions
 * const sessions = await client.translationSessions.list({
 *   page: 1,
 *   pageSize: 20
 * });
 * ```
 */
export class TranslationSessionsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/translation-sessions';

  /**
   * Creates a new TranslationSessionsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Retrieves a translation session by ID.
   *
   * @param id - Translation session ID
   * @returns Promise resolving to the translation session
   *
   * @throws {@link WiilAPIError} - When the translation session is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const session = await client.translationSessions.get('session_123');
   * console.log('Session:', session.id);
   * console.log('Source Language:', session.sourceLanguage);
   * console.log('Target Language:', session.targetLanguage);
   * ```
   */
  public async get(id: string): Promise<TranslationServiceLog> {
    return this.http.get<TranslationServiceLog>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists translation sessions with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of translation sessions
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.translationSessions.list();
   *
   * // List with custom pagination
   * const page2 = await client.translationSessions.list({
   *   page: 2,
   *   pageSize: 50,
   *   sortBy: 'createdAt',
   *   sortDirection: 'desc'
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} translation sessions`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(session => {
   *   console.log(`- Session ${session.id} (${session.sourceLanguage} -> ${session.targetLanguage})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationServiceLog>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationServiceLog>>(path);
  }
}
