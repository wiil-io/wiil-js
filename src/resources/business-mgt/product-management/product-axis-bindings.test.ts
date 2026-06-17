/**
 * @fileoverview Tests for Product Axis Bindings resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ProductAxisBinding, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProductAxisBindingsResource', () => {
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
    it('should create a new product axis binding', async () => {
      const input = {
        productId: 'product_123',
        axisId: 'axis_color',
        displayOrder: 1,
        isActive: true,
      };

      const mockResponse: ProductAxisBinding = {
        id: 'binding_123',
        productId: 'product_123',
        axisId: 'axis_color',
        displayOrder: 1,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-axis-bindings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.create(input);

      expect(result.id).toBe('binding_123');
      expect(result.productId).toBe('product_123');
      expect(result.axisId).toBe('axis_color');
      expect(result.displayOrder).toBe(1);
      expect(result.isActive).toBe(true);
    });

    it('should create a binding with product revision ID', async () => {
      const input = {
        productId: 'product_456',
        axisId: 'axis_size',
        productRevisionId: 'rev_v2',
        displayOrder: 2,
        isActive: true,
      };

      const mockResponse: ProductAxisBinding = {
        id: 'binding_456',
        productId: 'product_456',
        axisId: 'axis_size',
        productRevisionId: 'rev_v2',
        displayOrder: 2,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-axis-bindings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.create(input);

      expect(result.productRevisionId).toBe('rev_v2');
    });

    it('should create an inactive binding', async () => {
      const input = {
        productId: 'product_789',
        axisId: 'axis_material',
        displayOrder: 3,
        isActive: false,
      };

      const mockResponse: ProductAxisBinding = {
        id: 'binding_789',
        productId: 'product_789',
        axisId: 'axis_material',
        displayOrder: 3,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-axis-bindings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.create(input);

      expect(result.isActive).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve a product axis binding by ID', async () => {
      const mockResponse: ProductAxisBinding = {
        id: 'binding_123',
        productId: 'product_123',
        axisId: 'axis_color',
        displayOrder: 1,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-axis-bindings/binding_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.get('binding_123');

      expect(result.id).toBe('binding_123');
      expect(result.productId).toBe('product_123');
      expect(result.axisId).toBe('axis_color');
    });

    it('should throw API error when binding not found', async () => {
      nock(BASE_URL)
        .get('/product-axis-bindings/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product axis binding not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productAxisBindings.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByProduct', () => {
    it('should retrieve bindings by product ID', async () => {
      const mockBindings: ProductAxisBinding[] = [
        {
          id: 'binding_1',
          productId: 'product_123',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_2',
          productId: 'product_123',
          axisId: 'axis_size',
          displayOrder: 2,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_3',
          productId: 'product_123',
          axisId: 'axis_material',
          displayOrder: 3,
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
        data: mockBindings,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/product-axis-bindings/by-product/product_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.getByProduct('product_123');

      expect(result.data).toHaveLength(3);
      expect(result.data.every(b => b.productId === 'product_123')).toBe(true);
    });

    it('should retrieve bindings by product with pagination', async () => {
      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
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
        .get('/product-axis-bindings/by-product/product_123')
        .query({ page: '2', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.getByProduct('product_123', {
        page: 2,
        pageSize: 5,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByAxis', () => {
    it('should retrieve bindings by axis ID', async () => {
      const mockBindings: ProductAxisBinding[] = [
        {
          id: 'binding_1',
          productId: 'product_1',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_2',
          productId: 'product_2',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_3',
          productId: 'product_3',
          axisId: 'axis_color',
          displayOrder: 2,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
        data: mockBindings,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/product-axis-bindings/by-axis/axis_color')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.getByAxis('axis_color');

      expect(result.data).toHaveLength(3);
      expect(result.data.every(b => b.axisId === 'axis_color')).toBe(true);
    });

    it('should retrieve bindings by axis with pagination', async () => {
      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
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
        .get('/product-axis-bindings/by-axis/axis_size')
        .query({ page: '3', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.getByAxis('axis_size', {
        page: 3,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalCount).toBe(25);
    });
  });

  describe('update', () => {
    it('should update a product axis binding', async () => {
      const updateData = {
        id: 'binding_123',
        displayOrder: 5,
        isActive: false,
      };

      const mockResponse: ProductAxisBinding = {
        id: 'binding_123',
        productId: 'product_123',
        axisId: 'axis_color',
        displayOrder: 5,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-axis-bindings/binding_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.update('binding_123', updateData);

      expect(result.displayOrder).toBe(5);
      expect(result.isActive).toBe(false);
    });

    it('should update binding display order only', async () => {
      const updateData = {
        id: 'binding_123',
        displayOrder: 10,
      };

      const mockResponse: ProductAxisBinding = {
        id: 'binding_123',
        productId: 'product_123',
        axisId: 'axis_color',
        displayOrder: 10,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-axis-bindings/binding_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.update('binding_123', updateData);

      expect(result.displayOrder).toBe(10);
      expect(result.isActive).toBe(true);
    });

    it('should update binding product revision ID', async () => {
      const updateData = {
        id: 'binding_123',
        productRevisionId: 'rev_v3',
      };

      const mockResponse: ProductAxisBinding = {
        id: 'binding_123',
        productId: 'product_123',
        axisId: 'axis_color',
        productRevisionId: 'rev_v3',
        displayOrder: 1,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-axis-bindings/binding_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.update('binding_123', updateData);

      expect(result.productRevisionId).toBe('rev_v3');
    });
  });

  describe('delete', () => {
    it('should delete a product axis binding', async () => {
      nock(BASE_URL)
        .delete('/product-axis-bindings/binding_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.delete('binding_123');
      expect(result).toBe(true);
    });

    it('should throw API error when binding not found', async () => {
      nock(BASE_URL)
        .delete('/product-axis-bindings/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product axis binding not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productAxisBindings.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list product axis bindings with pagination', async () => {
      const mockBindings: ProductAxisBinding[] = [
        {
          id: 'binding_1',
          productId: 'product_1',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_2',
          productId: 'product_1',
          axisId: 'axis_size',
          displayOrder: 2,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_3',
          productId: 'product_2',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
        data: mockBindings,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/product-axis-bindings')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.list();

      expect(result.data).toHaveLength(3);
      expect(result.meta.totalCount).toBe(3);
    });

    it('should list bindings with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
        data: [],
        meta: {
          page: 5,
          pageSize: 50,
          totalCount: 200,
          totalPages: 4,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-axis-bindings')
        .query({ page: '5', pageSize: '50' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.list({
        page: 5,
        pageSize: 50,
      });

      expect(result.meta.page).toBe(5);
      expect(result.meta.pageSize).toBe(50);
    });
  });

  describe('createBatch', () => {
    it('should create multiple product axis bindings in batch', async () => {
      const batchData = [
        {
          productId: 'product_123',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
        },
        {
          productId: 'product_123',
          axisId: 'axis_size',
          displayOrder: 2,
          isActive: true,
        },
        {
          productId: 'product_123',
          axisId: 'axis_material',
          displayOrder: 3,
          isActive: true,
        },
      ];

      const mockBindings: ProductAxisBinding[] = [
        {
          id: 'binding_1',
          productId: 'product_123',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_2',
          productId: 'product_123',
          axisId: 'axis_size',
          displayOrder: 2,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_3',
          productId: 'product_123',
          axisId: 'axis_material',
          displayOrder: 3,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
        data: mockBindings,
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
        .post('/product-axis-bindings/batch', batchData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.createBatch(batchData);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].axisId).toBe('axis_color');
      expect(result.data[1].axisId).toBe('axis_size');
      expect(result.data[2].axisId).toBe('axis_material');
    });

    it('should create bindings for multiple products in batch', async () => {
      const batchData = [
        {
          productId: 'product_1',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
        },
        {
          productId: 'product_2',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
        },
        {
          productId: 'product_3',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
        },
      ];

      const mockBindings: ProductAxisBinding[] = [
        {
          id: 'binding_1',
          productId: 'product_1',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_2',
          productId: 'product_2',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_3',
          productId: 'product_3',
          axisId: 'axis_color',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductAxisBinding> = {
        data: mockBindings,
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
        .post('/product-axis-bindings/batch', batchData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productAxisBindings.createBatch(batchData);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].productId).toBe('product_1');
      expect(result.data[1].productId).toBe('product_2');
      expect(result.data[2].productId).toBe('product_3');
    });

    it('should throw validation error when batch size exceeds limit', async () => {
      const oversizedBatch = Array.from({ length: 101 }, (_, i) => ({
        productId: `product_${i}`,
        axisId: 'axis_color',
        displayOrder: 1,
        isActive: true,
      }));

      await expect(
        client.productAxisBindings.createBatch(oversizedBatch)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
