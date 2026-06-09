/**
 * @fileoverview Tests for Menu Item Variants resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { MenuItemVariant, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('MenuItemVariantsResource', () => {
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
    it('should create a new menu item variant', async () => {
      const input = {
        menuItemId: 'item_123',
        name: 'Large',
        sku: 'COFFEE-LG',
        price: 5.99,
        isDefault: false,
        sortOrder: 2,
      };

      const mockResponse: MenuItemVariant = {
        id: 'variant_123',
        menuItemId: 'item_123',
        name: 'Large',
        sku: 'COFFEE-LG',
        price: 5.99,
        isDefault: false,
        sortOrder: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-item-variants', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.create(input);

      expect(result.id).toBe('variant_123');
      expect(result.name).toBe('Large');
      expect(result.price).toBe(5.99);
      expect(result.isDefault).toBe(false);
    });

    it('should create a default variant', async () => {
      const input = {
        menuItemId: 'item_456',
        name: 'Regular',
        sku: 'COFFEE-REG',
        price: 3.99,
        isDefault: true,
        sortOrder: 1,
      };

      const mockResponse: MenuItemVariant = {
        id: 'variant_456',
        menuItemId: 'item_456',
        name: 'Regular',
        sku: 'COFFEE-REG',
        price: 3.99,
        isDefault: true,
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-item-variants', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.create(input);

      expect(result.id).toBe('variant_456');
      expect(result.isDefault).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a menu item variant by ID', async () => {
      const mockResponse: MenuItemVariant = {
        id: 'variant_123',
        menuItemId: 'item_123',
        name: 'Medium',
        sku: 'COFFEE-MD',
        price: 4.49,
        isDefault: false,
        sortOrder: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/menu-item-variants/variant_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.get('variant_123');

      expect(result.id).toBe('variant_123');
      expect(result.name).toBe('Medium');
      expect(result.price).toBe(4.49);
    });

    it('should throw API error when variant not found', async () => {
      nock(BASE_URL)
        .get('/menu-item-variants/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Menu item variant not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.menuItemVariants.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByMenuItem', () => {
    it('should retrieve variants by menu item ID', async () => {
      const mockVariants: MenuItemVariant[] = [
        {
          id: 'variant_1',
          menuItemId: 'item_123',
          name: 'Small',
          sku: 'COFFEE-SM',
          price: 2.99,
          isDefault: false,
          sortOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_2',
          menuItemId: 'item_123',
          name: 'Large',
          sku: 'COFFEE-LG',
          price: 4.99,
          isDefault: false,
          sortOrder: 3,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuItemVariant> = {
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
        .get('/menu-item-variants/by-menu-item/item_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.getByMenuItem('item_123');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Small');
      expect(result.data[1].name).toBe('Large');
    });

    it('should retrieve variants with pagination parameters', async () => {
      const mockResponse: PaginatedResultType<MenuItemVariant> = {
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
        .get('/menu-item-variants/by-menu-item/item_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.getByMenuItem('item_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getDefault', () => {
    it('should retrieve the default variant for a menu item', async () => {
      const mockResponse: MenuItemVariant = {
        id: 'variant_default',
        menuItemId: 'item_123',
        name: 'Regular',
        sku: 'COFFEE-REG',
        price: 3.49,
        isDefault: true,
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/menu-item-variants/default/item_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.getDefault('item_123');

      expect(result?.isDefault).toBe(true);
      expect(result?.name).toBe('Regular');
    });

    it('should return null when no default variant exists', async () => {
      nock(BASE_URL)
        .get('/menu-item-variants/default/item_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.getDefault('item_123');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a menu item variant', async () => {
      const updateData = {
        id: 'variant_123',
        name: 'Extra Large',
        price: 6.99,
      };

      const mockResponse: MenuItemVariant = {
        id: 'variant_123',
        menuItemId: 'item_123',
        name: 'Extra Large',
        sku: 'COFFEE-XL',
        price: 6.99,
        isDefault: false,
        sortOrder: 4,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-item-variants/variant_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.update('variant_123', updateData);

      expect(result.name).toBe('Extra Large');
      expect(result.price).toBe(6.99);
    });

    it('should update isDefault status', async () => {
      const updateData = {
        id: 'variant_123',
        isDefault: true,
      };

      const mockResponse: MenuItemVariant = {
        id: 'variant_123',
        menuItemId: 'item_123',
        name: 'Large',
        sku: 'COFFEE-LG',
        price: 5.99,
        isDefault: true,
        sortOrder: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-item-variants/variant_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.update('variant_123', updateData);

      expect(result.isDefault).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a menu item variant', async () => {
      nock(BASE_URL)
        .delete('/menu-item-variants/variant_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.delete('variant_123');
      expect(result).toBe(true);
    });

    it('should throw API error when variant not found', async () => {
      nock(BASE_URL)
        .delete('/menu-item-variants/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Menu item variant not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.menuItemVariants.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list menu item variants with pagination', async () => {
      const mockVariants: MenuItemVariant[] = [
        {
          id: 'variant_1',
          menuItemId: 'item_1',
          name: 'Small',
          sku: 'ITEM-SM',
          price: 2.99,
          isDefault: false,
          sortOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_2',
          menuItemId: 'item_2',
          name: 'Regular',
          sku: 'ITEM-REG',
          price: 3.99,
          isDefault: true,
          sortOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuItemVariant> = {
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
        .get('/menu-item-variants')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<MenuItemVariant> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 5,
          totalCount: 50,
          totalPages: 10,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/menu-item-variants')
        .query({ page: '3', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.list({
        page: 3,
        pageSize: 5,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(5);
      expect(result.meta.totalPages).toBe(10);
    });
  });

  describe('createBatch', () => {
    it('should create multiple menu item variants in batch', async () => {
      const inputData = [
        { menuItemId: 'item_1', name: 'Small', sku: 'SKU-SM', price: 2.99, isDefault: false, sortOrder: 1 },
        { menuItemId: 'item_1', name: 'Medium', sku: 'SKU-MD', price: 3.99, isDefault: true, sortOrder: 2 },
        { menuItemId: 'item_1', name: 'Large', sku: 'SKU-LG', price: 4.99, isDefault: false, sortOrder: 3 },
      ];

      const mockVariants: MenuItemVariant[] = [
        {
          id: 'variant_1',
          menuItemId: 'item_1',
          name: 'Small',
          sku: 'SKU-SM',
          price: 2.99,
          isDefault: false,
          sortOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_2',
          menuItemId: 'item_1',
          name: 'Medium',
          sku: 'SKU-MD',
          price: 3.99,
          isDefault: true,
          sortOrder: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'variant_3',
          menuItemId: 'item_1',
          name: 'Large',
          sku: 'SKU-LG',
          price: 4.99,
          isDefault: false,
          sortOrder: 3,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuItemVariant> = {
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
        .post('/menu-item-variants/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuItemVariants.createBatch(inputData);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Small');
      expect(result.data[1].name).toBe('Medium');
      expect(result.data[2].name).toBe('Large');
    });
  });
});
