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
import { WiilAPIError } from '../../errors/WiilError';

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
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        phoneNumber: '+15551234567',
      };

      nock(BASE_URL)
        .post('/dynamic-setup/phone-agent', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.create(input);

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
        success: true,
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        phoneNumber: '+15559876543',
      };

      nock(BASE_URL)
        .post('/dynamic-setup/phone-agent', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.create(input);

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_456');
      expect(result.phoneNumber).toBe('+15559876543');
    });
  });

  describe('get', () => {
    it('should retrieve a phone agent configuration by ID', async () => {
      const mockResponse: DynamicPhoneAgentSetupResult = {
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        phoneNumber: '+15551234567',
      };

      nock(BASE_URL)
        .get('/dynamic-setup/phone-agent/agent_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.get('agent_123');

      expect(result.agentConfigurationId).toBe('agent_123');
      expect(result.phoneNumber).toBe('+15551234567');
    });

    it('should throw API error when phone agent not found', async () => {
      nock(BASE_URL)
        .get('/dynamic-setup/phone-agent/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Phone agent not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.dynamicPhoneAgent.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
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
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        phoneNumber: '+15551234567',
      };

      nock(BASE_URL)
        .patch('/dynamic-setup/phone-agent', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
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
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        phoneNumber: '+15551234567',
      };

      nock(BASE_URL)
        .patch('/dynamic-setup/phone-agent', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.update(updateData);

      expect(result.success).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a phone agent configuration', async () => {
      nock(BASE_URL)
        .delete('/dynamic-setup/phone-agent/agent_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicPhoneAgent.delete('agent_123');
      expect(result).toBe(true);
    });

    it('should throw API error when phone agent not found', async () => {
      nock(BASE_URL)
        .delete('/dynamic-setup/phone-agent/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Phone agent not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.dynamicPhoneAgent.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });
});
