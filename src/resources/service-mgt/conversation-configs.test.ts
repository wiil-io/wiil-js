/**
 * @fileoverview Tests for Conversation Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { ServiceConversationConfigType, PaginatedResultType, ServiceConversationType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ConversationConfigurationsResource', () => {
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
    it('should retrieve a conversation configuration by ID', async () => {
      const mockResponse: ServiceConversationConfigType = {
        id: 'conv_123',
        channel_id: 'ch_456',
        organization_id: 'org_789',
        project_id: 'proj_101',
        deployment_config_id: 'deploy_202',
        channel_identifier: '+12125551234',
        conversation_type: ServiceConversationType.OTT_CHAT,
        is_campaign: false,
        durationInSeconds: 15,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      nock(BASE_URL)
        .get('/cconversation-configurations/conv_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.conversationConfigs.get('conv_123');

      expect(result.id).toBe('conv_123');
      expect(result.channel_id).toBe('ch_456');
      expect(result.conversation_type).toBe(ServiceConversationType.OTT_CHAT);
    });

    it('should throw API error when conversation configuration not found', async () => {
      nock(BASE_URL)
        .get('/cconversation-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Conversation configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.conversationConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list conversation configurations with pagination', async () => {
      const mockConfigs: ServiceConversationConfigType[] = [
        {
          id: 'conv_1',
          channel_id: 'ch_100',
          organization_id: 'org_789',
          project_id: 'proj_101',
          deployment_config_id: 'deploy_202',
          channel_identifier: '+12125551234',
          conversation_type: ServiceConversationType.OTT_CHAT,
          is_campaign: false,
          durationInSeconds: 15,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
        {
          id: 'conv_2',
          channel_id: 'ch_200',
          organization_id: 'org_789',
          project_id: 'proj_101',
          deployment_config_id: 'deploy_202',
          channel_identifier: '+12125555678',
          conversation_type: ServiceConversationType.TELEPHONY_CALL,
          is_campaign: false,
          durationInSeconds: 30,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceConversationConfigType> = {
        data: mockConfigs,
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
        .get('/cconversation-configurations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.conversationConfigs.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });
});
