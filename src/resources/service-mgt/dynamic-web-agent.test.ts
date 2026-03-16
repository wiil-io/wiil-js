/**
 * @fileoverview Tests for Dynamic Web Agent resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import {
  DynamicWebAgentSetup,
  DynamicWebAgentSetupResult,
  SupportedProprietor,
  BusinessSupportServices,
  AgentRoleTemplateIdentifier,
  OttCommunicationType,
} from 'wiil-core-js';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('DynamicWebAgentResource', () => {
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
    it('should create a new dynamic web agent', async () => {
      const input: DynamicWebAgentSetup = {
        assistantName: 'Website Support Agent',
        websiteUrl: 'https://example.com',
        communicationType: OttCommunicationType.TEXT,
        language: 'en-US',
        capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
        role_template_identifier: AgentRoleTemplateIdentifier.CUSTOMER_SUPPORT_GENERAL,
      };

      const mockResponse: DynamicWebAgentSetupResult = {
        id: 'setup_123',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        integrationSnippets: [
          '<script src="https://cdn.wiil.io/widget.js"></script>',
          '<div id="wiil-widget" data-agent="agent_123"></div>',
        ],
      };

      nock(BASE_URL)
        .post('/dynamic-setup/web-agent', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicWebAgent.create(input, { pollUntilComplete: false });

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_123');
      expect(result.instructionConfigurationId).toBe('instr_456');
      expect(result.integrationSnippets).toHaveLength(2);
    });

    it('should create a web agent with voice communication type', async () => {
      const input: DynamicWebAgentSetup = {
        assistantName: 'Voice Web Agent',
        websiteUrl: 'https://example.com',
        communicationType: OttCommunicationType.VOICE,
        language: 'en-US',
        capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
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

      const mockResponse: DynamicWebAgentSetupResult = {
        id: 'setup_456',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        integrationSnippets: [
          '<script src="https://cdn.wiil.io/voice-widget.js"></script>',
        ],
      };

      // Mock model validation endpoints
      nock(BASE_URL)
        .get('/supports/Deepgram/nova-2')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });

      nock(BASE_URL)
        .get('/supports/ElevenLabs/eleven_turbo_v2')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, { success: true, data: true, metadata: { timestamp: Date.now(), version: 'v1' } });

      nock(BASE_URL)
        .post('/dynamic-setup/web-agent', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicWebAgent.create(input, { pollUntilComplete: false });

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_456');
      expect(result.integrationSnippets).toHaveLength(1);
    });

    it('should create a web agent with unified communication type', async () => {
      const input: DynamicWebAgentSetup = {
        assistantName: 'Unified Web Agent',
        websiteUrl: 'https://example.com',
        communicationType: OttCommunicationType.UNIFIED,
        language: 'en-US',
        capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
      };

      const mockResponse: DynamicWebAgentSetupResult = {
        id: 'setup_789',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_789',
        instructionConfigurationId: 'instr_012',
        integrationSnippets: [
          '<script src="https://cdn.wiil.io/unified-widget.js"></script>',
          '<div id="wiil-unified" data-agent="agent_789"></div>',
        ],
      };

      nock(BASE_URL)
        .post('/dynamic-setup/web-agent', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicWebAgent.create(input, { pollUntilComplete: false });

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_789');
    });
  });

  describe('update', () => {
    it('should update a web agent configuration', async () => {
      const updateData = {
        id: 'agent_123',
        assistantName: 'Updated Website Support Agent',
        websiteUrl: 'https://new-example.com',
      };

      const mockResponse: DynamicWebAgentSetupResult = {
        id: 'setup_123',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        integrationSnippets: [
          '<script src="https://cdn.wiil.io/widget.js"></script>',
        ],
      };

      nock(BASE_URL)
        .patch('/dynamic-setup/web-agent', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicWebAgent.update(updateData);

      expect(result.success).toBe(true);
      expect(result.agentConfigurationId).toBe('agent_123');
    });

    it('should update web agent communication type', async () => {
      const updateData = {
        id: 'agent_123',
        communicationType: OttCommunicationType.VOICE,
      };

      const mockResponse: DynamicWebAgentSetupResult = {
        id: 'setup_123',
        processingState: {
          status: 'completed',
          progressPercentage: 100,
        },
        success: true,
        agentConfigurationId: 'agent_123',
        instructionConfigurationId: 'instr_456',
        integrationSnippets: [
          '<script src="https://cdn.wiil.io/voice-widget.js"></script>',
        ],
      };

      nock(BASE_URL)
        .patch('/dynamic-setup/web-agent', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.dynamicWebAgent.update(updateData);

      expect(result.success).toBe(true);
    });
  });
});
