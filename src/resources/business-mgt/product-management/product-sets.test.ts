/**
 * @fileoverview Tests for Product Sets resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ProductSet, PaginatedResultType, ProductSetPricingMode, ProductSetTargetingMode } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProductSetsResource', () => {
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
    it('should create a new product set with explicit targeting and fixed pricing', async () => {
      const input = {
        name: 'Summer Bundle',
        description: 'Best summer products bundle',
        code: 'SUMMER-2024',
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 99.99,
        items: [
          {
            productId: 'prod_123',
            quantity: 1,
            isRequired: true,
            displayOrder: 1,
          },
          {
            productId: 'prod_456',
            productVariantId: 'var_789',
            quantity: 2,
            isRequired: true,
            displayOrder: 2,
          },
        ],
        isActive: true,
        imageUrl: 'https://cdn.example.com/bundle.jpg',
        displayOrder: 1,
      };

      const mockResponse: ProductSet = {
        id: 'set_123',
        name: 'Summer Bundle',
        description: 'Best summer products bundle',
        code: 'SUMMER-2024',
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 99.99,
        items: [
          {
            productId: 'prod_123',
            quantity: 1,
            isRequired: true,
            displayOrder: 1,
          },
          {
            productId: 'prod_456',
            productVariantId: 'var_789',
            quantity: 2,
            isRequired: true,
            displayOrder: 2,
          },
        ],
        isActive: true,
        imageUrl: 'https://cdn.example.com/bundle.jpg',
        displayOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-sets', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.create(input);

      expect(result.id).toBe('set_123');
      expect(result.name).toBe('Summer Bundle');
      expect(result.code).toBe('SUMMER-2024');
      expect(result.pricingMode).toBe(ProductSetPricingMode.FIXED);
      expect(result.fixedPrice).toBe(99.99);
      expect(result.items).toHaveLength(2);
    });

    it('should create a product set with selector targeting and sum pricing', async () => {
      const input = {
        name: 'All Electronics Bundle',
        targetingMode: ProductSetTargetingMode.SELECTOR,
        pricingMode: ProductSetPricingMode.SUM_OF_ITEMS,
        selector: {
          productIdsAny: ['prod_1', 'prod_2', 'prod_3'],
          productIdsAll: [],
          allProducts: false,
          quantityMin: 2,
          quantityMax: 5,
        },
        isActive: true,
      };

      const mockResponse: ProductSet = {
        id: 'set_456',
        name: 'All Electronics Bundle',
        targetingMode: ProductSetTargetingMode.SELECTOR,
        pricingMode: ProductSetPricingMode.SUM_OF_ITEMS,
        selector: {
          productIdsAny: ['prod_1', 'prod_2', 'prod_3'],
          productIdsAll: [],
          allProducts: false,
          quantityMin: 2,
          quantityMax: 5,
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-sets', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.create(input);

      expect(result.id).toBe('set_456');
      expect(result.targetingMode).toBe(ProductSetTargetingMode.SELECTOR);
      expect(result.pricingMode).toBe(ProductSetPricingMode.SUM_OF_ITEMS);
      expect(result.selector?.productIdsAny).toHaveLength(3);
    });
  });

  describe('get', () => {
    it('should retrieve a product set by ID', async () => {
      const mockResponse: ProductSet = {
        id: 'set_123',
        name: 'Winter Collection',
        description: 'Warm winter essentials',
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 149.99,
        items: [
          {
            productId: 'prod_winter_1',
            quantity: 1,
            isRequired: true,
          },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-sets/set_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.get('set_123');

      expect(result.id).toBe('set_123');
      expect(result.name).toBe('Winter Collection');
      expect(result.fixedPrice).toBe(149.99);
    });

    it('should throw API error when product set not found', async () => {
      nock(BASE_URL)
        .get('/product-sets/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product set not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productSets.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCode', () => {
    it('should retrieve a product set by code', async () => {
      const mockResponse: ProductSet = {
        id: 'set_123',
        name: 'Holiday Special',
        code: 'HOLIDAY-2024',
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 79.99,
        items: [
          {
            productId: 'prod_holiday',
            quantity: 1,
            isRequired: true,
          },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-sets/code/HOLIDAY-2024')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.getByCode('HOLIDAY-2024');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('HOLIDAY-2024');
      expect(result?.name).toBe('Holiday Special');
    });

    it('should return null when code not found', async () => {
      nock(BASE_URL)
        .get('/product-sets/code/INVALID-CODE')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.getByCode('INVALID-CODE');

      expect(result).toBeNull();
    });

    it('should handle URL encoding for codes with special characters', async () => {
      const mockResponse: ProductSet = {
        id: 'set_special',
        name: 'Special Bundle',
        code: 'BUNDLE/2024',
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 59.99,
        items: [
          {
            productId: 'prod_1',
            quantity: 1,
            isRequired: true,
          },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-sets/code/BUNDLE%2F2024')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.getByCode('BUNDLE/2024');

      expect(result).not.toBeNull();
      expect(result?.code).toBe('BUNDLE/2024');
    });
  });

  describe('getActive', () => {
    it('should retrieve active product sets', async () => {
      const mockSets: ProductSet[] = [
        {
          id: 'set_1',
          name: 'Active Bundle 1',
          targetingMode: ProductSetTargetingMode.EXPLICIT,
          pricingMode: ProductSetPricingMode.FIXED,
          fixedPrice: 49.99,
          items: [{ productId: 'prod_1', quantity: 1, isRequired: true }],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_2',
          name: 'Active Bundle 2',
          targetingMode: ProductSetTargetingMode.EXPLICIT,
          pricingMode: ProductSetPricingMode.SUM_OF_ITEMS,
          items: [{ productId: 'prod_2', quantity: 2, isRequired: true }],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductSet> = {
        data: mockSets,
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
        .get('/product-sets/active')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.getActive();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(s => s.isActive)).toBe(true);
    });

    it('should retrieve active sets with pagination', async () => {
      const mockResponse: PaginatedResultType<ProductSet> = {
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
        .get('/product-sets/active')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.getActive({
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a product set', async () => {
      const updateData = {
        id: 'set_123',
        name: 'Updated Bundle Name',
        description: 'Updated description',
        fixedPrice: 119.99,
        isActive: true,
      };

      const mockResponse: ProductSet = {
        id: 'set_123',
        name: 'Updated Bundle Name',
        description: 'Updated description',
        code: 'ORIGINAL-CODE',
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 119.99,
        items: [{ productId: 'prod_1', quantity: 1, isRequired: true }],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-sets/set_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.update('set_123', updateData);

      expect(result.name).toBe('Updated Bundle Name');
      expect(result.fixedPrice).toBe(119.99);
    });

    it('should update product set items', async () => {
      const updateData = {
        id: 'set_123',
        items: [
          { productId: 'prod_new_1', quantity: 3, isRequired: true, displayOrder: 1 },
          { productId: 'prod_new_2', quantity: 1, isRequired: false, displayOrder: 2 },
        ],
      };

      const mockResponse: ProductSet = {
        id: 'set_123',
        name: 'Bundle',
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 99.99,
        items: [
          { productId: 'prod_new_1', quantity: 3, isRequired: true, displayOrder: 1 },
          { productId: 'prod_new_2', quantity: 1, isRequired: false, displayOrder: 2 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-sets/set_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.update('set_123', updateData);

      expect(result.items).toHaveLength(2);
      expect(result.items?.[0].productId).toBe('prod_new_1');
      expect(result.items?.[1].isRequired).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a product set', async () => {
      nock(BASE_URL)
        .delete('/product-sets/set_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.delete('set_123');
      expect(result).toBe(true);
    });

    it('should throw API error when product set not found', async () => {
      nock(BASE_URL)
        .delete('/product-sets/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product set not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productSets.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list product sets with pagination', async () => {
      const mockSets: ProductSet[] = [
        {
          id: 'set_1',
          name: 'Bundle A',
          targetingMode: ProductSetTargetingMode.EXPLICIT,
          pricingMode: ProductSetPricingMode.FIXED,
          fixedPrice: 49.99,
          items: [{ productId: 'prod_1', quantity: 1, isRequired: true }],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_2',
          name: 'Bundle B',
          targetingMode: ProductSetTargetingMode.SELECTOR,
          pricingMode: ProductSetPricingMode.SUM_OF_ITEMS,
          selector: { productIdsAny: ['prod_2'], productIdsAll: [], allProducts: false },
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductSet> = {
        data: mockSets,
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
        .get('/product-sets')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list sets with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ProductSet> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 5,
          totalCount: 12,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-sets')
        .query({ page: '3', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.list({
        page: 3,
        pageSize: 5,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(5);
    });
  });

  describe('createBatch', () => {
    it('should create multiple product sets in batch', async () => {
      const batchData = [
        {
          name: 'Batch Bundle 1',
          code: 'BATCH-1',
          targetingMode: ProductSetTargetingMode.EXPLICIT,
          pricingMode: ProductSetPricingMode.FIXED,
          fixedPrice: 39.99,
          items: [{ productId: 'prod_1', quantity: 1, isRequired: true }],
          isActive: true,
        },
        {
          name: 'Batch Bundle 2',
          code: 'BATCH-2',
          targetingMode: ProductSetTargetingMode.EXPLICIT,
          pricingMode: ProductSetPricingMode.FIXED,
          fixedPrice: 59.99,
          items: [{ productId: 'prod_2', quantity: 2, isRequired: true }],
          isActive: true,
        },
      ];

      const mockSets: ProductSet[] = [
        {
          id: 'set_batch_1',
          name: 'Batch Bundle 1',
          code: 'BATCH-1',
          targetingMode: ProductSetTargetingMode.EXPLICIT,
          pricingMode: ProductSetPricingMode.FIXED,
          fixedPrice: 39.99,
          items: [{ productId: 'prod_1', quantity: 1, isRequired: true }],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_batch_2',
          name: 'Batch Bundle 2',
          code: 'BATCH-2',
          targetingMode: ProductSetTargetingMode.EXPLICIT,
          pricingMode: ProductSetPricingMode.FIXED,
          fixedPrice: 59.99,
          items: [{ productId: 'prod_2', quantity: 2, isRequired: true }],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductSet> = {
        data: mockSets,
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
        .post('/product-sets/batch', batchData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productSets.createBatch(batchData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].code).toBe('BATCH-1');
      expect(result.data[1].code).toBe('BATCH-2');
    });

    it('should throw validation error when batch size exceeds limit', async () => {
      const oversizedBatch = Array.from({ length: 51 }, (_, i) => ({
        name: `Bundle ${i}`,
        targetingMode: ProductSetTargetingMode.EXPLICIT,
        pricingMode: ProductSetPricingMode.FIXED,
        fixedPrice: 9.99,
        items: [{ productId: `prod_${i}`, quantity: 1, isRequired: true }],
        isActive: true,
      }));

      await expect(
        client.productSets.createBatch(oversizedBatch)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
