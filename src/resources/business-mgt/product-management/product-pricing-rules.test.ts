/**
 * @fileoverview Tests for Product Pricing Rules resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ProductPricingRule, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProductPricingRulesResource', () => {
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
    it('should create a new product pricing rule with full details', async () => {
      const input = {
        name: 'Summer Sale 20% Off',
        discountId: 'discount_123',
        condition: {
          productSetId: 'set_summer',
          quantityMin: 1,
          quantityMax: 10,
        },
        effectiveFrom: Date.now(),
        effectiveTo: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days later
        isActive: true,
        locationId: 'loc_123',
      };

      const mockResponse: ProductPricingRule = {
        id: 'rule_123',
        name: 'Summer Sale 20% Off',
        discountId: 'discount_123',
        condition: {
          productSetId: 'set_summer',
          quantityMin: 1,
          quantityMax: 10,
        },
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
        isActive: true,
        locationId: 'loc_123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.create(input);

      expect(result.id).toBe('rule_123');
      expect(result.name).toBe('Summer Sale 20% Off');
      expect(result.discountId).toBe('discount_123');
      expect(result.condition.productSetId).toBe('set_summer');
      expect(result.isActive).toBe(true);
    });

    it('should create a pricing rule with minimal configuration', async () => {
      const input = {
        name: 'Basic Discount',
        discountId: 'discount_basic',
        condition: {
          productSetId: 'set_all',
        },
        isActive: true,
      };

      const mockResponse: ProductPricingRule = {
        id: 'rule_456',
        name: 'Basic Discount',
        discountId: 'discount_basic',
        condition: {
          productSetId: 'set_all',
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.create(input);

      expect(result.id).toBe('rule_456');
      expect(result.effectiveFrom).toBeUndefined();
      expect(result.effectiveTo).toBeUndefined();
    });

    it('should create a pricing rule with channel mappings', async () => {
      const input = {
        name: 'Multi-Channel Promotion',
        discountId: 'discount_mc',
        condition: {
          productSetId: 'set_electronics',
        },
        channelMappings: [
          { channelId: 'shopify', externalPricingRuleId: 'shopify_promo_123' },
          { channelId: 'amazon', externalPricingRuleId: 'amazon_promo_456' },
        ],
        isActive: true,
      };

      const mockResponse: ProductPricingRule = {
        id: 'rule_789',
        name: 'Multi-Channel Promotion',
        discountId: 'discount_mc',
        condition: {
          productSetId: 'set_electronics',
        },
        channelMappings: [
          { channelId: 'shopify', externalPricingRuleId: 'shopify_promo_123' },
          { channelId: 'amazon', externalPricingRuleId: 'amazon_promo_456' },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-pricing-rules', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.create(input);

      expect(result.channelMappings).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should retrieve a product pricing rule by ID', async () => {
      const mockResponse: ProductPricingRule = {
        id: 'rule_123',
        name: 'Flash Sale',
        discountId: 'discount_flash',
        condition: {
          productSetId: 'set_flash',
          quantityMin: 2,
        },
        effectiveFrom: Date.now() - 1000,
        effectiveTo: Date.now() + 3600000,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-pricing-rules/rule_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.get('rule_123');

      expect(result.id).toBe('rule_123');
      expect(result.name).toBe('Flash Sale');
    });

    it('should throw API error when pricing rule not found', async () => {
      nock(BASE_URL)
        .get('/product-pricing-rules/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product pricing rule not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productPricingRules.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByProductSet', () => {
    it('should retrieve pricing rules by product set ID', async () => {
      const mockRules: ProductPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Set Discount 1',
          discountId: 'discount_1',
          condition: { productSetId: 'set_123' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Set Discount 2',
          discountId: 'discount_2',
          condition: { productSetId: 'set_123' },
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductPricingRule> = {
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
        .get('/product-pricing-rules/by-product-set/set_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.getByProductSet('set_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.condition.productSetId === 'set_123')).toBe(true);
    });

    it('should retrieve rules by product set with pagination', async () => {
      const mockResponse: PaginatedResultType<ProductPricingRule> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 5,
          totalCount: 8,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-pricing-rules/by-product-set/set_123')
        .query({ page: '2', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.getByProductSet('set_123', {
        page: 2,
        pageSize: 5,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByDiscount', () => {
    it('should retrieve pricing rules by discount ID', async () => {
      const mockRules: ProductPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Discount Application 1',
          discountId: 'discount_xyz',
          condition: { productSetId: 'set_1' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Discount Application 2',
          discountId: 'discount_xyz',
          condition: { productSetId: 'set_2' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductPricingRule> = {
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
        .get('/product-pricing-rules/by-discount/discount_xyz')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.getByDiscount('discount_xyz');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.discountId === 'discount_xyz')).toBe(true);
    });

    it('should retrieve rules by discount with pagination', async () => {
      const mockResponse: PaginatedResultType<ProductPricingRule> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 10,
          totalCount: 25,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-pricing-rules/by-discount/discount_abc')
        .query({ page: '3', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.getByDiscount('discount_abc', {
        page: 3,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(3);
    });
  });

  describe('getActive', () => {
    it('should retrieve active pricing rules', async () => {
      const mockRules: ProductPricingRule[] = [
        {
          id: 'rule_active_1',
          name: 'Active Promo 1',
          discountId: 'discount_1',
          condition: { productSetId: 'set_1' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_active_2',
          name: 'Active Promo 2',
          discountId: 'discount_2',
          condition: { productSetId: 'set_2' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductPricingRule> = {
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
        .get('/product-pricing-rules/active')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.getActive();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.isActive)).toBe(true);
    });

    it('should retrieve active rules effective at a specific timestamp', async () => {
      const effectiveTimestamp = Date.now();

      const mockResponse: PaginatedResultType<ProductPricingRule> = {
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
        .get('/product-pricing-rules/active')
        .query({ effectiveAt: effectiveTimestamp.toString() })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.getActive(effectiveTimestamp);

      expect(result.data).toHaveLength(0);
    });

    it('should retrieve active rules with timestamp and pagination', async () => {
      const effectiveTimestamp = Date.now();

      const mockResponse: PaginatedResultType<ProductPricingRule> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 15,
          totalCount: 20,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-pricing-rules/active')
        .query({ effectiveAt: effectiveTimestamp.toString(), page: '2', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.getActive(effectiveTimestamp, {
        page: 2,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a product pricing rule', async () => {
      const updateData = {
        id: 'rule_123',
        name: 'Updated Sale Name',
        isActive: false,
      };

      const mockResponse: ProductPricingRule = {
        id: 'rule_123',
        name: 'Updated Sale Name',
        discountId: 'discount_123',
        condition: { productSetId: 'set_123' },
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-pricing-rules/rule_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.update('rule_123', updateData);

      expect(result.name).toBe('Updated Sale Name');
      expect(result.isActive).toBe(false);
    });

    it('should update pricing rule effective dates', async () => {
      const newEffectiveFrom = Date.now();
      const newEffectiveTo = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days later

      const updateData = {
        id: 'rule_123',
        effectiveFrom: newEffectiveFrom,
        effectiveTo: newEffectiveTo,
      };

      const mockResponse: ProductPricingRule = {
        id: 'rule_123',
        name: 'Time-Limited Sale',
        discountId: 'discount_123',
        condition: { productSetId: 'set_123' },
        effectiveFrom: newEffectiveFrom,
        effectiveTo: newEffectiveTo,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-pricing-rules/rule_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.update('rule_123', updateData);

      expect(result.effectiveFrom).toBe(newEffectiveFrom);
      expect(result.effectiveTo).toBe(newEffectiveTo);
    });
  });

  describe('delete', () => {
    it('should delete a product pricing rule', async () => {
      nock(BASE_URL)
        .delete('/product-pricing-rules/rule_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.delete('rule_123');
      expect(result).toBe(true);
    });

    it('should throw API error when pricing rule not found', async () => {
      nock(BASE_URL)
        .delete('/product-pricing-rules/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product pricing rule not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productPricingRules.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list product pricing rules with pagination', async () => {
      const mockRules: ProductPricingRule[] = [
        {
          id: 'rule_1',
          name: 'Rule A',
          discountId: 'discount_a',
          condition: { productSetId: 'set_a' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_2',
          name: 'Rule B',
          discountId: 'discount_b',
          condition: { productSetId: 'set_b' },
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductPricingRule> = {
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
        .get('/product-pricing-rules')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list rules with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ProductPricingRule> = {
        data: [],
        meta: {
          page: 4,
          pageSize: 25,
          totalCount: 100,
          totalPages: 4,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-pricing-rules')
        .query({ page: '4', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.list({
        page: 4,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(4);
      expect(result.meta.pageSize).toBe(25);
    });
  });

  describe('createBatch', () => {
    it('should create multiple pricing rules in batch', async () => {
      const batchData = [
        {
          name: 'Batch Rule 1',
          discountId: 'discount_1',
          condition: { productSetId: 'set_1' },
          isActive: true,
        },
        {
          name: 'Batch Rule 2',
          discountId: 'discount_2',
          condition: { productSetId: 'set_2' },
          isActive: true,
        },
        {
          name: 'Batch Rule 3',
          discountId: 'discount_3',
          condition: { productSetId: 'set_3' },
          isActive: false,
        },
      ];

      const mockRules: ProductPricingRule[] = [
        {
          id: 'rule_batch_1',
          name: 'Batch Rule 1',
          discountId: 'discount_1',
          condition: { productSetId: 'set_1' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_batch_2',
          name: 'Batch Rule 2',
          discountId: 'discount_2',
          condition: { productSetId: 'set_2' },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rule_batch_3',
          name: 'Batch Rule 3',
          discountId: 'discount_3',
          condition: { productSetId: 'set_3' },
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductPricingRule> = {
        data: mockRules,
        meta: {
          page: 1,
          pageSize: 3,
          totalCount: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/product-pricing-rules/batch', batchData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productPricingRules.createBatch(batchData);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Batch Rule 1');
      expect(result.data[2].isActive).toBe(false);
    });

    it('should throw validation error when batch size exceeds limit', async () => {
      const oversizedBatch = Array.from({ length: 51 }, (_, i) => ({
        name: `Rule ${i}`,
        discountId: `discount_${i}`,
        condition: { productSetId: `set_${i}` },
        isActive: true,
      }));

      await expect(
        client.productPricingRules.createBatch(oversizedBatch)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
