/**
 * @fileoverview Tests for Menu Pricing Rules resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { MenuPricingRule, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('MenuPricingRulesResource', () => {
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
    it('should create a new menu pricing rule', async () => {
      const input = {
        name: 'Happy Hour 20% Off',
        menuSetId: 'set_123',
        discountId: 'discount_456',
        discountType: 'percentage' as const,
        discountValue: 20,
        effectiveFrom: Date.now(),
        effectiveTo: Date.now() + 86400000,
        isActive: true,
      };

      const mockResponse: MenuPricingRule = {
        id: 'rule_123',
        name: 'Happy Hour 20% Off',
        menuSetId: 'set_123',
        discountId: 'discount_456',
        discountType: 'percentage',
        discountValue: 20,
        effectiveFrom: Date.now(),
        effectiveTo: Date.now() + 86400000,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.create(input);

      expect(result.id).toBe('rule_123');
      expect(result.name).toBe('Happy Hour 20% Off');
      expect(result.discountType).toBe('percentage');
      expect(result.discountValue).toBe(20);
      expect(result.isActive).toBe(true);
    });

    it('should create a fixed amount discount rule', async () => {
      const input = {
        name: '$5 Off All Items',
        menuSetId: 'set_789',
        discountType: 'fixed' as const,
        discountValue: 5.00,
        isActive: true,
      };

      const mockResponse: MenuPricingRule = {
        id: 'rule_456',
        name: '$5 Off All Items',
        menuSetId: 'set_789',
        discountType: 'fixed',
        discountValue: 5.00,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.create(input);

      expect(result.id).toBe('rule_456');
      expect(result.discountType).toBe('fixed');
      expect(result.discountValue).toBe(5.00);
    });
  });

  describe('get', () => {
    it('should retrieve a menu pricing rule by ID', async () => {
      const mockResponse: MenuPricingRule = {
        id: 'rule_123',
        name: 'Weekend Special',
        menuSetId: 'set_123',
        discountType: 'percentage',
        discountValue: 15,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/menu-pricing-rules/rule_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.get('rule_123');

      expect(result.id).toBe('rule_123');
      expect(result.name).toBe('Weekend Special');
      expect(result.discountValue).toBe(15);
    });

    it('should throw API error when pricing rule not found', async () => {
      nock(BASE_URL)
        .get('/menu-pricing-rules/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Menu pricing rule not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.menuPricingRules.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByMenuSet', () => {
    it('should retrieve pricing rules by menu set ID', async () => {
      const mockRules: MenuPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Morning Discount',
          menuSetId: 'set_123',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Afternoon Special',
          menuSetId: 'set_123',
          discountType: 'fixed',
          discountValue: 3,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuPricingRule> = {
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
        .get('/menu-pricing-rules/by-menu-set/set_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.getByMenuSet('set_123');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Morning Discount');
      expect(result.data[1].name).toBe('Afternoon Special');
    });

    it('should retrieve pricing rules with pagination parameters', async () => {
      const mockResponse: PaginatedResultType<MenuPricingRule> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 15,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/menu-pricing-rules/by-menu-set/set_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.getByMenuSet('set_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByDiscount', () => {
    it('should retrieve pricing rules by discount ID', async () => {
      const mockRules: MenuPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Lunch Menu Discount',
          menuSetId: 'set_1',
          discountId: 'discount_456',
          discountType: 'percentage',
          discountValue: 15,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuPricingRule> = {
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
        .get('/menu-pricing-rules/by-discount/discount_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.getByDiscount('discount_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].discountId).toBe('discount_456');
    });
  });

  describe('getActive', () => {
    it('should retrieve active pricing rules', async () => {
      const mockRules: MenuPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Current Promotion',
          menuSetId: 'set_1',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          effectiveFrom: Date.now() - 3600000,
          effectiveTo: Date.now() + 3600000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuPricingRule> = {
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
        .get('/menu-pricing-rules/active')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.getActive();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].isActive).toBe(true);
    });

    it('should retrieve active pricing rules at a specific timestamp', async () => {
      const timestamp = Date.now();

      const mockResponse: PaginatedResultType<MenuPricingRule> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/menu-pricing-rules/active')
        .query({ effectiveAt: timestamp.toString() })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.getActive(timestamp);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update a menu pricing rule', async () => {
      const updateData = {
        id: 'rule_123',
        name: 'Updated Happy Hour',
        discountValue: 25,
      };

      const mockResponse: MenuPricingRule = {
        id: 'rule_123',
        name: 'Updated Happy Hour',
        menuSetId: 'set_123',
        discountType: 'percentage',
        discountValue: 25,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-pricing-rules/rule_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.update('rule_123', updateData);

      expect(result.name).toBe('Updated Happy Hour');
      expect(result.discountValue).toBe(25);
    });

    it('should update isActive status', async () => {
      const updateData = {
        id: 'rule_123',
        isActive: false,
      };

      const mockResponse: MenuPricingRule = {
        id: 'rule_123',
        name: 'Expired Promotion',
        menuSetId: 'set_123',
        discountType: 'percentage',
        discountValue: 10,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-pricing-rules/rule_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.update('rule_123', updateData);

      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a menu pricing rule', async () => {
      nock(BASE_URL)
        .delete('/menu-pricing-rules/rule_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.delete('rule_123');
      expect(result).toBe(true);
    });

    it('should throw API error when pricing rule not found', async () => {
      nock(BASE_URL)
        .delete('/menu-pricing-rules/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Menu pricing rule not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.menuPricingRules.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list menu pricing rules with pagination', async () => {
      const mockRules: MenuPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Rule One',
          menuSetId: 'set_1',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Rule Two',
          menuSetId: 'set_2',
          discountType: 'fixed',
          discountValue: 5,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuPricingRule> = {
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
        .get('/menu-pricing-rules')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<MenuPricingRule> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 5,
          totalCount: 25,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/menu-pricing-rules')
        .query({ page: '3', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.list({
        page: 3,
        pageSize: 5,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(5);
      expect(result.meta.totalPages).toBe(5);
    });
  });

  describe('createBatch', () => {
    it('should create multiple menu pricing rules in batch', async () => {
      const inputData = [
        { name: 'Rule A', menuSetId: 'set_1', discountType: 'percentage' as const, discountValue: 10, isActive: true },
        { name: 'Rule B', menuSetId: 'set_2', discountType: 'fixed' as const, discountValue: 5, isActive: true },
      ];

      const mockRules: MenuPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Rule A',
          menuSetId: 'set_1',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Rule B',
          menuSetId: 'set_2',
          discountType: 'fixed',
          discountValue: 5,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuPricingRule> = {
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
        .post('/menu-pricing-rules/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuPricingRules.createBatch(inputData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Rule A');
      expect(result.data[1].name).toBe('Rule B');
    });
  });
});
