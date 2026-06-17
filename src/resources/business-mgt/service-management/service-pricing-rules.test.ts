/**
 * @fileoverview Tests for Service Pricing Rules resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ServicePricingRule, PaginatedResultType, PricingRuleAdjustmentType, PricingRuleApplyLevel, PricingChannel } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ServicePricingRulesResource', () => {
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
    it('should create a service pricing rule with basic details', async () => {
      const input = {
        name: 'Weekend Special',
        condition: {
          daysOfWeek: [0, 6],
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 15,
          currency: 'USD',
        },
        isActive: true,
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_123',
        name: 'Weekend Special',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 0,
        condition: {
          daysOfWeek: [0, 6],
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 15,
          currency: 'USD',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.create(input);

      expect(result.id).toBe('rule_123');
      expect(result.name).toBe('Weekend Special');
      expect(result.action.adjustmentType).toBe(PricingRuleAdjustmentType.PERCENTAGE);
      expect(result.action.adjustmentValue).toBe(15);
    });

    it('should create a pricing rule with time-based conditions', async () => {
      const input = {
        name: 'Happy Hour',
        condition: {
          daysOfWeek: [1, 2, 3, 4, 5],
          startMinute: 960,
          endMinute: 1080,
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 20,
          currency: 'USD',
        },
        priority: 10,
        isStackable: false,
        isActive: true,
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_456',
        name: 'Happy Hour',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: false,
        priority: 10,
        condition: {
          daysOfWeek: [1, 2, 3, 4, 5],
          startMinute: 960,
          endMinute: 1080,
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 20,
          currency: 'USD',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.create(input);

      expect(result.condition.startMinute).toBe(960);
      expect(result.condition.endMinute).toBe(1080);
      expect(result.priority).toBe(10);
      expect(result.isStackable).toBe(false);
    });

    it('should create a pricing rule with fixed adjustment', async () => {
      const input = {
        name: 'Flat Discount',
        condition: {
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.DIRECT,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.FIXED,
          adjustmentValue: 10.00,
          currency: 'USD',
        },
        isActive: true,
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_789',
        name: 'Flat Discount',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 0,
        condition: {
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.DIRECT,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.FIXED,
          adjustmentValue: 10.00,
          currency: 'USD',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.create(input);

      expect(result.action.adjustmentType).toBe(PricingRuleAdjustmentType.FIXED);
      expect(result.condition.channel).toBe(PricingChannel.DIRECT);
    });

    it('should create a pricing rule with service-specific targeting', async () => {
      const input = {
        name: 'Premium Service Discount',
        condition: {
          allServices: false,
          serviceIdsAny: ['svc_123', 'svc_456'],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 10,
          currency: 'USD',
        },
        isActive: true,
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_service',
        name: 'Premium Service Discount',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 0,
        condition: {
          allServices: false,
          serviceIdsAny: ['svc_123', 'svc_456'],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 10,
          currency: 'USD',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.create(input);

      expect(result.condition.allServices).toBe(false);
      expect(result.condition.serviceIdsAny).toHaveLength(2);
    });

    it('should create a pricing rule with effective dates', async () => {
      const effectiveFrom = Date.now();
      const effectiveTo = Date.now() + 30 * 24 * 60 * 60 * 1000;

      const input = {
        name: 'Summer Promo',
        condition: {
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 25,
          currency: 'USD',
        },
        effectiveFrom,
        effectiveTo,
        isActive: true,
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_summer',
        name: 'Summer Promo',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 0,
        condition: {
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 25,
          currency: 'USD',
        },
        effectiveFrom,
        effectiveTo,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.create(input);

      expect(result.effectiveFrom).toBe(effectiveFrom);
      expect(result.effectiveTo).toBe(effectiveTo);
    });
  });

  describe('get', () => {
    it('should retrieve a service pricing rule by ID', async () => {
      const mockResponse: ServicePricingRule = {
        id: 'rule_123',
        name: 'Weekend Special',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 5,
        condition: {
          daysOfWeek: [0, 6],
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 15,
          currency: 'USD',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/service-pricing-rules/rule_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.get('rule_123');

      expect(result.id).toBe('rule_123');
      expect(result.name).toBe('Weekend Special');
      expect(result.priority).toBe(5);
    });

    it('should throw API error when rule not found', async () => {
      nock(BASE_URL)
        .get('/service-pricing-rules/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service pricing rule not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.servicePricingRules.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByLocation', () => {
    it('should retrieve pricing rules by location ID', async () => {
      const mockRules: ServicePricingRule[] = [
        {
          id: 'rule_1',
          locationId: 'loc_123',
          name: 'Location Discount',
          applyLevel: PricingRuleApplyLevel.ORDER,
          isStackable: true,
          priority: 0,
          condition: {
            allServices: true,
            serviceIdsAny: [],
            serviceIdsAll: [],
            channel: PricingChannel.ALL,
          },
          action: {
            adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
            adjustmentValue: 10,
            currency: 'USD',
          },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServicePricingRule> = {
        data: mockRules,
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
        .get('/service-pricing-rules/by-location/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.getByLocation('loc_123');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].locationId).toBe('loc_123');
    });

    it('should get location rules with pagination', async () => {
      const mockResponse: PaginatedResultType<ServicePricingRule> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/service-pricing-rules/by-location/loc_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.getByLocation('loc_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a pricing rule name and priority', async () => {
      const input = {
        id: 'rule_123',
        name: 'Extended Happy Hour',
        priority: 15,
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_123',
        name: 'Extended Happy Hour',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 15,
        condition: {
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 20,
          currency: 'USD',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.update(input);

      expect(result.name).toBe('Extended Happy Hour');
      expect(result.priority).toBe(15);
    });

    it('should update adjustment value', async () => {
      const input = {
        id: 'rule_456',
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 30,
          currency: 'USD',
        },
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_456',
        name: 'Summer Sale',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 0,
        condition: {
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 30,
          currency: 'USD',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.update(input);

      expect(result.action.adjustmentValue).toBe(30);
    });

    it('should deactivate a pricing rule', async () => {
      const input = {
        id: 'rule_789',
        isActive: false,
      };

      const mockResponse: ServicePricingRule = {
        id: 'rule_789',
        name: 'Old Promo',
        applyLevel: PricingRuleApplyLevel.ORDER,
        isStackable: true,
        priority: 0,
        condition: {
          allServices: true,
          serviceIdsAny: [],
          serviceIdsAll: [],
          channel: PricingChannel.ALL,
        },
        action: {
          adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
          adjustmentValue: 10,
          currency: 'USD',
        },
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.update(input);

      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a service pricing rule', async () => {
      nock(BASE_URL)
        .delete('/service-pricing-rules/rule_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.delete('rule_123');
      expect(result).toBe(true);
    });

    it('should throw API error when rule not found', async () => {
      nock(BASE_URL)
        .delete('/service-pricing-rules/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service pricing rule not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.servicePricingRules.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list service pricing rules with pagination', async () => {
      const mockRules: ServicePricingRule[] = [
        {
          id: 'rule_1',
          name: 'Weekend Special',
          applyLevel: PricingRuleApplyLevel.ORDER,
          isStackable: true,
          priority: 10,
          condition: {
            allServices: true,
            serviceIdsAny: [],
            serviceIdsAll: [],
            channel: PricingChannel.ALL,
          },
          action: {
            adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
            adjustmentValue: 15,
            currency: 'USD',
          },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Happy Hour',
          applyLevel: PricingRuleApplyLevel.ORDER,
          isStackable: false,
          priority: 5,
          condition: {
            allServices: true,
            serviceIdsAny: [],
            serviceIdsAll: [],
            channel: PricingChannel.ALL,
          },
          action: {
            adjustmentType: PricingRuleAdjustmentType.PERCENTAGE,
            adjustmentValue: 20,
            currency: 'USD',
          },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServicePricingRule> = {
        data: mockRules,
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
        .get('/service-pricing-rules')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].priority).toBe(10);
    });

    it('should list rules with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ServicePricingRule> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 30,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/service-pricing-rules')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.list({
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
    });
  });

  describe('createBatch', () => {
    it('should create multiple pricing rules in batch', async () => {
      const input = [
        {
          name: 'Monday Special',
          condition: { daysOfWeek: [1], allServices: true, serviceIdsAny: [], serviceIdsAll: [], channel: PricingChannel.ALL },
          action: { adjustmentType: PricingRuleAdjustmentType.PERCENTAGE, adjustmentValue: 10, currency: 'USD' },
          isActive: true,
        },
        {
          name: 'Tuesday Special',
          condition: { daysOfWeek: [2], allServices: true, serviceIdsAny: [], serviceIdsAll: [], channel: PricingChannel.ALL },
          action: { adjustmentType: PricingRuleAdjustmentType.PERCENTAGE, adjustmentValue: 10, currency: 'USD' },
          isActive: true,
        },
      ];

      const mockRules: ServicePricingRule[] = [
        {
          id: 'rule_1',
          name: 'Monday Special',
          applyLevel: PricingRuleApplyLevel.ORDER,
          isStackable: true,
          priority: 0,
          condition: { daysOfWeek: [1], allServices: true, serviceIdsAny: [], serviceIdsAll: [], channel: PricingChannel.ALL },
          action: { adjustmentType: PricingRuleAdjustmentType.PERCENTAGE, adjustmentValue: 10, currency: 'USD' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Tuesday Special',
          applyLevel: PricingRuleApplyLevel.ORDER,
          isStackable: true,
          priority: 0,
          condition: { daysOfWeek: [2], allServices: true, serviceIdsAny: [], serviceIdsAll: [], channel: PricingChannel.ALL },
          action: { adjustmentType: PricingRuleAdjustmentType.PERCENTAGE, adjustmentValue: 10, currency: 'USD' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServicePricingRule> = {
        data: mockRules,
        meta: {
          page: 1,
          pageSize: 2,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/service-pricing-rules/batch', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePricingRules.createBatch(input);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Monday Special');
      expect(result.data[1].name).toBe('Tuesday Special');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const input = Array(51).fill({
        name: 'Test Rule',
        condition: { allServices: true, serviceIdsAny: [], serviceIdsAll: [], channel: PricingChannel.ALL },
        action: { adjustmentType: PricingRuleAdjustmentType.PERCENTAGE, adjustmentValue: 10, currency: 'USD' },
        isActive: true,
      });

      await expect(
        client.servicePricingRules.createBatch(input)
      ).rejects.toThrow('Batch size exceeds maximum limit of 50');
    });
  });
});
