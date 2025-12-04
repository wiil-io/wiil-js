/**
 * @fileoverview Tests for Provisioning Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { ProvisioningConfigChain, TranslationChainConfig, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProvisioningConfigurationsResource', () => {
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
    it('should create a new provisioning configuration chain', async () => {
      const input = {
        chainName: 'voice-processing-chain',
        description: 'Voice processing chain for customer support',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        agentConfigurationId: 'agent-456',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'adam',
          defaultLanguage: 'en-US',
          voiceSettings: { stability: 0.75, similarity_boost: 0.5 },
        },
      };

      const mockResponse: ProvisioningConfigChain = {
        id: 'chain_123',
        chainName: 'voice-processing-chain',
        description: 'Voice processing chain for customer support',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        agentConfigurationId: 'agent-456',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'adam',
          defaultLanguage: 'en-US',
          voiceSettings: { stability: 0.75, similarity_boost: 0.5 },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/provisioning-configurations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.create(input);

      expect(result.id).toBe('chain_123');
      expect(result.chainName).toBe('voice-processing-chain');
      expect(result.sttConfig.modelId).toBe('whisper-v3');
      expect(result.agentConfigurationId).toBe('agent-456');
      expect(result.ttsConfig.modelId).toBe('eleven-labs-v2');
    });
  });

  describe('createTranslation', () => {
    it('should create a new translation configuration chain', async () => {
      const input = {
        chainName: 'translation-chain-en-es',
        description: 'English to Spanish translation chain',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        processingModelId: 'gpt-4-translator',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'spanish-voice',
          defaultLanguage: 'es-ES',
        },
        isTranslation: true,
      };

      const mockResponse: TranslationChainConfig = {
        id: 'trans_123',
        chainName: 'translation-chain-en-es',
        description: 'English to Spanish translation chain',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        processingModelId: 'gpt-4-translator',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'spanish-voice',
          defaultLanguage: 'es-ES',
        },
        isTranslation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/provisioning-configurations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.createTranslation(input);

      expect(result.id).toBe('trans_123');
      expect(result.chainName).toBe('translation-chain-en-es');
      expect(result.processingModelId).toBe('gpt-4-translator');
      expect(result.isTranslation).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a provisioning configuration by ID', async () => {
      const mockResponse: ProvisioningConfigChain = {
        id: 'chain_123',
        chainName: 'voice-processing-chain',
        description: 'Voice processing chain for customer support',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        agentConfigurationId: 'agent-456',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'adam',
          defaultLanguage: 'en-US',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/provisioning-configurations/chain_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.get('chain_123');

      expect(result.id).toBe('chain_123');
      expect(result.chainName).toBe('voice-processing-chain');
    });

    it('should throw API error when provisioning configuration not found', async () => {
      nock(BASE_URL)
        .get('/provisioning-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Provisioning configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.provisioningConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByChainName', () => {
    it('should retrieve a provisioning configuration by chain name', async () => {
      const mockResponse: ProvisioningConfigChain = {
        id: 'chain_123',
        chainName: 'voice-processing-chain',
        description: 'Voice processing chain for customer support',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        agentConfigurationId: 'agent-456',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'adam',
          defaultLanguage: 'en-US',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/provisioning-configurations/by-chain-name/voice-processing-chain')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.getByChainName('voice-processing-chain');

      expect(result.id).toBe('chain_123');
      expect(result.chainName).toBe('voice-processing-chain');
    });
  });

  describe('update', () => {
    it('should update a provisioning configuration', async () => {
      const updateData = {
        id: 'chain_123',
        description: 'Updated description',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'rachel',
          defaultLanguage: 'en-US',
        },
      };

      const mockResponse: ProvisioningConfigChain = {
        id: 'chain_123',
        chainName: 'voice-processing-chain',
        description: 'Updated description',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        agentConfigurationId: 'agent-456',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'rachel',
          defaultLanguage: 'en-US',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/provisioning-configurations', {
          id: 'chain_123',
          description: 'Updated description',
          ttsConfig: {
            modelId: 'eleven-labs-v2',
            voiceId: 'rachel',
            defaultLanguage: 'en-US',
          },
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.update(updateData);

      expect(result.description).toBe('Updated description');
      expect(result.ttsConfig.voiceId).toBe('rachel');
    });
  });

  describe('delete', () => {
    it('should delete a provisioning configuration', async () => {
      nock(BASE_URL)
        .delete('/provisioning-configurations/chain_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.delete('chain_123');
      expect(result).toBe(true);
    });

    it('should throw API error when provisioning configuration not found', async () => {
      nock(BASE_URL)
        .delete('/provisioning-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Provisioning configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.provisioningConfigs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list all provisioning configurations with pagination', async () => {
      const mockConfigs: ProvisioningConfigChain[] = [
        {
          id: 'chain_1',
          chainName: 'voice-chain-1',
          sttConfig: {
            modelId: 'whisper-v3',
            defaultLanguage: 'en-US',
          },
          agentConfigurationId: 'agent-456',
          ttsConfig: {
            modelId: 'eleven-labs-v2',
            voiceId: 'adam',
            defaultLanguage: 'en-US',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProvisioningConfigChain> = {
        data: mockConfigs,
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
        .get('/provisioning-configurations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.list();

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
    });
  });

  describe('listProvisioningChains', () => {
    it('should list provisioning configuration chains', async () => {
      const mockChains: ProvisioningConfigChain[] = [
        {
          id: 'chain_1',
          chainName: 'voice-chain-1',
          sttConfig: {
            modelId: 'whisper-v3',
            defaultLanguage: 'en-US',
          },
          agentConfigurationId: 'agent-456',
          ttsConfig: {
            modelId: 'eleven-labs-v2',
            voiceId: 'adam',
            defaultLanguage: 'en-US',
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProvisioningConfigChain> = {
        data: mockChains,
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
        .get('/provisioning-configurations/provisioning')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.listProvisioningChains();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].chainName).toBe('voice-chain-1');
    });
  });

  describe('listTranslationChains', () => {
    it('should list translation configuration chains', async () => {
      const mockChains: TranslationChainConfig[] = [
        {
          id: 'trans_1',
          chainName: 'translation-chain-en-es',
          description: 'English to Spanish translation',
          sttConfig: {
            modelId: 'whisper-v3',
            defaultLanguage: 'en-US',
          },
          processingModelId: 'gpt-4-translator',
          ttsConfig: {
            modelId: 'eleven-labs-v2',
            voiceId: 'spanish-voice',
            defaultLanguage: 'es-ES',
          },
          isTranslation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TranslationChainConfig> = {
        data: mockChains,
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
        .get('/provisioning-configurations/translations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.listTranslationChains();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].processingModelId).toBe('gpt-4-translator');
      expect(result.data[0].isTranslation).toBe(true);
    });
  });
});
