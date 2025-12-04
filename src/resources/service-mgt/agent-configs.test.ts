/**
 * @fileoverview Tests for Agent Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { AgentConfiguration, PaginatedResultType, AssistantType, LLMType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('AgentConfigurationsResource', () => {
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
    it('should create a new agent configuration', async () => {
      const input = {
        name: 'Customer Service Agent',
        modelId: 'model_gpt4_turbo',
        instructionConfigurationId: 'instr_789',
        defaultFunctionState: LLMType.MULTI_MODE,
        usesWiilSupportModel: true,
        assistantType: AssistantType.GENERAL,
        call_transfer_config: [],
        metadata: { department: 'support' },
      };

      const mockResponse: AgentConfiguration = {
        id: 'agent_123',
        name: 'Customer Service Agent',
        modelId: 'model_gpt4_turbo',
        instructionConfigurationId: 'instr_789',
        defaultFunctionState: LLMType.MULTI_MODE,
        usesWiilSupportModel: true,
        assistantType: AssistantType.GENERAL,
        call_transfer_config: [],
        metadata: { department: 'support' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/agent-configurations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.agentConfigs.create(input);

      expect(result.id).toBe('agent_123');
      expect(result.name).toBe('Customer Service Agent');
      expect(result.modelId).toBe('model_gpt4_turbo');
    });
  });

  describe('get', () => {
    it('should retrieve an agent configuration by ID', async () => {
      const mockResponse: AgentConfiguration = {
        id: 'agent_123',
        name: 'Customer Service Agent',
        modelId: 'model_gpt4_turbo',
        instructionConfigurationId: 'instr_789',
        defaultFunctionState: LLMType.MULTI_MODE,
        usesWiilSupportModel: true,
        assistantType: AssistantType.GENERAL,
        call_transfer_config: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/agent-configurations/agent_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.agentConfigs.get('agent_123');

      expect(result.id).toBe('agent_123');
      expect(result.name).toBe('Customer Service Agent');
      expect(result.modelId).toBe('model_gpt4_turbo');
    });

    it('should throw API error when agent configuration not found', async () => {
      nock(BASE_URL)
        .get('/agent-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Agent configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.agentConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('update', () => {
    it('should update an agent configuration', async () => {
      const updateData = {
        id: 'agent_123',
        name: 'Updated Agent Name',
        metadata: { department: 'enterprise-support' },
      };

      const mockResponse: AgentConfiguration = {
        id: 'agent_123',
        name: 'Updated Agent Name',
        modelId: 'model_gpt4_turbo',
        instructionConfigurationId: 'instr_789',
        defaultFunctionState: LLMType.MULTI_MODE,
        usesWiilSupportModel: true,
        assistantType: AssistantType.GENERAL,
        call_transfer_config: [],
        metadata: { department: 'enterprise-support' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/agent-configurations', {
          id: 'agent_123',
          name: 'Updated Agent Name',
          metadata: { department: 'enterprise-support' },
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.agentConfigs.update(updateData);

      expect(result.name).toBe('Updated Agent Name');
      expect(result.metadata?.department).toBe('enterprise-support');
    });
  });

  describe('delete', () => {
    it('should delete an agent configuration', async () => {
      nock(BASE_URL)
        .delete('/agent-configurations/agent_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.agentConfigs.delete('agent_123');
      expect(result).toBe(true);
    });

    it('should throw API error when agent configuration not found', async () => {
      nock(BASE_URL)
        .delete('/agent-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Agent configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.agentConfigs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list agent configurations with pagination', async () => {
      const mockConfigs: AgentConfiguration[] = [
        {
          id: 'agent_1',
          name: 'Agent 1',
          modelId: 'model_gpt4_turbo',
          instructionConfigurationId: 'instr_789',
          defaultFunctionState: LLMType.MULTI_MODE,
          usesWiilSupportModel: true,
          assistantType: AssistantType.GENERAL,
          call_transfer_config: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'agent_2',
          name: 'Agent 2',
          modelId: 'model_claude_sonnet',
          instructionConfigurationId: 'instr_790',
          defaultFunctionState: LLMType.TEXT_PROCESSING,
          usesWiilSupportModel: true,
          assistantType: AssistantType.PHONE,
          call_transfer_config: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AgentConfiguration> = {
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
        .get('/agent-configurations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.agentConfigs.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should list agent configurations with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<AgentConfiguration> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 50,
          totalCount: 100,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/agent-configurations')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.agentConfigs.list({
        page: 2,
        pageSize: 50,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
