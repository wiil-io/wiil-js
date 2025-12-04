/**
 * @fileoverview Tests for Translation Sessions resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { TranslationServiceLog, PaginatedResultType, ConversationStatus, TranslationDirection } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('TranslationSessionsResource', () => {
  let client: WiilClient;

  beforeEach(() => {
    client = new WiilClient({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('get', () => {
    it('should retrieve a translation session by ID', async () => {
      const mockResponse: TranslationServiceLog = {
        id: 'session_123',
        organization_id: 'org_456',
        project_id: 'proj_789',
        partner_initiator_id: 'init_123',
        partner_session_id: 'partner_sess_456',
        sdrtn_id: 'sdrtn_789',
        translationConfigId: 'config_123',
        participants: ['participant_1', 'participant_2'],
        durationInSeconds: 1500,
        status: ConversationStatus.ENDED,
        direction: TranslationDirection.BIDIRECTIONAL,
        transcribedConversationLog: [
          {
            messageId: 'msg_1',
            speakerParticipantId: 'participant_1',
            targetParticipantId: 'participant_2',
            originalText: 'Hello, how can I help you?',
            translatedText: 'Hola, ¿cómo puedo ayudarte?',
            originalLanguage: 'en-US',
            targetLanguage: 'es-ES',
            provisioningConfigId: 'config_123',
            timestamp: Date.now(),
          },
        ],
        logTranscriptionInParticipantRecords: false,
        translationSummary: 'Customer support translation session',
        created_day: '2025-01-15',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/translation-sessions/session_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.translationSessions.get('session_123');

      expect(result.id).toBe('session_123');
      expect(result.organization_id).toBe('org_456');
      expect(result.status).toBe(ConversationStatus.ENDED);
      expect(result.direction).toBe(TranslationDirection.BIDIRECTIONAL);
    });

    it('should throw API error when translation session not found', async () => {
      nock(BASE_URL)
        .get('/translation-sessions/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Translation session not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.translationSessions.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list translation sessions with pagination', async () => {
      const mockSessions: TranslationServiceLog[] = [
        {
          id: 'session_1',
          organization_id: 'org_456',
          project_id: 'proj_789',
          partner_initiator_id: 'init_123',
          partner_session_id: 'partner_sess_1',
          translationConfigId: 'config_123',
          participants: ['participant_1', 'participant_2'],
          durationInSeconds: 800,
          status: ConversationStatus.ENDED,
          direction: TranslationDirection.BIDIRECTIONAL,
          logTranscriptionInParticipantRecords: false,
          created_day: '2025-01-15',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'session_2',
          organization_id: 'org_456',
          project_id: 'proj_789',
          partner_initiator_id: 'init_456',
          partner_session_id: 'partner_sess_2',
          translationConfigId: 'config_124',
          participants: ['participant_3', 'participant_4'],
          durationInSeconds: 900,
          status: ConversationStatus.ACTIVE,
          direction: TranslationDirection.UNIDIRECTIONAL,
          logTranscriptionInParticipantRecords: true,
          created_day: '2025-01-15',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TranslationServiceLog> = {
        data: mockSessions,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/translation-sessions')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.translationSessions.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.data[0].status).toBe(ConversationStatus.ENDED);
      expect(result.data[1].status).toBe(ConversationStatus.ACTIVE);
    });

    it('should list translation sessions with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<TranslationServiceLog> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 50,
          totalCount: 100,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/translation-sessions')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.translationSessions.list({
        page: 2,
        pageSize: 50,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
