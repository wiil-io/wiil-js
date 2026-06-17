/**
 * @fileoverview Tests for Resource Categories resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../../client/WiilClient';
import {
  ResourceCategory,
  PaginatedResultType,
  ResourceType,
} from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ResourceCategoriesResource', () => {
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
    it('should create a resource category', async () => {
      const input = {
        locationId: 'loc_123',
        name: 'Outdoor Tables',
        description: 'Patio and outdoor seating area',
        resourceType: ResourceType.TABLE,
        displayOrder: 1,
        isActive: true,
      };

      const mockResponse: ResourceCategory = {
        id: 'rc_123',
        locationId: 'loc_123',
        name: 'Outdoor Tables',
        description: 'Patio and outdoor seating area',
        resourceType: ResourceType.TABLE,
        displayOrder: 1,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/resource-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.create(input);

      expect(result.id).toBe('rc_123');
      expect(result.name).toBe('Outdoor Tables');
      expect(result.resourceType).toBe(ResourceType.TABLE);
      expect(result.displayOrder).toBe(1);
      expect(result.isActive).toBe(true);
    });

    it('should create a resource category with channel mappings', async () => {
      const input = {
        name: 'Deluxe Rooms',
        description: 'Premium room category',
        resourceType: ResourceType.ROOM,
        channelMappings: [
          { channelId: 'booking-com', externalCategoryId: 'bkng_deluxe_123' },
          { channelId: 'expedia', externalCategoryId: 'exp_premium_456' },
        ],
        isActive: true,
      };

      const mockResponse: ResourceCategory = {
        id: 'rc_456',
        name: 'Deluxe Rooms',
        description: 'Premium room category',
        resourceType: ResourceType.ROOM,
        channelMappings: [
          { channelId: 'booking-com', externalCategoryId: 'bkng_deluxe_123' },
          { channelId: 'expedia', externalCategoryId: 'exp_premium_456' },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/resource-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.create(input);

      expect(result.id).toBe('rc_456');
      expect(result.channelMappings).toHaveLength(2);
      expect(result.channelMappings?.[0].channelId).toBe('booking-com');
    });

    it('should create a resource category with metadata', async () => {
      const input = {
        name: 'Premium Rentals',
        resourceType: ResourceType.RENTALS,
        isActive: true,
        metadata: {
          tier: 'premium',
          requiresDeposit: true,
          minimumAge: 25,
        },
      };

      const mockResponse: ResourceCategory = {
        id: 'rc_789',
        name: 'Premium Rentals',
        resourceType: ResourceType.RENTALS,
        isActive: true,
        metadata: {
          tier: 'premium',
          requiresDeposit: true,
          minimumAge: 25,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/resource-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.create(input);

      expect(result.metadata?.tier).toBe('premium');
      expect(result.metadata?.requiresDeposit).toBe(true);
      expect(result.metadata?.minimumAge).toBe(25);
    });
  });

  describe('get', () => {
    it('should retrieve a resource category by ID', async () => {
      const mockResponse: ResourceCategory = {
        id: 'rc_123',
        name: 'VIP Tables',
        description: 'Reserved for VIP guests',
        resourceType: ResourceType.TABLE,
        displayOrder: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/resource-categories/rc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.get('rc_123');

      expect(result.id).toBe('rc_123');
      expect(result.name).toBe('VIP Tables');
    });

    it('should throw API error when category not found', async () => {
      nock(BASE_URL)
        .get('/resource-categories/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Resource category not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.resourceCategories.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByResourceType', () => {
    it('should retrieve categories by resource type', async () => {
      const mockCategories: ResourceCategory[] = [
        {
          id: 'rc_1',
          name: 'Standard Tables',
          resourceType: ResourceType.TABLE,
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rc_2',
          name: 'Premium Tables',
          resourceType: ResourceType.TABLE,
          displayOrder: 0,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceCategory> = {
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
        .get('/resource-categories/by-type/table')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.getByResourceType('table');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(c => c.resourceType === ResourceType.TABLE)).toBe(true);
    });

    it('should retrieve categories by resource type with pagination', async () => {
      const mockResponse: PaginatedResultType<ResourceCategory> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 15,
          totalCount: 25,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/resource-categories/by-type/room')
        .query({ page: '2', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.getByResourceType('room', {
        page: 2,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getActive', () => {
    it('should retrieve active categories', async () => {
      const mockCategories: ResourceCategory[] = [
        {
          id: 'rc_1',
          name: 'Active Category 1',
          resourceType: ResourceType.TABLE,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rc_2',
          name: 'Active Category 2',
          resourceType: ResourceType.ROOM,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceCategory> = {
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
        .get('/resource-categories/active')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.getActive();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(c => c.isActive === true)).toBe(true);
    });

    it('should retrieve active categories with pagination', async () => {
      const mockResponse: PaginatedResultType<ResourceCategory> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 10,
          totalCount: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/resource-categories/active')
        .query({ page: '1', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.getActive({ page: 1, pageSize: 10 });

      expect(result.meta.totalCount).toBe(50);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a resource category', async () => {
      const updateData = {
        id: 'rc_123',
        name: 'Premium Patio Tables',
        description: 'Updated description',
        displayOrder: 0,
      };

      const mockResponse: ResourceCategory = {
        id: 'rc_123',
        name: 'Premium Patio Tables',
        description: 'Updated description',
        resourceType: ResourceType.TABLE,
        displayOrder: 0,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/resource-categories/rc_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.update('rc_123', updateData);

      expect(result.name).toBe('Premium Patio Tables');
      expect(result.description).toBe('Updated description');
      expect(result.displayOrder).toBe(0);
    });

    it('should deactivate a resource category', async () => {
      const updateData = {
        id: 'rc_123',
        isActive: false,
      };

      const mockResponse: ResourceCategory = {
        id: 'rc_123',
        name: 'Outdoor Tables',
        resourceType: ResourceType.TABLE,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/resource-categories/rc_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.update('rc_123', updateData);

      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a resource category', async () => {
      nock(BASE_URL)
        .delete('/resource-categories/rc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.delete('rc_123');
      expect(result).toBe(true);
    });

    it('should throw API error when category not found', async () => {
      nock(BASE_URL)
        .delete('/resource-categories/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Resource category not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.resourceCategories.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list resource categories with pagination', async () => {
      const mockCategories: ResourceCategory[] = [
        {
          id: 'rc_1',
          name: 'Category 1',
          resourceType: ResourceType.TABLE,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rc_2',
          name: 'Category 2',
          resourceType: ResourceType.ROOM,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rc_3',
          name: 'Category 3',
          resourceType: ResourceType.RENTALS,
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceCategory> = {
        data: mockCategories,
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
        .get('/resource-categories')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.list();

      expect(result.data).toHaveLength(3);
      expect(result.meta.totalCount).toBe(3);
    });

    it('should list resource categories with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ResourceCategory> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 25,
          totalCount: 75,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/resource-categories')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple resource categories in batch', async () => {
      const input = [
        {
          name: 'Category A',
          resourceType: ResourceType.TABLE,
          isActive: true,
        },
        {
          name: 'Category B',
          resourceType: ResourceType.ROOM,
          isActive: true,
        },
      ];

      const mockCategories: ResourceCategory[] = [
        {
          id: 'rc_1',
          name: 'Category A',
          resourceType: ResourceType.TABLE,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rc_2',
          name: 'Category B',
          resourceType: ResourceType.ROOM,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceCategory> = {
        data: mockCategories,
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
        .post('/resource-categories/batch', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceCategories.createBatch(input);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Category A');
      expect(result.data[1].name).toBe('Category B');
    });

    it('should throw validation error when batch size exceeds limit', async () => {
      const input = Array(51).fill({
        name: 'Test Category',
        resourceType: ResourceType.TABLE,
        isActive: true,
      });

      await expect(
        client.resourceCategories.createBatch(input)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
