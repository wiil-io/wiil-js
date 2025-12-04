/**
 * @fileoverview Tests for Deployment Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { DeploymentConfigurationResult, PaginatedResultType, DeploymentStatus, DeploymentProvisioningType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('DeploymentConfigurationsResource', () => {
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
    it('should create a new deployment configuration', async () => {
      const input = {
        projectId: 'proj_789',
        deploymentChannelId: 'channel_123',
        deploymentName: 'Customer Support Deployment',
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        isActive: false,
        deploymentStatus: DeploymentStatus.PENDING as const,
        provisioningType: DeploymentProvisioningType.DIRECT,
      };

      const mockResponse: DeploymentConfigurationResult = {
        id: 'deploy_123',
        projectId: 'proj_789',
        deploymentChannelId: 'channel_123',
        deploymentName: 'Customer Support Deployment',
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        deploymentStatus: DeploymentStatus.PENDING,
        provisioningType: DeploymentProvisioningType.DIRECT,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/deployment-configurations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.create(input);

      expect(result.id).toBe('deploy_123');
      expect(result.deploymentName).toBe('Customer Support Deployment');
      expect(result.projectId).toBe('proj_789');
      expect(result.deploymentStatus).toBe(DeploymentStatus.PENDING);
    });
  });

  describe('createChain', () => {
    it('should create a chained deployment configuration', async () => {
      const input = {
        projectId: 'proj_789',
        deploymentChannelId: 'channel_123',
        deploymentName: 'Voice Processing Deployment',
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        provisioningConfigChainId: 'chain_999',
        isActive: false,
        deploymentStatus: DeploymentStatus.PENDING as const,
        provisioningType: DeploymentProvisioningType.CHAINED,
      };

      const mockResponse: DeploymentConfigurationResult = {
        id: 'deploy_456',
        projectId: 'proj_789',
        deploymentChannelId: 'channel_123',
        deploymentName: 'Voice Processing Deployment',
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        deploymentStatus: DeploymentStatus.PENDING,
        provisioningType: DeploymentProvisioningType.CHAINED,
        provisioningConfigChainId: 'chain_999',
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/deployment-configurations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.createChain(input);

      expect(result.id).toBe('deploy_456');
      expect(result.provisioningType).toBe(DeploymentProvisioningType.CHAINED);
      expect(result.provisioningConfigChainId).toBe('chain_999');
    });
  });

  describe('get', () => {
    it('should retrieve a deployment configuration by ID', async () => {
      const mockResponse: DeploymentConfigurationResult = {
        id: 'deploy_123',
        projectId: 'proj_789',
        deploymentChannelId: 'channel_123',
        deploymentName: 'Customer Support Deployment',
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        deploymentStatus: DeploymentStatus.ACTIVE,
        provisioningType: DeploymentProvisioningType.DIRECT,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/deployment-configurations/deploy_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.get('deploy_123');

      expect(result.id).toBe('deploy_123');
      expect(result.deploymentName).toBe('Customer Support Deployment');
      expect(result.deploymentStatus).toBe(DeploymentStatus.ACTIVE);
    });

    it('should throw API error when deployment configuration not found', async () => {
      nock(BASE_URL)
        .get('/deployment-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Deployment configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.deploymentConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByChannel', () => {
    it('should retrieve a deployment configuration by channel ID', async () => {
      const mockResponse: DeploymentConfigurationResult = {
        id: 'deploy_123',
        projectId: 'proj_789',
        deploymentChannelId: 'channel_123',
        deploymentName: 'Customer Support Deployment',
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        deploymentStatus: DeploymentStatus.ACTIVE,
        provisioningType: DeploymentProvisioningType.DIRECT,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/deployment-configurations/by-channel/channel_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.getByChannel('channel_123');

      expect(result.id).toBe('deploy_123');
      expect(result.deploymentChannelId).toBe('channel_123');
    });
  });

  describe('update', () => {
    it('should update a deployment configuration', async () => {
      const updateData = {
        id: 'deploy_123',
        deploymentName: 'Updated Deployment Name',
        isActive: true,
      };

      const mockResponse: DeploymentConfigurationResult = {
        id: 'deploy_123',
        projectId: 'proj_789',
        deploymentChannelId: 'channel_123',
        deploymentName: 'Updated Deployment Name',
        agentConfigurationId: 'agent_456',
        instructionConfigurationId: 'instr_789',
        deploymentStatus: DeploymentStatus.ACTIVE,
        provisioningType: DeploymentProvisioningType.DIRECT,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/deployment-configurations', {
          id: 'deploy_123',
          deploymentName: 'Updated Deployment Name',
          isActive: true,
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.update(updateData);

      expect(result.deploymentName).toBe('Updated Deployment Name');
      expect(result.isActive).toBe(true);
      expect(result.deploymentStatus).toBe(DeploymentStatus.ACTIVE);
    });
  });

  describe('delete', () => {
    it('should delete a deployment configuration', async () => {
      nock(BASE_URL)
        .delete('/deployment-configurations/deploy_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.delete('deploy_123');
      expect(result).toBe(true);
    });

    it('should throw API error when deployment configuration not found', async () => {
      nock(BASE_URL)
        .delete('/deployment-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Deployment configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.deploymentConfigs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list deployment configurations with pagination', async () => {
      const mockConfigs: DeploymentConfigurationResult[] = [
        {
          id: 'deploy_1',
          projectId: 'proj_789',
          deploymentChannelId: 'channel_111',
          deploymentName: 'Deployment 1',
          agentConfigurationId: 'agent_456',
          instructionConfigurationId: 'instr_789',
          deploymentStatus: DeploymentStatus.ACTIVE,
          provisioningType: DeploymentProvisioningType.DIRECT,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'deploy_2',
          projectId: 'proj_789',
          deploymentChannelId: 'channel_222',
          deploymentName: 'Deployment 2',
          agentConfigurationId: 'agent_789',
          instructionConfigurationId: 'instr_101',
          deploymentStatus: DeploymentStatus.PENDING,
          provisioningType: DeploymentProvisioningType.CHAINED,
          provisioningConfigChainId: 'chain_999',
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<DeploymentConfigurationResult> = {
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
        .get('/deployment-configurations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('listByProject', () => {
    it('should list deployment configurations by project ID', async () => {
      const mockConfigs: DeploymentConfigurationResult[] = [
        {
          id: 'deploy_1',
          projectId: 'proj_789',
          deploymentChannelId: 'channel_111',
          deploymentName: 'Project Deployment 1',
          agentConfigurationId: 'agent_456',
          instructionConfigurationId: 'instr_789',
          deploymentStatus: DeploymentStatus.ACTIVE,
          provisioningType: DeploymentProvisioningType.DIRECT,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<DeploymentConfigurationResult> = {
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
        .get('/deployment-configurations/by-project/proj_789')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.listByProject('proj_789');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].projectId).toBe('proj_789');
    });
  });

  describe('listByAgent', () => {
    it('should list deployment configurations by agent ID', async () => {
      const mockConfigs: DeploymentConfigurationResult[] = [
        {
          id: 'deploy_1',
          projectId: 'proj_789',
          deploymentChannelId: 'channel_111',
          deploymentName: 'Agent Deployment 1',
          agentConfigurationId: 'agent_456',
          instructionConfigurationId: 'instr_789',
          deploymentStatus: DeploymentStatus.ACTIVE,
          provisioningType: DeploymentProvisioningType.DIRECT,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<DeploymentConfigurationResult> = {
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
        .get('/deployment-configurations/by-agent/agent_456')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.listByAgent('agent_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].agentConfigurationId).toBe('agent_456');
    });
  });

  describe('listByInstruction', () => {
    it('should list deployment configurations by instruction ID', async () => {
      const mockConfigs: DeploymentConfigurationResult[] = [
        {
          id: 'deploy_1',
          projectId: 'proj_789',
          deploymentChannelId: 'channel_111',
          deploymentName: 'Instruction Deployment 1',
          agentConfigurationId: 'agent_456',
          instructionConfigurationId: 'instr_789',
          deploymentStatus: DeploymentStatus.ACTIVE,
          provisioningType: DeploymentProvisioningType.DIRECT,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<DeploymentConfigurationResult> = {
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
        .get('/deployment-configurations/by-instruction/instr_789')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.deploymentConfigs.listByInstruction('instr_789');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].instructionConfigurationId).toBe('instr_789');
    });
  });
});
