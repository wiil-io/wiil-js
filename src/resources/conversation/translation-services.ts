/**
 * @fileoverview Translation Services resource for managing real-time translation sessions.
 * @module resources/conversation/translation-services
 */

import {
  TranslationServiceLog,
  CreateTranslationServiceLog,
  CreateTranslationServiceLogSchema,
  UpdateTranslationServiceLog,
  UpdateTranslationServiceLogSchema,
  TranslationParticipant,
  CreateTranslationParticipant,
  CreateTranslationParticipantSchema,
  UpdateTranslationParticipant,
  UpdateTranslationParticipantSchema,
  TranslationServiceRequest,
  CreateTranslationServiceRequest,
  CreateTranslationServiceRequestSchema,
  TranslationConversationConfig,
  ConversationStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';
import { WiilValidationError } from '../../errors/WiilError';

const BATCH_LIMIT = 50;

/**
 * Resource class for managing translation services in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, and listing translation
 * service logs and participants. Translation services enable real-time language
 * translation for cross-language communication. All methods require proper
 * authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Initiate a translation session
 * const config = await client.translationServices.initiate({
 *   initiator_id: 'user_123',
 *   initiator_language_code: 'en',
 *   participant_language_code: 'es'
 * });
 *
 * // Get translation session
 * const session = await client.translationServices.get('session_123');
 *
 * // List sessions by organization
 * const sessions = await client.translationServices.getByOrganization('org_123');
 * ```
 */
export class TranslationServicesResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/translation-services';

  /**
   * Creates a new TranslationServicesResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Initiates a new translation session.
   *
   * @param data - Translation service request data
   * @returns Promise resolving to the translation conversation configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const config = await client.translationServices.initiate({
   *   initiator_id: 'user_123',
   *   initiator_language_code: 'en',
   *   participant_language_code: 'ja'
   * });
   * console.log('Session initiated:', config.channel_identifier);
   * console.log('Initiator token:', config.initiator_token);
   * ```
   */
  public async initiate(data: CreateTranslationServiceRequest): Promise<TranslationConversationConfig> {
    return this.http.post<CreateTranslationServiceRequest, TranslationConversationConfig>(
      `${this.resource_path}/initiate`,
      data,
      CreateTranslationServiceRequestSchema
    );
  }

  /**
   * Creates a new translation service log.
   *
   * @param data - Translation service log data
   * @returns Promise resolving to the created translation service log
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const log = await client.translationServices.create({
   *   organization_id: 'org_123',
   *   partner_initiator_id: 'user_123',
   *   direction: 'BIDIRECTIONAL'
   * });
   * console.log('Translation log created:', log.id);
   * ```
   */
  public async create(data: CreateTranslationServiceLog): Promise<TranslationServiceLog> {
    return this.http.post<CreateTranslationServiceLog, TranslationServiceLog>(
      this.resource_path,
      data,
      CreateTranslationServiceLogSchema
    );
  }

  /**
   * Retrieves a translation service log by ID.
   *
   * @param id - Translation service log ID
   * @returns Promise resolving to the translation service log
   *
   * @throws {@link WiilAPIError} - When the log is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const log = await client.translationServices.get('session_123');
   * console.log('Session status:', log.status);
   * console.log('Duration:', log.durationInSeconds);
   * ```
   */
  public async get(id: string): Promise<TranslationServiceLog> {
    return this.http.get<TranslationServiceLog>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves translation service logs by organization.
   *
   * @param organizationId - Organization ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of translation service logs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const logs = await client.translationServices.getByOrganization('org_123');
   * console.log(`Found ${logs.meta.totalCount} translation sessions`);
   * ```
   */
  public async getByOrganization(
    organizationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationServiceLog>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-organization/${organizationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationServiceLog>>(path);
  }

  /**
   * Retrieves translation service logs by project.
   *
   * @param projectId - Project ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of translation service logs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const logs = await client.translationServices.getByProject('project_123');
   * console.log(`Found ${logs.meta.totalCount} translation sessions for project`);
   * ```
   */
  public async getByProject(
    projectId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationServiceLog>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-project/${projectId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationServiceLog>>(path);
  }

  /**
   * Retrieves translation service logs by status.
   *
   * @param status - Session status
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of translation service logs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const activeSessions = await client.translationServices.getByStatus('ACTIVE');
   * console.log(`Found ${activeSessions.meta.totalCount} active sessions`);
   * ```
   */
  public async getByStatus(
    status: ConversationStatus,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationServiceLog>> {
    const queryParams = new URLSearchParams();
    queryParams.append('status', status);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-status?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<TranslationServiceLog>>(path);
  }

  /**
   * Retrieves translation service logs within a date range.
   *
   * @param startDate - Range start timestamp
   * @param endDate - Range end timestamp
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of translation service logs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
   * const logs = await client.translationServices.getByDateRange(lastWeek, Date.now());
   * console.log(`Found ${logs.meta.totalCount} sessions in the last week`);
   * ```
   */
  public async getByDateRange(
    startDate: number,
    endDate: number,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationServiceLog>> {
    const queryParams = new URLSearchParams();
    queryParams.append('startDate', startDate.toString());
    queryParams.append('endDate', endDate.toString());

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-date-range?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<TranslationServiceLog>>(path);
  }

  /**
   * Updates an existing translation service log.
   *
   * @param data - Translation service log update data (must include id)
   * @returns Promise resolving to the updated translation service log
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the log is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.translationServices.update({
   *   id: 'session_123',
   *   status: 'COMPLETED',
   *   translationSummary: 'Discussion about project requirements'
   * });
   * ```
   */
  public async update(data: UpdateTranslationServiceLog): Promise<TranslationServiceLog> {
    return this.http.patch<UpdateTranslationServiceLog, TranslationServiceLog>(
      this.resource_path,
      data,
      UpdateTranslationServiceLogSchema
    );
  }

  /**
   * Updates translation session status.
   *
   * @param id - Translation service log ID
   * @param status - New session status
   * @returns Promise resolving to the updated translation service log
   *
   * @throws {@link WiilAPIError} - When the log is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.translationServices.updateStatus('session_123', 'COMPLETED');
   * console.log('Session status:', updated.status);
   * ```
   */
  public async updateStatus(id: string, status: ConversationStatus): Promise<TranslationServiceLog> {
    return this.http.patch<{ status: ConversationStatus }, TranslationServiceLog>(
      `${this.resource_path}/${id}/status`,
      { status }
    );
  }

  /**
   * Ends a translation session.
   *
   * @param id - Translation service log ID
   * @returns Promise resolving to the ended translation service log
   *
   * @throws {@link WiilAPIError} - When the log is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const ended = await client.translationServices.end('session_123');
   * console.log('Session ended:', ended.status);
   * console.log('Duration:', ended.durationInSeconds, 'seconds');
   * ```
   */
  public async end(id: string): Promise<TranslationServiceLog> {
    return this.http.post<Record<string, never>, TranslationServiceLog>(
      `${this.resource_path}/${id}/end`,
      {}
    );
  }

  /**
   * Generates a summary for a translation session.
   *
   * @param id - Translation service log ID
   * @returns Promise resolving to the translation service log with summary
   *
   * @throws {@link WiilAPIError} - When the log is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const log = await client.translationServices.generateSummary('session_123');
   * console.log('Summary:', log.translationSummary);
   * ```
   */
  public async generateSummary(id: string): Promise<TranslationServiceLog> {
    return this.http.post<Record<string, never>, TranslationServiceLog>(
      `${this.resource_path}/${id}/generate-summary`,
      {}
    );
  }

  /**
   * Retrieves participants for a translation session.
   *
   * @param sessionId - Translation service log ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of participants
   *
   * @throws {@link WiilAPIError} - When the session is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const participants = await client.translationServices.getParticipants('session_123');
   * participants.data.forEach(p => {
   *   console.log(`- ${p.name} (${p.nativeLanguage})`);
   * });
   * ```
   */
  public async getParticipants(
    sessionId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationParticipant>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/${sessionId}/participants${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationParticipant>>(path);
  }

  /**
   * Adds a participant to a translation session.
   *
   * @param sessionId - Translation service log ID
   * @param data - Participant data
   * @returns Promise resolving to the created participant
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the session is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const participant = await client.translationServices.addParticipant('session_123', {
   *   nativeLanguage: 'es',
   *   participantAccessId: 12345,
   *   participantToken: 'token_abc'
   * });
   * console.log('Participant added:', participant.id);
   * ```
   */
  public async addParticipant(
    sessionId: string,
    data: CreateTranslationParticipant
  ): Promise<TranslationParticipant> {
    return this.http.post<CreateTranslationParticipant, TranslationParticipant>(
      `${this.resource_path}/${sessionId}/participants`,
      data,
      CreateTranslationParticipantSchema
    );
  }

  /**
   * Updates a participant in a translation session.
   *
   * @param sessionId - Translation service log ID
   * @param data - Participant update data (must include id)
   * @returns Promise resolving to the updated participant
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the participant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.translationServices.updateParticipant('session_123', {
   *   id: 'participant_456',
   *   name: 'John Doe'
   * });
   * ```
   */
  public async updateParticipant(
    sessionId: string,
    data: UpdateTranslationParticipant
  ): Promise<TranslationParticipant> {
    return this.http.patch<UpdateTranslationParticipant, TranslationParticipant>(
      `${this.resource_path}/${sessionId}/participants`,
      data,
      UpdateTranslationParticipantSchema
    );
  }

  /**
   * Removes a participant from a translation session.
   *
   * @param sessionId - Translation service log ID
   * @param participantId - Participant ID
   * @returns Promise resolving to boolean indicating removal success
   *
   * @throws {@link WiilAPIError} - When the participant is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const removed = await client.translationServices.removeParticipant('session_123', 'participant_456');
   * if (removed) {
   *   console.log('Participant removed successfully');
   * }
   * ```
   */
  public async removeParticipant(sessionId: string, participantId: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${sessionId}/participants/${participantId}`);
  }

  /**
   * Deletes a translation service log.
   *
   * @param id - Translation service log ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the log is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const deleted = await client.translationServices.delete('session_123');
   * if (deleted) {
   *   console.log('Translation session deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists translation service logs with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of translation service logs
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const result = await client.translationServices.list({ page: 1, pageSize: 20 });
   * console.log(`Found ${result.meta.totalCount} translation sessions`);
   * result.data.forEach(log => {
   *   console.log(`- ${log.id}: ${log.status} (${log.durationInSeconds}s)`);
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
