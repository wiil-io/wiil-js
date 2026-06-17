/**
 * @fileoverview Tests for Service Time Offs resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ServiceProviderTimeOff, PaginatedResultType, ServiceProviderTimeOffType, ServiceProviderTimeOffStatus } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ServiceTimeOffsResource', () => {
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
    it('should create a specific (one-time) time off', async () => {
      const startDate = Date.now();
      const endDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

      const input = {
        providerId: 'person_123',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate,
        endDate,
        reason: 'Annual vacation',
      };

      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_123',
        providerId: 'person_123',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate,
        endDate,
        reason: 'Annual vacation',
        status: ServiceProviderTimeOffStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-time-offs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.create(input);

      expect(result.id).toBe('to_123');
      expect(result.providerId).toBe('person_123');
      expect(result.type).toBe(ServiceProviderTimeOffType.SPECIFIC);
      expect(result.reason).toBe('Annual vacation');
      expect(result.status).toBe(ServiceProviderTimeOffStatus.PENDING);
    });

    it('should create a recurring time off', async () => {
      const startDate = Date.now();
      const endDate = Date.now() + 2 * 60 * 60 * 1000;

      const input = {
        providerId: 'person_456',
        type: ServiceProviderTimeOffType.RECURRING,
        startDate,
        endDate,
        recurrence: { dayOfWeek: ['1', '2', '3', '4', '5'] },
        reason: 'Daily lunch break',
      };

      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_456',
        providerId: 'person_456',
        type: ServiceProviderTimeOffType.RECURRING,
        startDate,
        endDate,
        recurrence: { dayOfWeek: ['1', '2', '3', '4', '5'] },
        reason: 'Daily lunch break',
        status: ServiceProviderTimeOffStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-time-offs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.create(input);

      expect(result.type).toBe(ServiceProviderTimeOffType.RECURRING);
      expect(result.recurrence).toBeDefined();
      expect(result.recurrence!.dayOfWeek).toHaveLength(5);
    });

    it('should create time off without reason', async () => {
      const startDate = Date.now();
      const endDate = Date.now() + 24 * 60 * 60 * 1000;

      const input = {
        providerId: 'person_789',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate,
        endDate,
      };

      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_789',
        providerId: 'person_789',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate,
        endDate,
        status: ServiceProviderTimeOffStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-time-offs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.create(input);

      expect(result.reason).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should retrieve a time off record by ID', async () => {
      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_123',
        providerId: 'person_123',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate: Date.now(),
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        reason: 'Vacation',
        status: ServiceProviderTimeOffStatus.APPROVED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/service-time-offs/to_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.get('to_123');

      expect(result.id).toBe('to_123');
      expect(result.status).toBe(ServiceProviderTimeOffStatus.APPROVED);
    });

    it('should throw API error when time off not found', async () => {
      nock(BASE_URL)
        .get('/service-time-offs/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Time off record not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceTimeOffs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByProvider', () => {
    it('should retrieve time off records by provider ID', async () => {
      const mockTimeOffs: ServiceProviderTimeOff[] = [
        {
          id: 'to_1',
          providerId: 'person_123',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: Date.now(),
          endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
          reason: 'Vacation',
          status: ServiceProviderTimeOffStatus.APPROVED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'to_2',
          providerId: 'person_123',
          type: ServiceProviderTimeOffType.RECURRING,
          startDate: Date.now(),
          endDate: Date.now() + 60 * 60 * 1000,
          recurrence: { dayOfWeek: ['1', '2', '3', '4', '5'] },
          reason: 'Lunch break',
          status: ServiceProviderTimeOffStatus.APPROVED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProviderTimeOff> = {
        data: mockTimeOffs,
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
        .get('/service-time-offs/by-provider/person_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.getByProvider('person_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(to => to.providerId === 'person_123')).toBe(true);
    });

    it('should get provider time offs with pagination', async () => {
      const mockResponse: PaginatedResultType<ServiceProviderTimeOff> = {
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
        .get('/service-time-offs/by-provider/person_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.getByProvider('person_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByDateRange', () => {
    it('should retrieve time off records within a date range', async () => {
      const startDate = Date.now();
      const endDate = Date.now() + 7 * 24 * 60 * 60 * 1000;

      const mockTimeOffs: ServiceProviderTimeOff[] = [
        {
          id: 'to_1',
          providerId: 'person_1',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: startDate + 1 * 24 * 60 * 60 * 1000,
          endDate: startDate + 3 * 24 * 60 * 60 * 1000,
          status: ServiceProviderTimeOffStatus.APPROVED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'to_2',
          providerId: 'person_2',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: startDate + 5 * 24 * 60 * 60 * 1000,
          endDate: startDate + 6 * 24 * 60 * 60 * 1000,
          status: ServiceProviderTimeOffStatus.PENDING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProviderTimeOff> = {
        data: mockTimeOffs,
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
        .get('/service-time-offs/by-date-range')
        .query({ startDate: startDate.toString(), endDate: endDate.toString() })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.getByDateRange(startDate, endDate);

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should get date range time offs with pagination', async () => {
      const startDate = Date.now();
      const endDate = Date.now() + 30 * 24 * 60 * 60 * 1000;

      const mockResponse: PaginatedResultType<ServiceProviderTimeOff> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 15,
          totalCount: 45,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/service-time-offs/by-date-range')
        .query({
          startDate: startDate.toString(),
          endDate: endDate.toString(),
          page: '1',
          pageSize: '15',
        })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.getByDateRange(startDate, endDate, {
        page: 1,
        pageSize: 15,
      });

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('update', () => {
    it('should update time off end date', async () => {
      const newEndDate = Date.now() + 14 * 24 * 60 * 60 * 1000;

      const input = {
        id: 'to_123',
        endDate: newEndDate,
      };

      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_123',
        providerId: 'person_123',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate: Date.now(),
        endDate: newEndDate,
        reason: 'Extended vacation',
        status: ServiceProviderTimeOffStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-time-offs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.update(input);

      expect(result.endDate).toBe(newEndDate);
    });

    it('should update time off reason', async () => {
      const input = {
        id: 'to_456',
        reason: 'Medical leave',
      };

      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_456',
        providerId: 'person_456',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate: Date.now(),
        endDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
        reason: 'Medical leave',
        status: ServiceProviderTimeOffStatus.APPROVED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-time-offs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.update(input);

      expect(result.reason).toBe('Medical leave');
    });
  });

  describe('approve', () => {
    it('should approve a pending time off request', async () => {
      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_123',
        providerId: 'person_123',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate: Date.now(),
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        reason: 'Vacation',
        status: ServiceProviderTimeOffStatus.APPROVED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-time-offs/to_123/approve', {})
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.approve('to_123');

      expect(result.status).toBe(ServiceProviderTimeOffStatus.APPROVED);
    });
  });

  describe('reject', () => {
    it('should reject a pending time off request with reason', async () => {
      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_123',
        providerId: 'person_123',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate: Date.now(),
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        reason: 'Vacation',
        status: ServiceProviderTimeOffStatus.REJECTED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-time-offs/to_123/reject', { reason: 'Schedule conflict' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.reject('to_123', 'Schedule conflict');

      expect(result.status).toBe(ServiceProviderTimeOffStatus.REJECTED);
    });

    it('should reject without providing a reason', async () => {
      const mockResponse: ServiceProviderTimeOff = {
        id: 'to_456',
        providerId: 'person_456',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate: Date.now(),
        endDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
        status: ServiceProviderTimeOffStatus.REJECTED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-time-offs/to_456/reject', { reason: undefined })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.reject('to_456');

      expect(result.status).toBe(ServiceProviderTimeOffStatus.REJECTED);
    });
  });

  describe('delete', () => {
    it('should delete a time off record', async () => {
      nock(BASE_URL)
        .delete('/service-time-offs/to_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.delete('to_123');
      expect(result).toBe(true);
    });

    it('should throw API error when time off not found', async () => {
      nock(BASE_URL)
        .delete('/service-time-offs/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Time off record not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceTimeOffs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list time off records with pagination', async () => {
      const mockTimeOffs: ServiceProviderTimeOff[] = [
        {
          id: 'to_1',
          providerId: 'person_1',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: Date.now(),
          endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
          status: ServiceProviderTimeOffStatus.APPROVED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'to_2',
          providerId: 'person_2',
          type: ServiceProviderTimeOffType.RECURRING,
          startDate: Date.now(),
          endDate: Date.now() + 60 * 60 * 1000,
          recurrence: { dayOfWeek: ['1', '3', '5'] },
          status: ServiceProviderTimeOffStatus.PENDING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProviderTimeOff> = {
        data: mockTimeOffs,
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
        .get('/service-time-offs')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list time offs with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ServiceProviderTimeOff> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 25,
          totalCount: 100,
          totalPages: 4,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/service-time-offs')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
    });
  });

  describe('createBatch', () => {
    it('should create multiple time off records in batch', async () => {
      const now = Date.now();
      const input = [
        {
          providerId: 'person_1',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: now,
          endDate: now + 7 * 24 * 60 * 60 * 1000,
          reason: 'Vacation',
        },
        {
          providerId: 'person_2',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: now,
          endDate: now + 3 * 24 * 60 * 60 * 1000,
          reason: 'Personal day',
        },
      ];

      const mockTimeOffs: ServiceProviderTimeOff[] = [
        {
          id: 'to_1',
          providerId: 'person_1',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: now,
          endDate: now + 7 * 24 * 60 * 60 * 1000,
          reason: 'Vacation',
          status: ServiceProviderTimeOffStatus.PENDING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'to_2',
          providerId: 'person_2',
          type: ServiceProviderTimeOffType.SPECIFIC,
          startDate: now,
          endDate: now + 3 * 24 * 60 * 60 * 1000,
          reason: 'Personal day',
          status: ServiceProviderTimeOffStatus.PENDING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProviderTimeOff> = {
        data: mockTimeOffs,
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
        .post('/service-time-offs/batch', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceTimeOffs.createBatch(input);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].reason).toBe('Vacation');
      expect(result.data[1].reason).toBe('Personal day');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const now = Date.now();
      const input = Array(51).fill({
        providerId: 'person_123',
        type: ServiceProviderTimeOffType.SPECIFIC,
        startDate: now,
        endDate: now + 24 * 60 * 60 * 1000,
      });

      await expect(
        client.serviceTimeOffs.createBatch(input)
      ).rejects.toThrow('Batch size exceeds maximum limit of 50');
    });
  });
});
