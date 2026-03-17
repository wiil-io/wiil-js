/**
 * @fileoverview Tests for Dynamic Phone Agent resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import {
  DynamicPhoneAgentSetup,
  DynamicPhoneAgentSetupResult,
  SupportedProprietor,
  BusinessSupportServices,
  AgentRoleTemplateIdentifier,
} from 'wiil-core-js';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('DynamicPhoneAgentResource', () => {
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
    it('should create a new dynamic phone agent', async () => {
      const input: DynamicPhoneAgentSetup = {
        assistantName: 'Customer Service Agent',
        language: 'en-US',
        capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
        role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL,
        phoneConfigurationId: 'phone_config_123',
      };

      const mockResponse: DynamicPhoneAgentSetupResult = {
        id: 'setup_123',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        phoneNumber: '+15551234567',
      };

      nock(BASE_URL)
        .post('/dynamic-setup/phone-agent', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.create(input, { pollUntilComplete: false });

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_123');
      expect(result.instructionConfigurationId).toBe('instr_456');
      expect(result.phoneNumber).toBe('+15551234567');
    });

    it('should create a phone agent with STT and TTS configurations', async () => {
      const input: DynamicPhoneAgentSetup = {
        assistantName: 'Voice Agent',
        language: 'en-US',
        capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
        phoneConfigurationId: 'phone_config_123',
        sttConfiguration: {
          providerType: SupportedProprietor.DEEPGRAM,
          providerModelId: 'nova-2',
          languageId: 'en-US',
        },
        ttsConfiguration: {
          providerType: SupportedProprietor.ELEVENLABS,
          providerModelId: 'eleven_turbo_v2',
          languageId: 'en-US',
          voiceId: 'voice_rachel',
        },
      };

      const mockResponse: DynamicPhoneAgentSetupResult = {
        id: 'setup_456',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        phoneNumber: '+15559876543',
      };

      // Mock model validation endpoints
      nock(BASE_URL)
        .get('/support-models/supports/Deepgram/nova-2')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });

      nock(BASE_URL)
        .get('/support-models/supports/ElevenLabs/eleven_turbo_v2')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });

      nock(BASE_URL)
        .post('/dynamic-setup/phone-agent', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.create(input, { pollUntilComplete: false });

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_456');
      expect(result.phoneNumber).toBe('+15559876543');
    });
  });

  describe('update', () => {
    it('should update a phone agent configuration', async () => {
      const updateData = {
        id: 'agent_123',
        assistantName: 'Updated Customer Service Agent',
        language: 'es-MX',
      };

      const mockResponse: DynamicPhoneAgentSetupResult = {
        id: 'setup_123',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        phoneNumber: '+15551234567',
      };

      nock(BASE_URL)
        .patch('/dynamic-setup/phone-agent', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.update(updateData);

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_123');
    });

    it('should update phone agent with new STT configuration', async () => {
      const updateData = {
        id: 'agent_123',
        sttConfiguration: {
          providerType: SupportedProprietor.GOOGLE,
          providerModelId: 'chirp',
          languageId: 'en-US',
        },
      };

      const mockResponse: DynamicPhoneAgentSetupResult = {
        id: 'setup_123',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        phoneNumber: '+15551234567',
      };

      // Mock model validation endpoint
      nock(BASE_URL)
        .get('/support-models/supports/Google/chirp')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });

      nock(BASE_URL)
        .patch('/dynamic-setup/phone-agent', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.update(updateData);

      expect(result.success).toBe(true);
    });
  });
});
