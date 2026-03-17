/**
 * @fileoverview Tests for Provisioning Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { TranslationChainConfig, SupportedProprietor } from 'wiil-core-js';

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

    it('should create translation chain with minimal configuration', async () => {
      const input = {
        chainName: 'minimal-translation-chain',
        sttConfig: {
          providerType: SupportedProprietor.DEEPGRAM,
          providerModelId: 'nova-2',
          languageId: 'en',
        },
        processingConfig: {
          providerType: SupportedProprietor.OPENAI,
          providerModelId: 'gpt-4o',
        },
        ttsConfig: {
          providerType: SupportedProprietor.ELEVENLABS,
          providerModelId: 'eleven_turbo_v2',
          languageId: 'en',
          voiceId: 'voice_123',
        },
        isTranslation: true,
      };

      const mockResponse: TranslationChainConfig = {
        id: 'trans_456',
        chainName: 'minimal-translation-chain',
        sttConfig: {
          modelId: 'nova-2',
          defaultLanguage: 'en',
        },
        processingModelId: 'gpt-4o',
        ttsConfig: {
          modelId: 'eleven_turbo_v2',
          voiceId: 'voice_123',
          defaultLanguage: 'en',
        },
        isTranslation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/provisioning-configurations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.provisioningConfigs.create(input);

      expect(result.id).toBe('trans_456');
      expect(result.chainName).toBe('minimal-translation-chain');
      expect(result.isTranslation).toBe(true);
    });
  });
});
