/**
 * @fileoverview Tests for Product Variant Axes resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { VariantAxis, PaginatedResultType, VariantAxisType } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProductVariantAxesResource', () => {
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
    it('should create a new variant axis with swatch type', async () => {
      const input = {
        name: 'Color',
        type: VariantAxisType.SWATCH,
        values: [
          { id: 'val_red', label: 'Red', swatchColor: '#FF0000', sortOrder: 1 },
          { id: 'val_blue', label: 'Blue', swatchColor: '#0000FF', sortOrder: 2 },
          { id: 'val_green', label: 'Green', swatchColor: '#00FF00', sortOrder: 3 },
        ],
        isActive: true,
      };

      const mockResponse: VariantAxis = {
        id: 'axis_color',
        name: 'Color',
        type: VariantAxisType.SWATCH,
        values: [
          { id: 'val_red', label: 'Red', swatchColor: '#FF0000', sortOrder: 1 },
          { id: 'val_blue', label: 'Blue', swatchColor: '#0000FF', sortOrder: 2 },
          { id: 'val_green', label: 'Green', swatchColor: '#00FF00', sortOrder: 3 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-variant-axes', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.create(input);

      expect(result.id).toBe('axis_color');
      expect(result.name).toBe('Color');
      expect(result.type).toBe(VariantAxisType.SWATCH);
      expect(result.values).toHaveLength(3);
      expect(result.values[0].swatchColor).toBe('#FF0000');
    });

    it('should create a variant axis with text type', async () => {
      const input = {
        name: 'Size',
        type: VariantAxisType.TEXT,
        values: [
          { id: 'val_xs', label: 'XS', sortOrder: 1 },
          { id: 'val_s', label: 'S', sortOrder: 2 },
          { id: 'val_m', label: 'M', sortOrder: 3 },
          { id: 'val_l', label: 'L', sortOrder: 4 },
          { id: 'val_xl', label: 'XL', sortOrder: 5 },
        ],
        isActive: true,
      };

      const mockResponse: VariantAxis = {
        id: 'axis_size',
        name: 'Size',
        type: VariantAxisType.TEXT,
        values: [
          { id: 'val_xs', label: 'XS', sortOrder: 1 },
          { id: 'val_s', label: 'S', sortOrder: 2 },
          { id: 'val_m', label: 'M', sortOrder: 3 },
          { id: 'val_l', label: 'L', sortOrder: 4 },
          { id: 'val_xl', label: 'XL', sortOrder: 5 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-variant-axes', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.create(input);

      expect(result.id).toBe('axis_size');
      expect(result.type).toBe(VariantAxisType.TEXT);
      expect(result.values).toHaveLength(5);
    });

    it('should create a variant axis with numeric type', async () => {
      const input = {
        name: 'Shoe Size',
        type: VariantAxisType.NUMERIC,
        values: [
          { id: 'val_7', label: '7', numericValue: 7, sortOrder: 1 },
          { id: 'val_8', label: '8', numericValue: 8, sortOrder: 2 },
          { id: 'val_9', label: '9', numericValue: 9, sortOrder: 3 },
          { id: 'val_10', label: '10', numericValue: 10, sortOrder: 4 },
        ],
        isActive: true,
      };

      const mockResponse: VariantAxis = {
        id: 'axis_shoe_size',
        name: 'Shoe Size',
        type: VariantAxisType.NUMERIC,
        values: [
          { id: 'val_7', label: '7', numericValue: 7, sortOrder: 1 },
          { id: 'val_8', label: '8', numericValue: 8, sortOrder: 2 },
          { id: 'val_9', label: '9', numericValue: 9, sortOrder: 3 },
          { id: 'val_10', label: '10', numericValue: 10, sortOrder: 4 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-variant-axes', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.create(input);

      expect(result.type).toBe(VariantAxisType.NUMERIC);
      expect(result.values[0].numericValue).toBe(7);
    });

    it('should create a variant axis with image type', async () => {
      const input = {
        name: 'Pattern',
        type: VariantAxisType.IMAGE,
        values: [
          { id: 'val_stripes', label: 'Stripes', imageId: 'img_stripes', sortOrder: 1 },
          { id: 'val_dots', label: 'Dots', imageId: 'img_dots', sortOrder: 2 },
          { id: 'val_solid', label: 'Solid', imageId: 'img_solid', sortOrder: 3 },
        ],
        isActive: true,
      };

      const mockResponse: VariantAxis = {
        id: 'axis_pattern',
        name: 'Pattern',
        type: VariantAxisType.IMAGE,
        values: [
          { id: 'val_stripes', label: 'Stripes', imageId: 'img_stripes', sortOrder: 1 },
          { id: 'val_dots', label: 'Dots', imageId: 'img_dots', sortOrder: 2 },
          { id: 'val_solid', label: 'Solid', imageId: 'img_solid', sortOrder: 3 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-variant-axes', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.create(input);

      expect(result.type).toBe(VariantAxisType.IMAGE);
      expect(result.values[0].imageId).toBe('img_stripes');
    });
  });

  describe('get', () => {
    it('should retrieve a variant axis by ID', async () => {
      const mockResponse: VariantAxis = {
        id: 'axis_123',
        name: 'Material',
        type: VariantAxisType.TEXT,
        values: [
          { id: 'val_cotton', label: 'Cotton', sortOrder: 1 },
          { id: 'val_polyester', label: 'Polyester', sortOrder: 2 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-variant-axes/axis_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.get('axis_123');

      expect(result.id).toBe('axis_123');
      expect(result.name).toBe('Material');
    });

    it('should throw API error when variant axis not found', async () => {
      nock(BASE_URL)
        .get('/product-variant-axes/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Variant axis not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productVariantAxes.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByName', () => {
    it('should retrieve a variant axis by name', async () => {
      const mockResponse: VariantAxis = {
        id: 'axis_color',
        name: 'Color',
        type: VariantAxisType.SWATCH,
        values: [
          { id: 'val_red', label: 'Red', swatchColor: '#FF0000', sortOrder: 1 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-variant-axes/by-name/Color')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.getByName('Color');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Color');
    });

    it('should return null when name not found', async () => {
      nock(BASE_URL)
        .get('/product-variant-axes/by-name/NonExistent')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.getByName('NonExistent');

      expect(result).toBeNull();
    });

    it('should handle URL encoding for names with special characters', async () => {
      const mockResponse: VariantAxis = {
        id: 'axis_special',
        name: 'Size/Weight',
        type: VariantAxisType.TEXT,
        values: [
          { id: 'val_1', label: 'Small', sortOrder: 1 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-variant-axes/by-name/Size%2FWeight')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.getByName('Size/Weight');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Size/Weight');
    });
  });

  describe('update', () => {
    it('should update a variant axis', async () => {
      const updateData = {
        id: 'axis_color',
        name: 'Updated Color',
        isActive: false,
      };

      const mockResponse: VariantAxis = {
        id: 'axis_color',
        name: 'Updated Color',
        type: VariantAxisType.SWATCH,
        values: [
          { id: 'val_red', label: 'Red', swatchColor: '#FF0000', sortOrder: 1 },
        ],
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-variant-axes/axis_color', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.update('axis_color', updateData);

      expect(result.name).toBe('Updated Color');
      expect(result.isActive).toBe(false);
    });

    it('should update axis values', async () => {
      const updateData = {
        id: 'axis_color',
        values: [
          { id: 'val_red', label: 'Crimson Red', swatchColor: '#DC143C', sortOrder: 1 },
          { id: 'val_blue', label: 'Navy Blue', swatchColor: '#000080', sortOrder: 2 },
          { id: 'val_yellow', label: 'Yellow', swatchColor: '#FFFF00', sortOrder: 3 },
        ],
      };

      const mockResponse: VariantAxis = {
        id: 'axis_color',
        name: 'Color',
        type: VariantAxisType.SWATCH,
        values: [
          { id: 'val_red', label: 'Crimson Red', swatchColor: '#DC143C', sortOrder: 1 },
          { id: 'val_blue', label: 'Navy Blue', swatchColor: '#000080', sortOrder: 2 },
          { id: 'val_yellow', label: 'Yellow', swatchColor: '#FFFF00', sortOrder: 3 },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-variant-axes/axis_color', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.update('axis_color', updateData);

      expect(result.values).toHaveLength(3);
      expect(result.values[0].label).toBe('Crimson Red');
      expect(result.values[2].label).toBe('Yellow');
    });
  });

  describe('delete', () => {
    it('should delete a variant axis', async () => {
      nock(BASE_URL)
        .delete('/product-variant-axes/axis_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.delete('axis_123');
      expect(result).toBe(true);
    });

    it('should throw API error when variant axis not found', async () => {
      nock(BASE_URL)
        .delete('/product-variant-axes/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Variant axis not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productVariantAxes.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list variant axes with pagination', async () => {
      const mockAxes: VariantAxis[] = [
        {
          id: 'axis_color',
          name: 'Color',
          type: VariantAxisType.SWATCH,
          values: [{ id: 'val_red', label: 'Red', swatchColor: '#FF0000', sortOrder: 1 }],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'axis_size',
          name: 'Size',
          type: VariantAxisType.TEXT,
          values: [{ id: 'val_s', label: 'S', sortOrder: 1 }],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<VariantAxis> = {
        data: mockAxes,
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
        .get('/product-variant-axes')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list axes with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<VariantAxis> = {
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
        .get('/product-variant-axes')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.list({
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple variant axes in batch', async () => {
      const batchData = [
        {
          name: 'Color',
          type: VariantAxisType.SWATCH,
          values: [
            { id: 'val_red', label: 'Red', swatchColor: '#FF0000', sortOrder: 1 },
            { id: 'val_blue', label: 'Blue', swatchColor: '#0000FF', sortOrder: 2 },
          ],
          isActive: true,
        },
        {
          name: 'Size',
          type: VariantAxisType.TEXT,
          values: [
            { id: 'val_s', label: 'S', sortOrder: 1 },
            { id: 'val_m', label: 'M', sortOrder: 2 },
            { id: 'val_l', label: 'L', sortOrder: 3 },
          ],
          isActive: true,
        },
      ];

      const mockAxes: VariantAxis[] = [
        {
          id: 'axis_color',
          name: 'Color',
          type: VariantAxisType.SWATCH,
          values: [
            { id: 'val_red', label: 'Red', swatchColor: '#FF0000', sortOrder: 1 },
            { id: 'val_blue', label: 'Blue', swatchColor: '#0000FF', sortOrder: 2 },
          ],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'axis_size',
          name: 'Size',
          type: VariantAxisType.TEXT,
          values: [
            { id: 'val_s', label: 'S', sortOrder: 1 },
            { id: 'val_m', label: 'M', sortOrder: 2 },
            { id: 'val_l', label: 'L', sortOrder: 3 },
          ],
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<VariantAxis> = {
        data: mockAxes,
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
        .post('/product-variant-axes/batch', batchData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productVariantAxes.createBatch(batchData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Color');
      expect(result.data[1].name).toBe('Size');
    });

    it('should throw validation error when batch size exceeds limit', async () => {
      const oversizedBatch = Array.from({ length: 51 }, (_, i) => ({
        name: `Axis ${i}`,
        type: VariantAxisType.TEXT,
        values: [{ id: `val_${i}`, label: `Value ${i}`, sortOrder: 1 }],
        isActive: true,
      }));

      await expect(
        client.productVariantAxes.createBatch(oversizedBatch)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
