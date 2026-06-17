/**
 * @fileoverview Tests for Maintenance Blocks resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { MaintenanceBlock, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('MaintenanceBlocksResource', () => {
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
    it('should create a new maintenance block', async () => {
      const startDate = Date.now();
      const endDate = startDate + 86400000;

      const input = {
        locationId: 'loc_123',
        resourceInstanceId: 'ri_456',
        startDate,
        endDate,
        reason: 'Deep cleaning',
      };

      const mockResponse: MaintenanceBlock = {
        id: 'mb_123',
        locationId: 'loc_123',
        resourceInstanceId: 'ri_456',
        startDate,
        endDate,
        reason: 'Deep cleaning',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/maintenance-blocks', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.create(input);

      expect(result.id).toBe('mb_123');
      expect(result.resourceInstanceId).toBe('ri_456');
      expect(result.reason).toBe('Deep cleaning');
      expect(result.startDate).toBe(startDate);
      expect(result.endDate).toBe(endDate);
    });

    it('should create a maintenance block without optional fields', async () => {
      const startDate = Date.now() + 172800000;
      const endDate = startDate + 259200000;

      const input = {
        resourceInstanceId: 'ri_789',
        startDate,
        endDate,
      };

      const mockResponse: MaintenanceBlock = {
        id: 'mb_456',
        resourceInstanceId: 'ri_789',
        startDate,
        endDate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/maintenance-blocks', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.create(input);

      expect(result.id).toBe('mb_456');
      expect(result.resourceInstanceId).toBe('ri_789');
      expect(result.reason).toBeUndefined();
    });

    it('should create a maintenance block with long duration', async () => {
      const startDate = Date.now();
      const endDate = startDate + 604800000; // 7 days

      const input = {
        locationId: 'loc_hotel_001',
        resourceInstanceId: 'room_101',
        startDate,
        endDate,
        reason: 'Major renovation - bathroom remodel',
      };

      const mockResponse: MaintenanceBlock = {
        id: 'mb_renovation_001',
        locationId: 'loc_hotel_001',
        resourceInstanceId: 'room_101',
        startDate,
        endDate,
        reason: 'Major renovation - bathroom remodel',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/maintenance-blocks', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.create(input);

      expect(result.id).toBe('mb_renovation_001');
      expect(result.endDate - result.startDate).toBe(604800000);
    });
  });

  describe('get', () => {
    it('should retrieve a maintenance block by ID', async () => {
      const startDate = Date.now();
      const endDate = startDate + 86400000;

      const mockResponse: MaintenanceBlock = {
        id: 'mb_123',
        locationId: 'loc_123',
        resourceInstanceId: 'ri_456',
        startDate,
        endDate,
        reason: 'HVAC repair',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/maintenance-blocks/mb_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.get('mb_123');

      expect(result.id).toBe('mb_123');
      expect(result.reason).toBe('HVAC repair');
    });

    it('should throw API error when maintenance block not found', async () => {
      nock(BASE_URL)
        .get('/maintenance-blocks/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Maintenance block not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.maintenanceBlocks.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByResourceInstance', () => {
    it('should retrieve maintenance blocks by resource instance ID', async () => {
      const startDate1 = Date.now();
      const endDate1 = startDate1 + 86400000;
      const startDate2 = Date.now() + 604800000;
      const endDate2 = startDate2 + 172800000;

      const mockBlocks: MaintenanceBlock[] = [
        {
          id: 'mb_1',
          resourceInstanceId: 'ri_123',
          startDate: startDate1,
          endDate: endDate1,
          reason: 'Cleaning',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'mb_2',
          resourceInstanceId: 'ri_123',
          startDate: startDate2,
          endDate: endDate2,
          reason: 'Scheduled maintenance',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: mockBlocks,
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
        .get('/maintenance-blocks/by-resource-instance/ri_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.getByResourceInstance('ri_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(mb => mb.resourceInstanceId === 'ri_123')).toBe(true);
    });

    it('should get maintenance blocks by resource instance with pagination', async () => {
      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
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
        .get('/maintenance-blocks/by-resource-instance/ri_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.getByResourceInstance('ri_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByLocation', () => {
    it('should retrieve maintenance blocks by location ID', async () => {
      const startDate = Date.now();
      const endDate = startDate + 86400000;

      const mockBlocks: MaintenanceBlock[] = [
        {
          id: 'mb_1',
          locationId: 'loc_123',
          resourceInstanceId: 'ri_1',
          startDate,
          endDate,
          reason: 'Floor refinishing',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'mb_2',
          locationId: 'loc_123',
          resourceInstanceId: 'ri_2',
          startDate: startDate + 3600000,
          endDate: endDate + 3600000,
          reason: 'Plumbing work',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: mockBlocks,
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
        .get('/maintenance-blocks/by-location/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.getByLocation('loc_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(mb => mb.locationId === 'loc_123')).toBe(true);
    });

    it('should get maintenance blocks by location with pagination', async () => {
      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 15,
          totalCount: 42,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/maintenance-blocks/by-location/loc_123')
        .query({ page: '3', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.getByLocation('loc_123', {
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('getByDateRange', () => {
    it('should retrieve maintenance blocks by date range', async () => {
      const rangeStart = Date.now();
      const rangeEnd = rangeStart + 604800000; // 7 days
      const blockStart = rangeStart + 86400000;
      const blockEnd = blockStart + 172800000;

      const mockBlocks: MaintenanceBlock[] = [
        {
          id: 'mb_1',
          resourceInstanceId: 'ri_1',
          startDate: blockStart,
          endDate: blockEnd,
          reason: 'Scheduled maintenance',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'mb_2',
          resourceInstanceId: 'ri_2',
          startDate: blockStart + 86400000,
          endDate: blockEnd + 86400000,
          reason: 'Repairs',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: mockBlocks,
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
        .get('/maintenance-blocks/by-date-range')
        .query({ startDate: rangeStart.toString(), endDate: rangeEnd.toString() })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.getByDateRange(rangeStart, rangeEnd);

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should get maintenance blocks by date range with pagination', async () => {
      const rangeStart = Date.now();
      const rangeEnd = rangeStart + 2592000000; // 30 days

      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 20,
          totalCount: 35,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/maintenance-blocks/by-date-range')
        .query({
          startDate: rangeStart.toString(),
          endDate: rangeEnd.toString(),
          page: '2',
          pageSize: '20',
        })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.getByDateRange(rangeStart, rangeEnd, {
        page: 2,
        pageSize: 20,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a maintenance block', async () => {
      const startDate = Date.now();
      const endDate = startDate + 259200000; // 3 days

      const updateData = {
        id: 'mb_123',
        endDate,
        reason: 'Extended maintenance - parts delayed',
      };

      const mockResponse: MaintenanceBlock = {
        id: 'mb_123',
        resourceInstanceId: 'ri_456',
        startDate,
        endDate,
        reason: 'Extended maintenance - parts delayed',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/maintenance-blocks', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.update(updateData);

      expect(result.endDate).toBe(endDate);
      expect(result.reason).toBe('Extended maintenance - parts delayed');
    });

    it('should update maintenance block start date', async () => {
      const newStartDate = Date.now() + 86400000;
      const endDate = newStartDate + 172800000;

      const updateData = {
        id: 'mb_123',
        startDate: newStartDate,
      };

      const mockResponse: MaintenanceBlock = {
        id: 'mb_123',
        resourceInstanceId: 'ri_456',
        startDate: newStartDate,
        endDate,
        reason: 'Postponed maintenance',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/maintenance-blocks', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.update(updateData);

      expect(result.startDate).toBe(newStartDate);
    });
  });

  describe('delete', () => {
    it('should delete a maintenance block', async () => {
      nock(BASE_URL)
        .delete('/maintenance-blocks/mb_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.delete('mb_123');
      expect(result).toBe(true);
    });

    it('should throw API error when maintenance block not found', async () => {
      nock(BASE_URL)
        .delete('/maintenance-blocks/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Maintenance block not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.maintenanceBlocks.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list maintenance blocks with pagination', async () => {
      const startDate1 = Date.now();
      const endDate1 = startDate1 + 86400000;
      const startDate2 = Date.now() + 172800000;
      const endDate2 = startDate2 + 86400000;

      const mockBlocks: MaintenanceBlock[] = [
        {
          id: 'mb_1',
          resourceInstanceId: 'ri_1',
          startDate: startDate1,
          endDate: endDate1,
          reason: 'Cleaning',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'mb_2',
          resourceInstanceId: 'ri_2',
          startDate: startDate2,
          endDate: endDate2,
          reason: 'Repairs',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: mockBlocks,
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
        .get('/maintenance-blocks')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list maintenance blocks with custom pagination', async () => {
      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: [],
        meta: {
          page: 5,
          pageSize: 25,
          totalCount: 120,
          totalPages: 5,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/maintenance-blocks')
        .query({ page: '5', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.list({
        page: 5,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(5);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple maintenance blocks in batch', async () => {
      const startDate1 = Date.now() + 86400000;
      const endDate1 = startDate1 + 172800000;
      const startDate2 = Date.now() + 604800000;
      const endDate2 = startDate2 + 86400000;

      const batchInput = [
        {
          resourceInstanceId: 'ri_1',
          startDate: startDate1,
          endDate: endDate1,
          reason: 'Deep cleaning',
        },
        {
          resourceInstanceId: 'ri_2',
          startDate: startDate2,
          endDate: endDate2,
          reason: 'Routine maintenance',
        },
      ];

      const mockBlocks: MaintenanceBlock[] = [
        {
          id: 'mb_1',
          resourceInstanceId: 'ri_1',
          startDate: startDate1,
          endDate: endDate1,
          reason: 'Deep cleaning',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'mb_2',
          resourceInstanceId: 'ri_2',
          startDate: startDate2,
          endDate: endDate2,
          reason: 'Routine maintenance',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MaintenanceBlock> = {
        data: mockBlocks,
        meta: {
          page: 1,
          pageSize: 50,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/maintenance-blocks/batch', batchInput)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.maintenanceBlocks.createBatch(batchInput);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('mb_1');
      expect(result.data[1].id).toBe('mb_2');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const startDate = Date.now() + 86400000;
      const endDate = startDate + 86400000;

      const batchInput = Array.from({ length: 51 }, (_, i) => ({
        resourceInstanceId: `ri_${i}`,
        startDate,
        endDate,
        reason: `Maintenance ${i}`,
      }));

      await expect(
        client.maintenanceBlocks.createBatch(batchInput)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
