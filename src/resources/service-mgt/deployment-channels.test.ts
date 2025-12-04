/**
 * @fileoverview Tests for Deployment Channels resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { DeploymentChannel, PaginatedResultType, DeploymentType, OttCommunicationType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';
import { DeploymentType as LocalDeploymentType } from './deployment-channels';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('DeploymentChannelsResource', () => {
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

  describe('create', () => {
    it('should create a new phone deployment channel', async () => {
      const input = {
        deploymentType: DeploymentType.CALLS,
        channelName: 'Customer Support Line',
        recordingEnabled: true,
        channelIdentifier: '+12125551234',
        configuration: {
          phoneConfigurationId: 'phone_123',
          hasForwardingEnabled: false,
        },
      };

      const mockResponse: DeploymentChannel = {
        id: 'channel_123',
        deploymentType: DeploymentType.CALLS,
        channelName: 'Customer Support Line',
        recordingEnabled: true,
        channelIdentifier: '+12125551234',
        configuration: {
          phoneConfigurationId: 'phone_123',
          hasForwardingEnabled: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/deployment-channels', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.create(input);

      expect(result.id).toBe('channel_123');
      expect(result.channelIdentifier).toBe('+12125551234');
      expect(result.deploymentType).toBe(DeploymentType.CALLS);
    });

    it('should create a new web deployment channel', async () => {
      const input = {
        deploymentType: DeploymentType.WEB,
        channelName: 'Website Chat Widget',
        recordingEnabled: true,
        channelIdentifier: 'https://example.com',
        configuration: {
          communicationType: OttCommunicationType.UNIFIED,
          widgetConfiguration: {
            position: 'right' as const,
            theme: 'light' as const,
            customTheme: {},
          },
        },
      };

      const mockResponse: DeploymentChannel = {
        id: 'channel_456',
        deploymentType: DeploymentType.WEB,
        channelName: 'Website Chat Widget',
        recordingEnabled: true,
        channelIdentifier: 'https://example.com',
        configuration: {
          communicationType: OttCommunicationType.UNIFIED,
          customCssUrl: null,
          widgetConfiguration: {
            position: 'right' as const,
            theme: 'light' as const,
            customTheme: {},
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/deployment-channels', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.create(input);

      expect(result.id).toBe('channel_456');
      expect(result.channelIdentifier).toBe('https://example.com');
      expect(result.deploymentType).toBe(DeploymentType.WEB);
    });
  });

  describe('get', () => {
    it('should retrieve a deployment channel by ID', async () => {
      const mockResponse: DeploymentChannel = {
        id: 'channel_123',
        deploymentType: DeploymentType.CALLS,
        channelName: 'Customer Support Line',
        recordingEnabled: true,
        channelIdentifier: '+12125551234',
        configuration: {
          phoneConfigurationId: 'phone_123',
          hasForwardingEnabled: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/deployment-channels/channel_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.get('channel_123');

      expect(result.id).toBe('channel_123');
      expect(result.channelName).toBe('Customer Support Line');
    });

    it('should throw API error when deployment channel not found', async () => {
      nock(BASE_URL)
        .get('/deployment-channels/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Deployment channel not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.deploymentChannels.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByIdentifier', () => {
    it('should retrieve a deployment channel by identifier and type', async () => {
      const mockResponse: DeploymentChannel = {
        id: 'channel_123',
        deploymentType: DeploymentType.CALLS,
        channelName: 'Customer Support Line',
        recordingEnabled: true,
        channelIdentifier: '+12125551234',
        configuration: {
          phoneConfigurationId: 'phone_123',
          hasForwardingEnabled: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/deployment-channels/by-identifier/%2B12125551234')
        .query({ type: 'CALLS' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.getByIdentifier(
        '+12125551234',
        LocalDeploymentType.CALLS
      );

      expect(result.id).toBe('channel_123');
      expect(result.channelIdentifier).toBe('+12125551234');
    });
  });

  describe('update', () => {
    it('should update a deployment channel', async () => {
      const updateData = {
        id: 'channel_123',
        channelName: 'Updated Support Line',
        recordingEnabled: false,
      };

      const mockResponse: DeploymentChannel = {
        id: 'channel_123',
        deploymentType: DeploymentType.CALLS,
        channelName: 'Updated Support Line',
        recordingEnabled: false,
        channelIdentifier: '+12125551234',
        configuration: {
          phoneConfigurationId: 'phone_123',
          hasForwardingEnabled: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/deployment-channels', {
          id: 'channel_123',
          channelName: 'Updated Support Line',
          recordingEnabled: false,
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.update(updateData);

      expect(result.channelName).toBe('Updated Support Line');
      expect(result.recordingEnabled).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a deployment channel', async () => {
      nock(BASE_URL)
        .delete('/deployment-channels/channel_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.delete('channel_123');
      expect(result).toBe(true);
    });

    it('should throw API error when deployment channel not found', async () => {
      nock(BASE_URL)
        .delete('/deployment-channels/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Deployment channel not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.deploymentChannels.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list deployment channels with pagination', async () => {
      const mockChannels: DeploymentChannel[] = [
        {
          id: 'channel_1',
          deploymentType: DeploymentType.CALLS,
          channelName: 'Support Line 1',
          recordingEnabled: true,
          channelIdentifier: '+12125551111',
          configuration: {
            phoneConfigurationId: 'phone_111',
            hasForwardingEnabled: false,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'channel_2',
          deploymentType: DeploymentType.WEB,
          channelName: 'Web Chat',
          recordingEnabled: true,
          channelIdentifier: 'https://example.com',
          configuration: {
            communicationType: OttCommunicationType.UNIFIED,
            customCssUrl: null,
            widgetConfiguration: {
              position: 'right' as const,
              theme: 'light' as const,
              customTheme: {},
            },
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<DeploymentChannel> = {
        data: mockChannels,
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
        .get('/deployment-channels')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('listByType', () => {
    it('should list deployment channels by type with pagination', async () => {
      const mockChannels: DeploymentChannel[] = [
        {
          id: 'channel_1',
          deploymentType: DeploymentType.CALLS,
          channelName: 'Support Line 1',
          recordingEnabled: true,
          channelIdentifier: '+12125551111',
          configuration: {
            phoneConfigurationId: 'phone_111',
            hasForwardingEnabled: false,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<DeploymentChannel> = {
        data: mockChannels,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/deployment-channels/by-type/CALLS')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentChannels.listByType(LocalDeploymentType.CALLS);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].deploymentType).toBe(DeploymentType.CALLS);
    });
  });
});
