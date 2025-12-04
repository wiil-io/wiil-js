/**
 * @fileoverview Tests for Instruction Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { InstructionConfiguration, PaginatedResultType, BusinessSupportServices } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('InstructionConfigurationsResource', () => {
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
    it('should create a new instruction configuration', async () => {
      const input = {
        instructionName: 'customer-support-agent',
        role: 'Customer Support Specialist',
        introductionMessage: 'Hello! How can I help you today?',
        instructions: 'You are a helpful customer support agent. Always be polite and professional.',
        guardrails: 'Never share sensitive customer data. Always verify identity before providing account information.',
        supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
        knowledgeSourceIds: ['ks_789'],
        isTemplate: false,
        isPrimary: false,
        metadata: { version: '1.0' },
      };

      const mockResponse: InstructionConfiguration = {
        id: 'instr_123',
        instructionName: 'customer-support-agent',
        role: 'Customer Support Specialist',
        introductionMessage: 'Hello! How can I help you today?',
        instructions: 'You are a helpful customer support agent. Always be polite and professional.',
        guardrails: 'Never share sensitive customer data. Always verify identity before providing account information.',
        supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
        knowledgeSourceIds: ['ks_789'],
        isTemplate: false,
        isPrimary: false,
        metadata: { version: '1.0' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/instruction-configurations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.instructionConfigs.create(input);

      expect(result.id).toBe('instr_123');
      expect(result.instructionName).toBe('customer-support-agent');
      expect(result.role).toBe('Customer Support Specialist');
      expect(result.supportedServices).toContain(BusinessSupportServices.APPOINTMENT_MANAGEMENT);
    });
  });

  describe('get', () => {
    it('should retrieve an instruction configuration by ID', async () => {
      const mockResponse: InstructionConfiguration = {
        id: 'instr_123',
        instructionName: 'customer-support-agent',
        role: 'Customer Support Specialist',
        introductionMessage: 'Hello! How can I help you today?',
        instructions: 'You are a helpful customer support agent. Always be polite and professional.',
        guardrails: 'Never share sensitive customer data. Always verify identity before providing account information.',
        supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
        knowledgeSourceIds: ['ks_789'],
        isTemplate: false,
        isPrimary: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/instruction-configurations/instr_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.instructionConfigs.get('instr_123');

      expect(result.id).toBe('instr_123');
      expect(result.instructionName).toBe('customer-support-agent');
      expect(result.role).toBe('Customer Support Specialist');
    });

    it('should throw API error when instruction configuration not found', async () => {
      nock(BASE_URL)
        .get('/instruction-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Instruction configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.instructionConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('update', () => {
    it('should update an instruction configuration', async () => {
      const updateData = {
        id: 'instr_123',
        introductionMessage: 'Hi there! How may I assist you today?',
        guardrails: 'Updated safety guidelines: Never share sensitive customer data.',
      };

      const mockResponse: InstructionConfiguration = {
        id: 'instr_123',
        instructionName: 'customer-support-agent',
        role: 'Customer Support Specialist',
        introductionMessage: 'Hi there! How may I assist you today?',
        instructions: 'You are a helpful customer support agent. Always be polite and professional.',
        guardrails: 'Updated safety guidelines: Never share sensitive customer data.',
        supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
        knowledgeSourceIds: ['ks_789'],
        isTemplate: false,
        isPrimary: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/instruction-configurations', {
          id: 'instr_123',
          introductionMessage: 'Hi there! How may I assist you today?',
          guardrails: 'Updated safety guidelines: Never share sensitive customer data.',
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.instructionConfigs.update(updateData);

      expect(result.introductionMessage).toBe('Hi there! How may I assist you today?');
      expect(result.guardrails).toBe('Updated safety guidelines: Never share sensitive customer data.');
    });
  });

  describe('delete', () => {
    it('should delete an instruction configuration', async () => {
      nock(BASE_URL)
        .delete('/instruction-configurations/instr_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.instructionConfigs.delete('instr_123');
      expect(result).toBe(true);
    });

    it('should throw API error when instruction configuration not found', async () => {
      nock(BASE_URL)
        .delete('/instruction-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Instruction configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.instructionConfigs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list instruction configurations with pagination', async () => {
      const mockConfigs: InstructionConfiguration[] = [
        {
          id: 'instr_1',
          instructionName: 'customer-support-agent',
          role: 'Customer Support Specialist',
          introductionMessage: 'Hello! How can I help you today?',
          instructions: 'You are a helpful customer support agent.',
          guardrails: 'Never share sensitive customer data.',
          supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
          knowledgeSourceIds: ['ks_789'],
          isTemplate: false,
          isPrimary: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'instr_2',
          instructionName: 'sales-representative',
          role: 'Sales Representative',
          introductionMessage: 'Hi! I can help you find the perfect solution.',
          instructions: 'You are a knowledgeable sales agent.',
          guardrails: 'Always be honest about product capabilities.',
          supportedServices: [BusinessSupportServices.PRODUCT_ORDER_MANAGEMENT],
          knowledgeSourceIds: ['ks_790'],
          isTemplate: false,
          isPrimary: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<InstructionConfiguration> = {
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
        .get('/instruction-configurations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.instructionConfigs.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should list instruction configurations with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<InstructionConfiguration> = {
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
        .get('/instruction-configurations')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.instructionConfigs.list({
        page: 2,
        pageSize: 50,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getSupportedTemplates', () => {
    it('should retrieve supported instruction templates', async () => {
      const mockTemplates: InstructionConfiguration[] = [
        {
          id: 'template_1',
          instructionName: 'customer-support-template',
          role: 'Customer Support Specialist',
          introductionMessage: 'Hello! How can I help you today?',
          instructions: 'You are a helpful customer support agent.',
          guardrails: 'Never share sensitive customer data.',
          supportedServices: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
          knowledgeSourceIds: [],
          isTemplate: true,
          isPrimary: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'template_2',
          instructionName: 'sales-template',
          role: 'Sales Representative',
          introductionMessage: 'Hi! I can help you find the perfect solution.',
          instructions: 'You are a knowledgeable sales agent.',
          guardrails: 'Always be honest about product capabilities.',
          supportedServices: [BusinessSupportServices.PRODUCT_ORDER_MANAGEMENT],
          knowledgeSourceIds: [],
          isTemplate: true,
          isPrimary: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      nock(BASE_URL)
        .get('/instruction-configurations/supported-templates')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockTemplates,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.instructionConfigs.getSupportedTemplates();

      expect(result).toHaveLength(2);
      expect(result[0].isTemplate).toBe(true);
      expect(result[0].isPrimary).toBe(true);
      expect(result[1].isTemplate).toBe(true);
      expect(result[1].isPrimary).toBe(false);
    });
  });
});
