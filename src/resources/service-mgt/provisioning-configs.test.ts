/**
 * @fileoverview Tests for Provisioning Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { TranslationChainConfig, PaginatedResultType, SupportedProprietor } from 'wiil-core-js';
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
    it('should create a new translation chain configuration', async () => {
      const input = {
        chainName: 'translation-chain-en-es',
        description: 'English to Spanish translation chain',
        sttConfig: {
          providerType: SupportedProprietor.DEEPGRAM,
          providerModelId: 'nova-2',
          languageId: 'en-US',
        },
        processingConfig: {
          providerType: SupportedProprietor.OPENAI,
          providerModelId: 'gpt-4o-mini',
        },
        ttsConfig: {
          providerType: SupportedProprietor.ELEVENLABS,
          providerModelId: 'eleven_multilingual_v2',
          voiceId: 'spanish-voice',
          languageId: 'es-ES',
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

      // Mock model validation calls
      nock(BASE_URL)
        .get('/support-models/supports/Deepgram/nova-2')
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });
      nock(BASE_URL)
        .get('/support-models/supports/OpenAI/gpt-4o-mini')
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });
      nock(BASE_URL)
        .get('/support-models/supports/ElevenLabs/eleven_multilingual_v2')
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });

      nock(BASE_URL)
        .post('/provisioning-configurations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.create(input);

      expect(result.id).toBe('trans_123');
      expect(result.chainName).toBe('translation-chain-en-es');
      expect(result.processingModelId).toBe('gpt-4-translator');
      expect(result.isTranslation).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a translation chain configuration by ID', async () => {
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
        .get('/provisioning-configurations/trans_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.get('trans_123');

      expect(result.id).toBe('trans_123');
      expect(result.chainName).toBe('translation-chain-en-es');
      expect(result.isTranslation).toBe(true);
    });

    it('should throw API error when configuration not found', async () => {
      nock(BASE_URL)
        .get('/provisioning-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Translation chain configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.provisioningConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByChainName', () => {
    it('should retrieve a translation chain configuration by chain name', async () => {
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
        .get('/provisioning-configurations/by-chain-name/translation-chain-en-es')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.getByChainName('translation-chain-en-es');

      expect(result.id).toBe('trans_123');
      expect(result.chainName).toBe('translation-chain-en-es');
    });
  });

  describe('update', () => {
    it('should update a translation chain configuration', async () => {
      const updateData = {
        id: 'trans_123',
        description: 'Updated translation chain',
        processingConfig: {
          providerType: SupportedProprietor.OPENAI,
          providerModelId: 'gpt-4.1-mini',
        },
      };

      const mockResponse: TranslationChainConfig = {
        id: 'trans_123',
        chainName: 'translation-chain-en-es',
        description: 'Updated translation chain',
        sttConfig: {
          modelId: 'whisper-v3',
          defaultLanguage: 'en-US',
        },
        processingModelId: 'gpt-4.1-mini',
        ttsConfig: {
          modelId: 'eleven-labs-v2',
          voiceId: 'spanish-voice',
          defaultLanguage: 'es-ES',
        },
        isTranslation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock model validation call for processing config
      nock(BASE_URL)
        .get('/support-models/supports/OpenAI/gpt-4.1-mini')
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });

      nock(BASE_URL)
        .patch('/provisioning-configurations', {
          id: 'trans_123',
          description: 'Updated translation chain',
          processingConfig: {
            providerType: 'OpenAI',
            providerModelId: 'gpt-4.1-mini',
          },
        })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.update(updateData);

      expect(result.description).toBe('Updated translation chain');
      expect(result.processingModelId).toBe('gpt-4.1-mini');
    });
  });

  describe('delete', () => {
    it('should delete a translation chain configuration', async () => {
      nock(BASE_URL)
        .delete('/provisioning-configurations/trans_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.delete('trans_123');
      expect(result).toBe(true);
    });

    it('should throw API error when configuration not found', async () => {
      nock(BASE_URL)
        .delete('/provisioning-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Translation chain configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.provisioningConfigs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list translation chain configurations with pagination', async () => {
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
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.list();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].processingModelId).toBe('gpt-4-translator');
      expect(result.data[0].isTranslation).toBe(true);
    });
  });
});
