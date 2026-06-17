/**
 * @fileoverview Tests for Service Categories resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ServiceCategory, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ServiceCategoriesResource', () => {
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
    it('should create a service category with basic details', async () => {
      const input = {
        organizationId: 'org_123',
        name: 'Hair Services',
        description: 'All haircut and styling services',
        isActive: true,
      };

      const mockResponse: ServiceCategory = {
        id: 'cat_123',
        organizationId: 'org_123',
        name: 'Hair Services',
        description: 'All haircut and styling services',
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.create(input);

      expect(result.id).toBe('cat_123');
      expect(result.organizationId).toBe('org_123');
      expect(result.name).toBe('Hair Services');
      expect(result.description).toBe('All haircut and styling services');
      expect(result.isActive).toBe(true);
    });

    it('should create a service category with display order and image', async () => {
      const input = {
        organizationId: 'org_456',
        name: 'Spa Treatments',
        description: 'Relaxation and wellness services',
        imageUrl: 'https://example.com/spa.jpg',
        displayOrder: 2,
        isActive: true,
      };

      const mockResponse: ServiceCategory = {
        id: 'cat_456',
        organizationId: 'org_456',
        name: 'Spa Treatments',
        description: 'Relaxation and wellness services',
        imageUrl: 'https://example.com/spa.jpg',
        displayOrder: 2,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.create(input);

      expect(result.id).toBe('cat_456');
      expect(result.imageUrl).toBe('https://example.com/spa.jpg');
      expect(result.displayOrder).toBe(2);
    });

    it('should create a service category with channel mappings', async () => {
      const input = {
        organizationId: 'org_789',
        name: 'Consultations',
        channelMappings: [
          { channelId: 'yelp', externalCategoryId: 'yelp_cat_123' },
          { channelId: 'google', externalCategoryId: 'google_cat_456' },
        ],
        isActive: true,
      };

      const mockResponse: ServiceCategory = {
        id: 'cat_789',
        organizationId: 'org_789',
        name: 'Consultations',
        channelMappings: [
          { channelId: 'yelp', externalCategoryId: 'yelp_cat_123' },
          { channelId: 'google', externalCategoryId: 'google_cat_456' },
        ],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.create(input);

      expect(result.channelMappings).toHaveLength(2);
      expect(result.channelMappings![0].channelId).toBe('yelp');
      expect(result.channelMappings![1].channelId).toBe('google');
    });
  });

  describe('get', () => {
    it('should retrieve a service category by ID', async () => {
      const mockResponse: ServiceCategory = {
        id: 'cat_123',
        organizationId: 'org_123',
        name: 'Hair Services',
        description: 'Professional hair services',
        displayOrder: 1,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/service-categories/cat_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.get('cat_123');

      expect(result.id).toBe('cat_123');
      expect(result.name).toBe('Hair Services');
      expect(result.displayOrder).toBe(1);
    });

    it('should throw API error when category not found', async () => {
      nock(BASE_URL)
        .get('/service-categories/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service category not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceCategories.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('update', () => {
    it('should update a service category name', async () => {
      const input = {
        id: 'cat_123',
        name: 'Premium Hair Services',
      };

      const mockResponse: ServiceCategory = {
        id: 'cat_123',
        organizationId: 'org_123',
        name: 'Premium Hair Services',
        description: 'Professional hair services',
        displayOrder: 1,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.update(input);

      expect(result.id).toBe('cat_123');
      expect(result.name).toBe('Premium Hair Services');
    });

    it('should update display order and active status', async () => {
      const input = {
        id: 'cat_456',
        displayOrder: 5,
        isActive: false,
      };

      const mockResponse: ServiceCategory = {
        id: 'cat_456',
        organizationId: 'org_456',
        name: 'Spa Treatments',
        displayOrder: 5,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-categories', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.update(input);

      expect(result.displayOrder).toBe(5);
      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a service category', async () => {
      nock(BASE_URL)
        .delete('/service-categories/cat_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.delete('cat_123');
      expect(result).toBe(true);
    });

    it('should throw API error when category not found', async () => {
      nock(BASE_URL)
        .delete('/service-categories/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service category not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceCategories.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list service categories with pagination', async () => {
      const mockCategories: ServiceCategory[] = [
        {
          id: 'cat_1',
          organizationId: 'org_123',
          name: 'Hair Services',
          displayOrder: 1,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'cat_2',
          organizationId: 'org_123',
          name: 'Spa Treatments',
          displayOrder: 2,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceCategory> = {
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
        .get('/service-categories')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].name).toBe('Hair Services');
      expect(result.data[1].name).toBe('Spa Treatments');
    });

    it('should list categories with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ServiceCategory> = {
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
        .get('/service-categories')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.list({
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple service categories in batch', async () => {
      const input = [
        { organizationId: 'org_123', name: 'Hair Services', isActive: true },
        { organizationId: 'org_123', name: 'Spa Treatments', isActive: true },
        { organizationId: 'org_123', name: 'Nail Services', isActive: true },
      ];

      const mockCategories: ServiceCategory[] = [
        {
          id: 'cat_1',
          organizationId: 'org_123',
          name: 'Hair Services',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'cat_2',
          organizationId: 'org_123',
          name: 'Spa Treatments',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'cat_3',
          organizationId: 'org_123',
          name: 'Nail Services',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceCategory> = {
        data: mockCategories,
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
        .post('/service-categories/batch', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceCategories.createBatch(input);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Hair Services');
      expect(result.data[1].name).toBe('Spa Treatments');
      expect(result.data[2].name).toBe('Nail Services');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const input = Array(51).fill({
        organizationId: 'org_123',
        name: 'Category',
        isActive: true,
      });

      await expect(
        client.serviceCategories.createBatch(input)
      ).rejects.toThrow('Batch size exceeds maximum limit of 50');
    });
  });
});
