/**
 * @fileoverview Tests for Support Models resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { WiilSupportModel, LLMType, SupportedProprietor } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('SupportModelsResource', () => {
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
    it('should retrieve a support model by ID', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_123',
        name: 'GPT-4 Turbo',
        provider_model_id: 'gpt-4-1106-preview',
        proprietor: SupportedProprietor.OPENAI,
        description: 'Latest GPT-4 model with improved performance and multimodal capabilities',
        type: LLMType.MULTI_MODE,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
          { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
          { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/model_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.get('model_123');

      expect(result.modelId).toBe('model_123');
      expect(result.name).toBe('GPT-4 Turbo');
      expect(result.proprietor).toBe(SupportedProprietor.OPENAI);
    });

    it('should throw API error when support model not found', async () => {
      nock(BASE_URL)
        .get('/support-models/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Support model not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.supportModels.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list all support models', async () => {
      const mockModels: WiilSupportModel[] = [
        {
          modelId: 'model_1',
          name: 'GPT-4 Turbo',
          provider_model_id: 'gpt-4-1106-preview',
          proprietor: SupportedProprietor.OPENAI,
          description: 'Latest GPT-4 model with improved performance and multimodal capabilities',
          type: LLMType.MULTI_MODE,
          discontinued: false,
          supportedVoices: null,
          supportLanguages: [
            { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
            { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
            { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
          ],
        },
        {
          modelId: 'model_2',
          name: 'Claude Sonnet 4',
          provider_model_id: 'claude-sonnet-4',
          proprietor: SupportedProprietor.ANTHROPIC,
          description: 'Anthropic Claude Sonnet 4 model for advanced text processing',
          type: LLMType.TEXT_PROCESSING,
          discontinued: false,
          supportedVoices: null,
          supportLanguages: [
            { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
            { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
            { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
            { languageId: 'de-de', name: 'German (Germany)', code: 'de-DE', isDefault: false, isExperimental: false },
          ],
        },
      ];

      nock(BASE_URL)
        .get('/support-models')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockModels,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.list();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('GPT-4 Turbo');
      expect(result[1].name).toBe('Claude Sonnet 4');
    });
  });

  describe('getDefaultMultiMode', () => {
    it('should retrieve the default multi-mode model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_multi',
        name: 'GPT-4 Omni',
        provider_model_id: 'gpt-4o',
        proprietor: SupportedProprietor.OPENAI,
        description: 'GPT-4 Omni multimodal model with vision and audio capabilities',
        type: LLMType.MULTI_MODE,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
          { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
          { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/multi-mode')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultMultiMode();

      expect(result?.type).toBe(LLMType.MULTI_MODE);
      expect(result?.name).toBe('GPT-4 Omni');
    });
  });

  describe('getDefaultSTS', () => {
    it('should retrieve the default STS model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_sts',
        name: 'OpenAI STS Model',
        provider_model_id: 'sts-1',
        proprietor: SupportedProprietor.OPENAI,
        description: 'OpenAI Speech-to-Speech model for real-time voice conversation',
        type: LLMType.STS,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/sts')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultSTS();

      expect(result?.type).toBe(LLMType.STS);
    });
  });

  describe('getDefaultTTS', () => {
    it('should retrieve the default TTS model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_tts',
        name: 'ElevenLabs TTS',
        provider_model_id: 'eleven-multilingual-v2',
        proprietor: SupportedProprietor.ELEVENLABS,
        description: 'ElevenLabs multilingual text-to-speech model with natural voice synthesis',
        type: LLMType.TTS,
        discontinued: false,
        supportedVoices: [
          { voiceId: 'adam', name: 'Adam', description: 'Deep, authoritative male voice', gender: 'male' as const, language: 'en-US', isDefault: true },
          { voiceId: 'bella', name: 'Bella', description: 'Warm, friendly female voice', gender: 'female' as const, language: 'en-US', isDefault: false },
          { voiceId: 'charlie', name: 'Charlie', description: 'Clear, professional male voice', gender: 'male' as const, language: 'en-US', isDefault: false },
        ],
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
          { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
          { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/tts')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultTTS();

      expect(result?.type).toBe(LLMType.TTS);
      expect(result?.supportedVoices).toHaveLength(3);
    });
  });

  describe('getDefaultSTT', () => {
    it('should retrieve the default STT model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_stt',
        name: 'Deepgram Nova 2',
        provider_model_id: 'nova-2',
        proprietor: SupportedProprietor.DEEPGRAM,
        description: 'Deepgram Nova 2 speech-to-text model with enhanced accuracy',
        type: LLMType.STT,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
          { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
          { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
          { languageId: 'de-de', name: 'German (Germany)', code: 'de-DE', isDefault: false, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/stt')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultSTT();

      expect(result?.type).toBe(LLMType.STT);
      expect(result?.proprietor).toBe(SupportedProprietor.DEEPGRAM);
    });
  });

  describe('getDefaultTranscribe', () => {
    it('should retrieve the default transcription model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_transcribe',
        name: 'Whisper Large V3',
        provider_model_id: 'whisper-large-v3',
        proprietor: SupportedProprietor.OPENAI,
        description: 'OpenAI Whisper Large V3 transcription model with multilingual support',
        type: LLMType.TRANSCRIBE,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
          { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
          { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
          { languageId: 'de-de', name: 'German (Germany)', code: 'de-DE', isDefault: false, isExperimental: false },
          { languageId: 'ja-jp', name: 'Japanese (Japan)', code: 'ja-JP', isDefault: false, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/transcribe')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultTranscribe();

      expect(result?.type).toBe(LLMType.TRANSCRIBE);
    });
  });

  describe('getDefaultBatch', () => {
    it('should retrieve the default batch model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_batch',
        name: 'GPT-4 Turbo Batch',
        provider_model_id: 'gpt-4-turbo-batch',
        proprietor: SupportedProprietor.OPENAI,
        description: 'GPT-4 Turbo batch processing model for large-scale operations',
        type: LLMType.TEXT_PROCESSING,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/batch')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultBatch();

      expect(result?.modelId).toBe('model_batch');
    });
  });

  describe('getDefaultTranslationSTT', () => {
    it('should retrieve the default translation STT model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_trans_stt',
        name: 'Translation STT Model',
        provider_model_id: 'translation-stt-1',
        proprietor: SupportedProprietor.DEEPGRAM,
        description: 'Deepgram translation-optimized speech-to-text model',
        type: LLMType.STT,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
          { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
          { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/translation-stt')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultTranslationSTT();

      expect(result?.modelId).toBe('model_trans_stt');
    });
  });

  describe('getDefaultTranslationTTS', () => {
    it('should retrieve the default translation TTS model', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_trans_tts',
        name: 'Translation TTS Model',
        provider_model_id: 'translation-tts-1',
        proprietor: SupportedProprietor.ELEVENLABS,
        description: 'ElevenLabs translation-optimized text-to-speech model',
        type: LLMType.TTS,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
          { languageId: 'es-es', name: 'Spanish (Spain)', code: 'es-ES', isDefault: false, isExperimental: false },
          { languageId: 'fr-fr', name: 'French (France)', code: 'fr-FR', isDefault: false, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/defaults/translation-tts')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getDefaultTranslationTTS();

      expect(result?.modelId).toBe('model_trans_tts');
    });
  });

  describe('getByTypeAndProprietor', () => {
    it('should retrieve a model by type and proprietor', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_123',
        name: 'Claude Sonnet 4',
        provider_model_id: 'claude-sonnet-4',
        proprietor: SupportedProprietor.ANTHROPIC,
        description: 'Anthropic Claude Sonnet 4 model for advanced text processing',
        type: LLMType.TEXT_PROCESSING,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/lookup/type-proprietor/TEXT_PROCESSING/Anthropic')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getByTypeAndProprietor('TEXT_PROCESSING', 'Anthropic');

      expect(result?.proprietor).toBe(SupportedProprietor.ANTHROPIC);
    });
  });

  describe('getByProprietorAndProviderModelId', () => {
    it('should retrieve a model by proprietor and provider model ID', async () => {
      const mockResponse: WiilSupportModel = {
        modelId: 'model_123',
        name: 'Gemini 2.0 Flash',
        provider_model_id: 'gemini-2.0-flash-exp',
        proprietor: SupportedProprietor.GOOGLE,
        description: 'Google Gemini 2.0 Flash experimental model with multimodal capabilities',
        type: LLMType.MULTI_MODE,
        discontinued: false,
        supportedVoices: null,
        supportLanguages: [
          { languageId: 'en-us', name: 'English (United States)', code: 'en-US', isDefault: true, isExperimental: false },
        ],
      };

      nock(BASE_URL)
        .get('/support-models/lookup/proprietor-provider/Google/gemini-2.0-flash-exp')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.supportModels.getByProprietorAndProviderModelId(
        'Google',
        'gemini-2.0-flash-exp'
      );

      expect(result?.provider_model_id).toBe('gemini-2.0-flash-exp');
      expect(result?.proprietor).toBe(SupportedProprietor.GOOGLE);
    });
  });
});
