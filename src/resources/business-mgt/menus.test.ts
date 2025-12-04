/**
 * @fileoverview Tests for Menus resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { MenuCategory, BusinessMenuItem, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('MenusResource', () => {
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

  describe('Menu Categories', () => {
    describe('createCategory', () => {
      it('should create a new menu category', async () => {
        const input = {
          name: 'Appetizers',
          description: 'Delicious starters to begin your meal',
          displayOrder: 1,
        };

        const mockResponse: MenuCategory = {
          id: 'category_123',
          name: 'Appetizers',
          description: 'Delicious starters to begin your meal',
          displayOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/menu-management/categories', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.createCategory(input);

        expect(result.id).toBe('category_123');
        expect(result.name).toBe('Appetizers');
        expect(result.displayOrder).toBe(1);
      });

      it('should create a default category', async () => {
        const input = {
          name: 'Uncategorized',
        };

        const mockResponse: MenuCategory = {
          id: 'category_default',
          name: 'Uncategorized',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/menu-management/categories', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.createCategory(input);

        expect(result.name).toBe('Uncategorized');
      });
    });

    describe('getCategory', () => {
      it('should retrieve a menu category by ID', async () => {
        const mockResponse: MenuCategory = {
          id: 'category_123',
          name: 'Main Course',
          description: 'Our signature dishes',
          displayOrder: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/menu-management/categories/category_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.getCategory('category_123');

        expect(result.id).toBe('category_123');
        expect(result.name).toBe('Main Course');
        expect(result.displayOrder).toBe(2);
      });

      it('should throw API error when category not found', async () => {
        nock(BASE_URL)
          .get('/menu-management/categories/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Menu category not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.menus.getCategory('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });

    describe('listCategories', () => {
      it('should list menu categories with pagination', async () => {
        const mockCategories: MenuCategory[] = [
          {
            id: 'category_1',
            name: 'Appetizers',
            description: 'Starters',
            displayOrder: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'category_2',
            name: 'Main Course',
            description: 'Entrees',
            displayOrder: 2,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<MenuCategory> = {
          data: mockCategories,
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
          .get('/menu-management/categories')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.listCategories();

        expect(result.data).toHaveLength(2);
        expect(result.meta.totalCount).toBe(2);
        expect(result.data[0].displayOrder).toBe(1);
        expect(result.data[1].displayOrder).toBe(2);
      });

      it('should list categories with custom pagination parameters', async () => {
        const mockResponse: PaginatedResultType<MenuCategory> = {
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
          .get('/menu-management/categories')
          .query({ page: '2', pageSize: '10' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.listCategories({
          page: 2,
          pageSize: 10,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.pageSize).toBe(10);
        expect(result.meta.hasNextPage).toBe(true);
      });
    });

    describe('updateCategory', () => {
      it('should update a menu category', async () => {
        const updateData = {
          id: 'category_123',
          name: 'Updated Appetizers',
          description: 'New and improved starters',
        };

        const mockResponse: MenuCategory = {
          id: 'category_123',
          name: 'Updated Appetizers',
          description: 'New and improved starters',
          displayOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/menu-management/categories', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.updateCategory(updateData);

        expect(result.name).toBe('Updated Appetizers');
        expect(result.description).toBe('New and improved starters');
      });
    });

    describe('deleteCategory', () => {
      it('should delete a menu category', async () => {
        nock(BASE_URL)
          .delete('/menu-management/categories/category_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.deleteCategory('category_123');
        expect(result).toBe(true);
      });

      it('should throw API error when category not found', async () => {
        nock(BASE_URL)
          .delete('/menu-management/categories/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Menu category not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.menus.deleteCategory('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });
  });

  describe('Menu Items', () => {
    describe('createItem', () => {
      it('should create a new menu item', async () => {
        const input = {
          name: 'Cheeseburger',
          description: 'Angus beef with aged cheddar',
          price: 12.99,
          categoryId: 'category_main',
          ingredients: ['beef', 'cheese', 'lettuce', 'tomato', 'bun'],
          allergens: ['gluten', 'dairy'],
          nutritionalInfo: {
            calories: 650,
            protein: 35,
            carbs: 48,
            fat: 32,
          },
          isAvailable: true,
          preparationTime: 15,
          isActive: true,
          displayOrder: 1,
        };

        const mockResponse: BusinessMenuItem = {
          id: 'item_123',
          name: 'Cheeseburger',
          description: 'Angus beef with aged cheddar',
          price: 12.99,
          categoryId: 'category_main',
          ingredients: ['beef', 'cheese', 'lettuce', 'tomato', 'bun'],
          allergens: ['gluten', 'dairy'],
          nutritionalInfo: {
            calories: 650,
            protein: 35,
            carbs: 48,
            fat: 32,
          },
          isAvailable: true,
          preparationTime: 15,
          isActive: true,
          displayOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/menu-management/items', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.createItem(input);

        expect(result.id).toBe('item_123');
        expect(result.name).toBe('Cheeseburger');
        expect(result.price).toBe(12.99);
        expect(result.categoryId).toBe('category_main');
        expect(result.ingredients).toEqual(['beef', 'cheese', 'lettuce', 'tomato', 'bun']);
        expect(result.allergens).toEqual(['gluten', 'dairy']);
        expect(result.nutritionalInfo?.calories).toBe(650);
      });

      it('should create a menu item without category', async () => {
        const input = {
          name: 'Special Item',
          price: 9.99,
          isAvailable: true,
          isActive: true,
        };

        const mockResponse: BusinessMenuItem = {
          id: 'item_456',
          name: 'Special Item',
          price: 9.99,
          categoryId: 'category_default',
          isAvailable: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/menu-management/items', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.createItem(input);

        expect(result.id).toBe('item_456');
        expect(result.categoryId).toBe('category_default');
      });
    });

    describe('getItem', () => {
      it('should retrieve a menu item by ID', async () => {
        const mockResponse: BusinessMenuItem = {
          id: 'item_123',
          name: 'Caesar Salad',
          description: 'Fresh romaine with parmesan',
          price: 8.99,
          categoryId: 'category_appetizers',
          isAvailable: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/menu-management/items/item_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.getItem('item_123');

        expect(result.id).toBe('item_123');
        expect(result.name).toBe('Caesar Salad');
        expect(result.price).toBe(8.99);
      });

      it('should throw API error when item not found', async () => {
        nock(BASE_URL)
          .get('/menu-management/items/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Menu item not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.menus.getItem('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });

    describe('listItems', () => {
      it('should list menu items with pagination', async () => {
        const mockItems: BusinessMenuItem[] = [
          {
            id: 'item_1',
            name: 'Margherita Pizza',
            price: 14.99,
            categoryId: 'category_main',
            isAvailable: true,
            isActive: true,
            displayOrder: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'item_2',
            name: 'Pepperoni Pizza',
            price: 16.99,
            categoryId: 'category_main',
            isAvailable: true,
            isActive: true,
            displayOrder: 2,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<BusinessMenuItem> = {
          data: mockItems,
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
          .get('/menu-management/items')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.listItems();

        expect(result.data).toHaveLength(2);
        expect(result.meta.totalCount).toBe(2);
        expect(result.data[0].name).toBe('Margherita Pizza');
      });

      it('should list items with custom pagination parameters', async () => {
        const mockResponse: PaginatedResultType<BusinessMenuItem> = {
          data: [],
          meta: {
            page: 3,
            pageSize: 50,
            totalCount: 120,
            totalPages: 3,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        };

        nock(BASE_URL)
          .get('/menu-management/items')
          .query({ page: '3', pageSize: '50' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.listItems({
          page: 3,
          pageSize: 50,
        });

        expect(result.meta.page).toBe(3);
        expect(result.meta.pageSize).toBe(50);
        expect(result.meta.hasPreviousPage).toBe(true);
      });
    });

    describe('getItemsByCategory', () => {
      it('should retrieve menu items by category ID', async () => {
        const mockItems: BusinessMenuItem[] = [
          {
            id: 'item_1',
            name: 'Mozzarella Sticks',
            price: 6.99,
            categoryId: 'category_appetizers',
            isAvailable: true,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'item_2',
            name: 'Buffalo Wings',
            price: 9.99,
            categoryId: 'category_appetizers',
            isAvailable: true,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<BusinessMenuItem> = {
          data: mockItems,
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
          .get('/menu-management/items/by-category/category_appetizers')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.getItemsByCategory('category_appetizers');

        expect(result.data).toHaveLength(2);
        expect(result.data.every(item => item.categoryId === 'category_appetizers')).toBe(true);
      });

      it('should get items by category with pagination', async () => {
        const mockResponse: PaginatedResultType<BusinessMenuItem> = {
          data: [],
          meta: {
            page: 2,
            pageSize: 15,
            totalCount: 30,
            totalPages: 2,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        };

        nock(BASE_URL)
          .get('/menu-management/items/by-category/category_desserts')
          .query({ page: '2', pageSize: '15' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.getItemsByCategory('category_desserts', {
          page: 2,
          pageSize: 15,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.pageSize).toBe(15);
      });
    });

    describe('getPopularItems', () => {
      it('should retrieve popular menu items', async () => {
        const mockItems: BusinessMenuItem[] = [
          {
            id: 'item_popular1',
            name: 'House Special Burger',
            price: 15.99,
            categoryId: 'category_main',
            isAvailable: true,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'item_popular2',
            name: 'Signature Fries',
            price: 4.99,
            categoryId: 'category_sides',
            isAvailable: true,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<BusinessMenuItem> = {
          data: mockItems,
          meta: {
            page: 1,
            pageSize: 10,
            totalCount: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };

        nock(BASE_URL)
          .get('/menu-management/items/popular')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.getPopularItems();

        expect(result.data).toHaveLength(2);
        expect(result.data[0].name).toBe('House Special Burger');
      });

      it('should get popular items with pagination', async () => {
        const mockResponse: PaginatedResultType<BusinessMenuItem> = {
          data: [],
          meta: {
            page: 1,
            pageSize: 5,
            totalCount: 10,
            totalPages: 2,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        };

        nock(BASE_URL)
          .get('/menu-management/items/popular')
          .query({ page: '1', pageSize: '5' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.getPopularItems({
          page: 1,
          pageSize: 5,
        });

        expect(result.meta.pageSize).toBe(5);
        expect(result.meta.hasNextPage).toBe(true);
      });
    });

    describe('updateItem', () => {
      it('should update a menu item', async () => {
        const updateData = {
          id: 'item_123',
          name: 'Premium Cheeseburger',
          price: 14.99,
          isAvailable: false,
        };

        const mockResponse: BusinessMenuItem = {
          id: 'item_123',
          name: 'Premium Cheeseburger',
          description: 'Angus beef with aged cheddar',
          price: 14.99,
          categoryId: 'category_main',
          isAvailable: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/menu-management/items', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.updateItem(updateData);

        expect(result.name).toBe('Premium Cheeseburger');
        expect(result.price).toBe(14.99);
        expect(result.isAvailable).toBe(false);
      });

      it('should update item nutritional information', async () => {
        const updateData = {
          id: 'item_123',
          nutritionalInfo: {
            calories: 700,
            protein: 40,
            carbs: 50,
            fat: 35,
          },
        };

        const mockResponse: BusinessMenuItem = {
          id: 'item_123',
          name: 'Cheeseburger',
          price: 12.99,
          categoryId: 'category_main',
          nutritionalInfo: {
            calories: 700,
            protein: 40,
            carbs: 50,
            fat: 35,
          },
          isAvailable: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/menu-management/items', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.updateItem(updateData);

        expect(result.nutritionalInfo?.calories).toBe(700);
        expect(result.nutritionalInfo?.protein).toBe(40);
      });
    });

    describe('deleteItem', () => {
      it('should delete a menu item', async () => {
        nock(BASE_URL)
          .delete('/menu-management/items/item_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.menus.deleteItem('item_123');
        expect(result).toBe(true);
      });

      it('should throw API error when item not found', async () => {
        nock(BASE_URL)
          .delete('/menu-management/items/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Menu item not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.menus.deleteItem('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });
  });
});
