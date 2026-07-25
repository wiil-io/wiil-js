/**
 * @fileoverview Translation service for managing real-time translation sessions.
 * @module services/translation/translation-service
 */

import {
  TranslationSession,
  TranslationParticipant,
  CreateTranslationParticipant,
  CreateTranslationParticipantSchema,
  UpdateTranslationParticipant,
  UpdateTranslationParticipantSchema,
  TranslationSessionRequest,
  TranslationSessionRequestSchema,
  TranslationSessionAccess,
  TranslationSessionStatus,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Service class for managing translation sessions in the WIIL Platform.
 *
 * @remarks
 * Provides methods for initiating, retrieving, and listing translation sessions
 * and participants. Translation services enable real-time language translation
 * for cross-language communication.
 *
 * @example
 * ```typescript
 * const service = new WiilService({ apiKey: 'your-api-key' });
 *
 * // Initiate a translation session
 * const access = await service.translation.initiate({
 *   initiator: { externalParticipantId: 'user_123', language: 'en' },
 *   participant: { language: 'es' }
 * });
 *
 * // Get translation session
 * const session = await service.translation.get('session_123');
 *
 * // List sessions by organization
 * const sessions = await service.translation.getByOrganization('org_123');
 * ```
 */
export class TranslationService {
  private readonly http: HttpClient;
  private readonly resource_path = '/translation-services';

  /**
   * Creates a new TranslationService instance.
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
   * @param data - Translation session request data
   * @returns Promise resolving to the translation session access configuration
   *
   * @example
   * ```typescript
   * const access = await service.translation.initiate({
   *   initiator: { externalParticipantId: 'user_123', language: 'en' },
   *   participant: { language: 'ja' }
   * });
   * console.log('Session initiated:', access.translationSessionId);
   * ```
   */
  public async initiate(data: TranslationSessionRequest): Promise<TranslationSessionAccess> {
    return this.http.post<TranslationSessionRequest, TranslationSessionAccess>(
      `${this.resource_path}/initiate`,
      data,
      TranslationSessionRequestSchema
    );
  }

  /**
   * Retrieves a translation session by ID.
   *
   * @param id - Translation session ID
   * @returns Promise resolving to the translation session
   *
   * @example
   * ```typescript
   * const session = await service.translation.get('session_123');
   * console.log('Session status:', session.status);
   * ```
   */
  public async get(id: string): Promise<TranslationSession> {
    return this.http.get<TranslationSession>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves translation sessions by organization.
   *
   * @param organizationId - Organization ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of translation sessions
   */
  public async getByOrganization(
    organizationId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationSession>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-organization/${organizationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationSession>>(path);
  }

  /**
   * Updates translation session status.
   *
   * @param id - Translation session ID
   * @param status - New session status
   * @returns Promise resolving to the updated translation session
   */
  public async updateStatus(id: string, status: TranslationSessionStatus): Promise<TranslationSession> {
    return this.http.patch<{ status: TranslationSessionStatus }, TranslationSession>(
      `${this.resource_path}/${id}/status`,
      { status }
    );
  }

  /**
   * Ends a translation session.
   *
   * @param id - Translation session ID
   * @returns Promise resolving to the ended translation session
   */
  public async end(id: string): Promise<TranslationSession> {
    return this.http.post<Record<string, never>, TranslationSession>(
      `${this.resource_path}/${id}/end`,
      {}
    );
  }

  /**
   * Retrieves participants for a translation session.
   *
   * @param sessionId - Translation session ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of participants
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
   * @param sessionId - Translation session ID
   * @param data - Participant data
   * @returns Promise resolving to the created participant
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
   * @param sessionId - Translation session ID
   * @param data - Participant update data (must include id)
   * @returns Promise resolving to the updated participant
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
   * Deletes a translation session.
   *
   * @param id - Translation session ID
   * @returns Promise resolving to boolean indicating deletion success
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists translation sessions with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of translation sessions
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationSession>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationSession>>(path);
  }
}
