/**
 * @fileoverview Tests for Menu Sets resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { MenuSet, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('MenuSetsResource', () => {
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
    it('should create a new menu set', async () => {
      const input = {
        name: 'Lunch Menu',
        description: 'Available Monday to Friday, 11am-3pm',
        code: 'LUNCH',
        isActive: true,
        effectiveFrom: Date.now(),
      };

      const mockResponse: MenuSet = {
        id: 'set_123',
        name: 'Lunch Menu',
        description: 'Available Monday to Friday, 11am-3pm',
        code: 'LUNCH',
        isActive: true,
        effectiveFrom: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-sets', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.create(input);

      expect(result.id).toBe('set_123');
      expect(result.name).toBe('Lunch Menu');
      expect(result.code).toBe('LUNCH');
      expect(result.isActive).toBe(true);
    });

    it('should create an inactive menu set with effective dates', async () => {
      const effectiveFrom = Date.now() + 86400000; // Tomorrow
      const effectiveTo = Date.now() + 604800000; // Next week

      const input = {
        name: 'Holiday Special',
        code: 'HOLIDAY',
        isActive: false,
        effectiveFrom,
        effectiveTo,
      };

      const mockResponse: MenuSet = {
        id: 'set_456',
        name: 'Holiday Special',
        code: 'HOLIDAY',
        isActive: false,
        effectiveFrom,
        effectiveTo,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-sets', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.create(input);

      expect(result.id).toBe('set_456');
      expect(result.isActive).toBe(false);
      expect(result.effectiveFrom).toBe(effectiveFrom);
      expect(result.effectiveTo).toBe(effectiveTo);
    });
  });

  describe('get', () => {
    it('should retrieve a menu set by ID', async () => {
      const mockResponse: MenuSet = {
        id: 'set_123',
        name: 'Dinner Menu',
        code: 'DINNER',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/menu-sets/set_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.get('set_123');

      expect(result.id).toBe('set_123');
      expect(result.name).toBe('Dinner Menu');
      expect(result.code).toBe('DINNER');
    });

    it('should throw API error when menu set not found', async () => {
      nock(BASE_URL)
        .get('/menu-sets/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Menu set not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.menuSets.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCode', () => {
    it('should retrieve a menu set by code', async () => {
      const mockResponse: MenuSet = {
        id: 'set_123',
        name: 'Breakfast Menu',
        code: 'BREAKFAST',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/menu-sets/code/BREAKFAST')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.getByCode('BREAKFAST');

      expect(result?.code).toBe('BREAKFAST');
      expect(result?.name).toBe('Breakfast Menu');
    });

    it('should return null when menu set not found by code', async () => {
      nock(BASE_URL)
        .get('/menu-sets/code/UNKNOWN')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.getByCode('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getActive', () => {
    it('should retrieve active menu sets', async () => {
      const mockSets: MenuSet[] = [
        {
          id: 'set_1',
          name: 'All Day Menu',
          code: 'ALLDAY',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_2',
          name: 'Happy Hour',
          code: 'HAPPYHOUR',
          isActive: true,
          effectiveFrom: Date.now() - 3600000,
          effectiveTo: Date.now() + 3600000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuSet> = {
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
        .get('/menu-sets/active')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.getActive();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].isActive).toBe(true);
      expect(result.data[1].isActive).toBe(true);
    });

    it('should retrieve active menu sets with pagination', async () => {
      const mockResponse: PaginatedResultType<MenuSet> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/menu-sets/active')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.getActive({ page: 2, pageSize: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.page).toBe(2);
    });
  });

  describe('update', () => {
    it('should update a menu set', async () => {
      const updateData = {
        id: 'set_123',
        name: 'Premium Lunch Menu',
        description: 'Updated premium lunch offerings',
      };

      const mockResponse: MenuSet = {
        id: 'set_123',
        name: 'Premium Lunch Menu',
        description: 'Updated premium lunch offerings',
        code: 'LUNCH',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-sets/set_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.update('set_123', updateData);

      expect(result.name).toBe('Premium Lunch Menu');
      expect(result.description).toBe('Updated premium lunch offerings');
    });

    it('should update isActive status', async () => {
      const updateData = {
        id: 'set_123',
        isActive: false,
      };

      const mockResponse: MenuSet = {
        id: 'set_123',
        name: 'Old Menu',
        code: 'OLD',
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-sets/set_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.update('set_123', updateData);

      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a menu set', async () => {
      nock(BASE_URL)
        .delete('/menu-sets/set_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.delete('set_123');
      expect(result).toBe(true);
    });

    it('should throw API error when menu set not found', async () => {
      nock(BASE_URL)
        .delete('/menu-sets/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Menu set not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.menuSets.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list menu sets with pagination', async () => {
      const mockSets: MenuSet[] = [
        {
          id: 'set_1',
          name: 'Breakfast',
          code: 'BRK',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_2',
          name: 'Lunch',
          code: 'LCH',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_3',
          name: 'Dinner',
          code: 'DNR',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuSet> = {
        data: mockSets,
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
        .get('/menu-sets')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.list();

      expect(result.data).toHaveLength(3);
      expect(result.meta.totalCount).toBe(3);
      expect(result.data[0].name).toBe('Breakfast');
      expect(result.data[1].name).toBe('Lunch');
      expect(result.data[2].name).toBe('Dinner');
    });

    it('should list with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<MenuSet> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 5,
          totalCount: 10,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/menu-sets')
        .query({ page: '2', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.list({
        page: 2,
        pageSize: 5,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(5);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple menu sets in batch', async () => {
      const inputData = [
        { name: 'Morning Menu', code: 'MORN', isActive: true },
        { name: 'Afternoon Menu', code: 'AFTN', isActive: true },
        { name: 'Evening Menu', code: 'EVN', isActive: false },
      ];

      const mockSets: MenuSet[] = [
        {
          id: 'set_1',
          name: 'Morning Menu',
          code: 'MORN',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_2',
          name: 'Afternoon Menu',
          code: 'AFTN',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'set_3',
          name: 'Evening Menu',
          code: 'EVN',
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuSet> = {
        data: mockSets,
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
        .post('/menu-sets/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuSets.createBatch(inputData);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Morning Menu');
      expect(result.data[1].name).toBe('Afternoon Menu');
      expect(result.data[2].name).toBe('Evening Menu');
      expect(result.data[2].isActive).toBe(false);
    });
  });
});
