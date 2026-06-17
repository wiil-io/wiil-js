/**
 * @fileoverview Tests for Resource Instances resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../../client/WiilClient';
import {
  ResourceInstance,
  PaginatedResultType,
  ResourceInstanceStatus,
} from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ResourceInstancesResource', () => {
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
    it('should create a resource instance', async () => {
      const input = {
        locationId: 'loc_123',
        resourceId: 'res_456',
        name: 'Table 5',
        code: 'T5',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
      };

      const mockResponse: ResourceInstance = {
        id: 'ri_123',
        locationId: 'loc_123',
        resourceId: 'res_456',
        name: 'Table 5',
        code: 'T5',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/resource-instances', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.create(input);

      expect(result.id).toBe('ri_123');
      expect(result.name).toBe('Table 5');
      expect(result.code).toBe('T5');
      expect(result.status).toBe(ResourceInstanceStatus.AVAILABLE);
      expect(result.isAvailable).toBe(true);
    });

    it('should create a resource instance with attributes', async () => {
      const input = {
        resourceId: 'res_789',
        name: 'Room 101',
        code: 'R101',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
        attributes: [
          { key: 'floor', value: '1' },
          { key: 'view', value: 'ocean' },
          { key: 'bedType', value: 'king' },
        ],
      };

      const mockResponse: ResourceInstance = {
        id: 'ri_456',
        resourceId: 'res_789',
        name: 'Room 101',
        code: 'R101',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
        attributes: [
          { key: 'floor', value: '1' },
          { key: 'view', value: 'ocean' },
          { key: 'bedType', value: 'king' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/resource-instances', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.create(input);

      expect(result.id).toBe('ri_456');
      expect(result.attributes).toHaveLength(3);
      expect(result.attributes?.[0].key).toBe('floor');
      expect(result.attributes?.[1].value).toBe('ocean');
    });

    it('should create a resource instance in maintenance status', async () => {
      const input = {
        resourceId: 'res_101',
        name: 'Vehicle A1',
        code: 'VA1',
        status: ResourceInstanceStatus.MAINTENANCE,
        isAvailable: false,
      };

      const mockResponse: ResourceInstance = {
        id: 'ri_789',
        resourceId: 'res_101',
        name: 'Vehicle A1',
        code: 'VA1',
        status: ResourceInstanceStatus.MAINTENANCE,
        isAvailable: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/resource-instances', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.create(input);

      expect(result.status).toBe(ResourceInstanceStatus.MAINTENANCE);
      expect(result.isAvailable).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve a resource instance by ID', async () => {
      const mockResponse: ResourceInstance = {
        id: 'ri_123',
        resourceId: 'res_456',
        name: 'Table 10',
        code: 'T10',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/resource-instances/ri_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.get('ri_123');

      expect(result.id).toBe('ri_123');
      expect(result.name).toBe('Table 10');
      expect(result.code).toBe('T10');
    });

    it('should throw API error when instance not found', async () => {
      nock(BASE_URL)
        .get('/resource-instances/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Resource instance not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.resourceInstances.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByResource', () => {
    it('should retrieve instances by parent resource', async () => {
      const mockInstances: ResourceInstance[] = [
        {
          id: 'ri_1',
          resourceId: 'res_123',
          name: 'Table 1',
          code: 'T1',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ri_2',
          resourceId: 'res_123',
          name: 'Table 2',
          code: 'T2',
          status: ResourceInstanceStatus.RESERVED,
          isAvailable: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: mockInstances,
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
        .get('/resource-instances/by-resource/res_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.getByResource('res_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(i => i.resourceId === 'res_123')).toBe(true);
    });

    it('should retrieve instances by resource with pagination', async () => {
      const mockResponse: PaginatedResultType<ResourceInstance> = {
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
        .get('/resource-instances/by-resource/res_123')
        .query({ page: '2', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.getByResource('res_123', {
        page: 2,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByStatus', () => {
    it('should retrieve instances by operational status', async () => {
      const mockInstances: ResourceInstance[] = [
        {
          id: 'ri_1',
          resourceId: 'res_1',
          name: 'Table 1',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ri_2',
          resourceId: 'res_2',
          name: 'Table 2',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: mockInstances,
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
        .get('/resource-instances/by-status/available')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.getByStatus('available');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(i => i.status === ResourceInstanceStatus.AVAILABLE)).toBe(true);
    });

    it('should retrieve maintenance instances with pagination', async () => {
      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 10,
          totalCount: 5,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/resource-instances/by-status/maintenance')
        .query({ page: '1', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.getByStatus('maintenance', {
        page: 1,
        pageSize: 10,
      });

      expect(result.meta.totalCount).toBe(5);
    });
  });

  describe('getAvailable', () => {
    it('should retrieve available instances', async () => {
      const mockInstances: ResourceInstance[] = [
        {
          id: 'ri_1',
          resourceId: 'res_1',
          name: 'Available Room 1',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ri_2',
          resourceId: 'res_2',
          name: 'Available Room 2',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: mockInstances,
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
        .get('/resource-instances/available')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.getAvailable();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(i => i.isAvailable === true)).toBe(true);
    });

    it('should retrieve available instances with pagination', async () => {
      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 20,
          totalCount: 100,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/resource-instances/available')
        .query({ page: '3', pageSize: '20' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.getAvailable({ page: 3, pageSize: 20 });

      expect(result.meta.totalCount).toBe(100);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a resource instance', async () => {
      const updateData = {
        id: 'ri_123',
        name: 'Table 5 (Renovated)',
        code: 'T5R',
      };

      const mockResponse: ResourceInstance = {
        id: 'ri_123',
        resourceId: 'res_456',
        name: 'Table 5 (Renovated)',
        code: 'T5R',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/resource-instances/ri_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.update('ri_123', updateData);

      expect(result.name).toBe('Table 5 (Renovated)');
      expect(result.code).toBe('T5R');
    });

    it('should update instance attributes', async () => {
      const updateData = {
        id: 'ri_123',
        attributes: [
          { key: 'floor', value: '2' },
          { key: 'view', value: 'garden' },
        ],
      };

      const mockResponse: ResourceInstance = {
        id: 'ri_123',
        resourceId: 'res_456',
        name: 'Room 201',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
        attributes: [
          { key: 'floor', value: '2' },
          { key: 'view', value: 'garden' },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/resource-instances/ri_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.update('ri_123', updateData);

      expect(result.attributes?.[0].value).toBe('2');
      expect(result.attributes?.[1].value).toBe('garden');
    });
  });

  describe('updateStatus', () => {
    it('should update the operational status of an instance', async () => {
      const mockResponse: ResourceInstance = {
        id: 'ri_123',
        resourceId: 'res_456',
        name: 'Table 5',
        status: ResourceInstanceStatus.OCCUPIED,
        isAvailable: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/resource-instances/ri_123/status', { status: 'occupied' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.updateStatus('ri_123', 'occupied');

      expect(result.status).toBe(ResourceInstanceStatus.OCCUPIED);
      expect(result.isAvailable).toBe(false);
    });

    it('should put an instance into maintenance', async () => {
      const mockResponse: ResourceInstance = {
        id: 'ri_123',
        resourceId: 'res_456',
        name: 'Vehicle B2',
        status: ResourceInstanceStatus.MAINTENANCE,
        isAvailable: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/resource-instances/ri_123/status', { status: 'maintenance' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.updateStatus('ri_123', 'maintenance');

      expect(result.status).toBe(ResourceInstanceStatus.MAINTENANCE);
    });

    it('should put an instance back to available', async () => {
      const mockResponse: ResourceInstance = {
        id: 'ri_123',
        resourceId: 'res_456',
        name: 'Room 101',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/resource-instances/ri_123/status', { status: 'available' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.updateStatus('ri_123', 'available');

      expect(result.status).toBe(ResourceInstanceStatus.AVAILABLE);
      expect(result.isAvailable).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a resource instance', async () => {
      nock(BASE_URL)
        .delete('/resource-instances/ri_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.delete('ri_123');
      expect(result).toBe(true);
    });

    it('should throw API error when instance not found', async () => {
      nock(BASE_URL)
        .delete('/resource-instances/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Resource instance not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.resourceInstances.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list resource instances with pagination', async () => {
      const mockInstances: ResourceInstance[] = [
        {
          id: 'ri_1',
          resourceId: 'res_1',
          name: 'Instance 1',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ri_2',
          resourceId: 'res_2',
          name: 'Instance 2',
          status: ResourceInstanceStatus.RESERVED,
          isAvailable: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ri_3',
          resourceId: 'res_3',
          name: 'Instance 3',
          status: ResourceInstanceStatus.MAINTENANCE,
          isAvailable: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: mockInstances,
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
        .get('/resource-instances')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.list();

      expect(result.data).toHaveLength(3);
      expect(result.meta.totalCount).toBe(3);
    });

    it('should list resource instances with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: [],
        meta: {
          page: 5,
          pageSize: 50,
          totalCount: 250,
          totalPages: 5,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/resource-instances')
        .query({ page: '5', pageSize: '50' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.list({
        page: 5,
        pageSize: 50,
      });

      expect(result.meta.page).toBe(5);
      expect(result.meta.pageSize).toBe(50);
      expect(result.meta.totalCount).toBe(250);
    });
  });

  describe('createBatch', () => {
    it('should create multiple resource instances in batch', async () => {
      const input = [
        {
          resourceId: 'res_123',
          name: 'Table 1',
          code: 'T1',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
        },
        {
          resourceId: 'res_123',
          name: 'Table 2',
          code: 'T2',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
        },
        {
          resourceId: 'res_123',
          name: 'Table 3',
          code: 'T3',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
        },
      ];

      const mockInstances: ResourceInstance[] = [
        {
          id: 'ri_1',
          resourceId: 'res_123',
          name: 'Table 1',
          code: 'T1',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ri_2',
          resourceId: 'res_123',
          name: 'Table 2',
          code: 'T2',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ri_3',
          resourceId: 'res_123',
          name: 'Table 3',
          code: 'T3',
          status: ResourceInstanceStatus.AVAILABLE,
          isAvailable: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ResourceInstance> = {
        data: mockInstances,
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
        .post('/resource-instances/batch', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.resourceInstances.createBatch(input);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Table 1');
      expect(result.data[1].name).toBe('Table 2');
      expect(result.data[2].name).toBe('Table 3');
    });

    it('should throw validation error when batch size exceeds limit', async () => {
      const input = Array(101).fill({
        resourceId: 'res_123',
        name: 'Test Instance',
        status: ResourceInstanceStatus.AVAILABLE,
        isAvailable: true,
      });

      await expect(
        client.resourceInstances.createBatch(input)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
