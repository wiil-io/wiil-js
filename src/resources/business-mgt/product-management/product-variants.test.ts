/**
 * @fileoverview Tests for Product Variants resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ProductVariant, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProductVariantsResource', () => {
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
    it('should create a new product variant with full details', async () => {
      const input = {
        productId: 'product_123',
        axisValues: {
          axis_size: 'value_large',
          axis_color: 'value_red',
        },
        sku: 'PROD-LRG-RED',
        barcode: '123456789012',
        price: 49.99,
        cost: 25.00,
        compareAtPrice: 59.99,
        stockQuantity: 100,
        lowStockThreshold: 10,
        weight: 1.5,
        dimensions: {
          length: 10,
          width: 8,
          height: 4,
          unit: 'inches' as const,
        },
        isActive: true,
        isDefault: false,
      };

      const mockResponse: ProductVariant = {
        id: 'variant_123',
        productId: 'product_123',
        axisValues: {
          axis_size: 'value_large',
          axis_color: 'value_red',
        },
        sku: 'PROD-LRG-RED',
        barcode: '123456789012',
        price: 49.99,
        cost: 25.00,
        compareAtPrice: 59.99,
        stockQuantity: 100,
        lowStockThreshold: 10,
        weight: 1.5,
        dimensions: {
          length: 10,
          width: 8,
          height: 4,
          unit: 'inches',
        },
        isActive: true,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-variants', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.create(input);

      expect(result.id).toBe('variant_123');
      expect(result.productId).toBe('product_123');
      expect(result.sku).toBe('PROD-LRG-RED');
      expect(result.axisValues.axis_size).toBe('value_large');
      expect(result.axisValues.axis_color).toBe('value_red');
      expect(result.price).toBe(49.99);
      expect(result.stockQuantity).toBe(100);
    });

    it('should create a minimal product variant', async () => {
      const input = {
        productId: 'product_456',
        axisValues: {
          axis_size: 'value_small',
        },
        isActive: true,
        isDefault: true,
      };

      const mockResponse: ProductVariant = {
        id: 'variant_456',
        productId: 'product_456',
        axisValues: {
          axis_size: 'value_small',
        },
        isActive: true,
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-variants', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.create(input);

      expect(result.id).toBe('variant_456');
      expect(result.isDefault).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a product variant by ID', async () => {
      const mockResponse: ProductVariant = {
        id: 'variant_123',
        productId: 'product_123',
        axisValues: {
          axis_color: 'value_blue',
        },
        sku: 'PROD-BLU',
        price: 39.99,
        stockQuantity: 50,
        isActive: true,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-variants/variant_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.get('variant_123');

      expect(result.id).toBe('variant_123');
      expect(result.sku).toBe('PROD-BLU');
    });

    it('should throw API error when variant not found', async () => {
      nock(BASE_URL)
        .get('/product-variants/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product variant not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productVariants.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByProduct', () => {
    it('should retrieve product variants by parent product ID', async () => {
      const mockVariants: ProductVariant[] = [
        {
          id: 'variant_1',
          productId: 'product_123',
          axisValues: { axis_size: 'value_small' },
          sku: 'PROD-SM',
          price: 29.99,
          isActive: true,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_2',
          productId: 'product_123',
          axisValues: { axis_size: 'value_medium' },
          sku: 'PROD-MD',
          price: 34.99,
          isActive: true,
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_3',
          productId: 'product_123',
          axisValues: { axis_size: 'value_large' },
          sku: 'PROD-LG',
          price: 39.99,
          isActive: true,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductVariant> = {
        data: mockVariants,
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
        .get('/product-variants/by-product/product_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.getByProduct('product_123');

      expect(result.data).toHaveLength(3);
      expect(result.data.every(v => v.productId === 'product_123')).toBe(true);
    });

    it('should retrieve variants by product with pagination', async () => {
      const mockResponse: PaginatedResultType<ProductVariant> = {
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
        .get('/product-variants/by-product/product_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.getByProduct('product_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getBySku', () => {
    it('should retrieve a product variant by SKU', async () => {
      const mockResponse: ProductVariant = {
        id: 'variant_123',
        productId: 'product_123',
        axisValues: { axis_color: 'value_green' },
        sku: 'PROD-GRN-001',
        price: 44.99,
        isActive: true,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-variants/by-sku/PROD-GRN-001')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.getBySku('PROD-GRN-001');

      expect(result).not.toBeNull();
      expect(result?.sku).toBe('PROD-GRN-001');
    });

    it('should return null when SKU not found', async () => {
      nock(BASE_URL)
        .get('/product-variants/by-sku/INVALID-SKU')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.getBySku('INVALID-SKU');

      expect(result).toBeNull();
    });
  });

  describe('getDefault', () => {
    it('should retrieve the default variant for a product', async () => {
      const mockResponse: ProductVariant = {
        id: 'variant_default',
        productId: 'product_123',
        axisValues: { axis_size: 'value_medium' },
        sku: 'PROD-MD-DEF',
        price: 34.99,
        isActive: true,
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-variants/default/product_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.getDefault('product_123');

      expect(result).not.toBeNull();
      expect(result?.isDefault).toBe(true);
    });

    it('should return null when no default variant is set', async () => {
      nock(BASE_URL)
        .get('/product-variants/default/product_no_default')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.getDefault('product_no_default');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a product variant', async () => {
      const updateData = {
        id: 'variant_123',
        price: 54.99,
        stockQuantity: 75,
        isActive: true,
      };

      const mockResponse: ProductVariant = {
        id: 'variant_123',
        productId: 'product_123',
        axisValues: { axis_size: 'value_large' },
        sku: 'PROD-LG',
        price: 54.99,
        stockQuantity: 75,
        isActive: true,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-variants/variant_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.update('variant_123', updateData);

      expect(result.price).toBe(54.99);
      expect(result.stockQuantity).toBe(75);
    });

    it('should update variant dimensions', async () => {
      const updateData = {
        id: 'variant_123',
        dimensions: {
          length: 12,
          width: 10,
          height: 5,
          unit: 'cm' as const,
        },
      };

      const mockResponse: ProductVariant = {
        id: 'variant_123',
        productId: 'product_123',
        axisValues: { axis_size: 'value_large' },
        dimensions: {
          length: 12,
          width: 10,
          height: 5,
          unit: 'cm',
        },
        isActive: true,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-variants/variant_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.update('variant_123', updateData);

      expect(result.dimensions?.length).toBe(12);
      expect(result.dimensions?.unit).toBe('cm');
    });
  });

  describe('delete', () => {
    it('should delete a product variant', async () => {
      nock(BASE_URL)
        .delete('/product-variants/variant_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.delete('variant_123');
      expect(result).toBe(true);
    });

    it('should throw API error when variant not found', async () => {
      nock(BASE_URL)
        .delete('/product-variants/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product variant not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productVariants.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list product variants with pagination', async () => {
      const mockVariants: ProductVariant[] = [
        {
          id: 'variant_1',
          productId: 'product_1',
          axisValues: { axis_color: 'value_red' },
          sku: 'V1-RED',
          price: 29.99,
          isActive: true,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_2',
          productId: 'product_2',
          axisValues: { axis_color: 'value_blue' },
          sku: 'V2-BLU',
          price: 34.99,
          isActive: true,
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductVariant> = {
        data: mockVariants,
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
        .get('/product-variants')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list variants with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ProductVariant> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 15,
          totalCount: 45,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-variants')
        .query({ page: '3', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.list({
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(15);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple product variants in batch', async () => {
      const batchData = [
        {
          productId: 'product_123',
          axisValues: { axis_size: 'value_small' },
          sku: 'PROD-SM',
          price: 29.99,
          isActive: true,
          isDefault: false,
        },
        {
          productId: 'product_123',
          axisValues: { axis_size: 'value_medium' },
          sku: 'PROD-MD',
          price: 34.99,
          isActive: true,
          isDefault: true,
        },
        {
          productId: 'product_123',
          axisValues: { axis_size: 'value_large' },
          sku: 'PROD-LG',
          price: 39.99,
          isActive: true,
          isDefault: false,
        },
      ];

      const mockVariants: ProductVariant[] = [
        {
          id: 'variant_1',
          productId: 'product_123',
          axisValues: { axis_size: 'value_small' },
          sku: 'PROD-SM',
          price: 29.99,
          isActive: true,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_2',
          productId: 'product_123',
          axisValues: { axis_size: 'value_medium' },
          sku: 'PROD-MD',
          price: 34.99,
          isActive: true,
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_3',
          productId: 'product_123',
          axisValues: { axis_size: 'value_large' },
          sku: 'PROD-LG',
          price: 39.99,
          isActive: true,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductVariant> = {
        data: mockVariants,
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
        .post('/product-variants/batch', batchData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariants.createBatch(batchData);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].sku).toBe('PROD-SM');
      expect(result.data[1].sku).toBe('PROD-MD');
      expect(result.data[2].sku).toBe('PROD-LG');
    });

    it('should throw validation error when batch size exceeds limit', async () => {
      const oversizedBatch = Array.from({ length: 101 }, (_, i) => ({
        productId: 'product_123',
        axisValues: { axis_size: `value_${i}` },
        isActive: true,
        isDefault: false,
      }));

      await expect(
        client.productVariants.createBatch(oversizedBatch)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
