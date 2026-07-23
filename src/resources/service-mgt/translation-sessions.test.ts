/**
 * @fileoverview Tests for Translation Sessions resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import {
  TranslationSession,
  TranslationSessionStatus,
  PaginatedResultType,
  TranslationDirection,
} from 'wiil-core-js';
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
      const mockResponse: TranslationSession = {
        id: 'session_123',
        organizationId: 'org_456',
        projectId: 'proj_789',
        externalInitiatorId: 'init_123',
        externalSessionId: 'external_sess_456',
        sdrtnId: 'sdrtn_789',
        translationConfigId: 'config_123',
        durationInSeconds: 1500,
        status: TranslationSessionStatus.COMPLETED,
        direction: TranslationDirection.BIDIRECTIONAL,
        startedAt: 1705312800,
        endedAt: 1705314300,
        summary: 'Customer support translation session',
        stateHistory: [
          {
            status: TranslationSessionStatus.PENDING,
            timestamp: 1705312700,
          },
          {
            status: TranslationSessionStatus.ACTIVE,
            timestamp: 1705312800,
          },
          {
            status: TranslationSessionStatus.COMPLETED,
            timestamp: 1705314300,
            reason: 'Session ended normally',
          },
        ],
        createdAt: 1705312700,
        updatedAt: 1705314300,
      };

      nock(BASE_URL)
        .get('/translation-sessions/session_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.translationSessions.get('session_123');

      expect(result.id).toBe('session_123');
      expect(result.organizationId).toBe('org_456');
      expect(result.status).toBe(TranslationSessionStatus.COMPLETED);
      expect(result.direction).toBe(TranslationDirection.BIDIRECTIONAL);
      expect(result.durationInSeconds).toBe(1500);
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
      const mockSessions: TranslationSession[] = [
        {
          id: 'session_1',
          organizationId: 'org_456',
          projectId: 'proj_789',
          externalInitiatorId: 'init_123',
          externalSessionId: 'external_sess_1',
          translationConfigId: 'config_123',
          durationInSeconds: 800,
          status: TranslationSessionStatus.COMPLETED,
          direction: TranslationDirection.BIDIRECTIONAL,
          startedAt: 1705312800,
          endedAt: 1705313600,
          createdAt: 1705312700,
          updatedAt: 1705313600,
        },
        {
          id: 'session_2',
          organizationId: 'org_456',
          projectId: 'proj_789',
          externalInitiatorId: 'init_456',
          externalSessionId: 'external_sess_2',
          translationConfigId: 'config_124',
          durationInSeconds: 900,
          status: TranslationSessionStatus.ACTIVE,
          direction: TranslationDirection.UNIDIRECTIONAL,
          startedAt: 1705314000,
          createdAt: 1705313900,
          updatedAt: 1705314000,
        },
      ];

      const mockResponse: PaginatedResultType<TranslationSession> = {
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
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.translationSessions.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.data[0].status).toBe(TranslationSessionStatus.COMPLETED);
      expect(result.data[1].status).toBe(TranslationSessionStatus.ACTIVE);
    });

    it('should list translation sessions with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<TranslationSession> = {
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
        .matchHeader('X-Wiil-Api-Key', API_KEY)
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
