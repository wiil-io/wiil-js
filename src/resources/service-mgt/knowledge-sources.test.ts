/**
 * @fileoverview Tests for Knowledge Sources resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { KnowledgeSource, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('KnowledgeSourcesResource', () => {
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
    it('should retrieve a knowledge source by ID', async () => {
      const mockResponse: KnowledgeSource = {
        id: 'ks_123',
        name: 'Product Documentation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/knowledge-sources/ks_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.knowledgeSources.get('ks_123');

      expect(result.id).toBe('ks_123');
      expect(result.name).toBe('Product Documentation');
    });

    it('should throw API error when knowledge source not found', async () => {
      nock(BASE_URL)
        .get('/knowledge-sources/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Knowledge source not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.knowledgeSources.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list knowledge sources with pagination', async () => {
      const mockSources: KnowledgeSource[] = [
        {
          id: 'ks_1',
          name: 'Source 1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ks_2',
          name: 'Source 2',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<KnowledgeSource> = {
        data: mockSources,
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
        .get('/knowledge-sources')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.knowledgeSources.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });
});
