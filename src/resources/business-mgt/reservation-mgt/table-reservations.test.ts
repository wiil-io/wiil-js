/**
 * @fileoverview Tests for Table Reservations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { TableReservation, PaginatedResultType, ReservationStatus } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('TableReservationsResource', () => {
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
    it('should create a new table reservation', async () => {
      const input = {
        locationId: 'loc_123',
        resourceId: 'table_456',
        customerId: 'cust_789',
        personsNumber: 4,
        time: Date.now() + 86400000,
        duration: 90,
        status: ReservationStatus.PENDING,
        isVip: false,
        notes: 'Anniversary dinner',
        specialRequests: 'Window seat preferred',
      };

      const mockResponse: TableReservation = {
        id: 'tres_123',
        locationId: 'loc_123',
        resourceId: 'table_456',
        customerId: 'cust_789',
        personsNumber: 4,
        time: input.time,
        duration: 90,
        status: ReservationStatus.PENDING,
        isVip: false,
        notes: 'Anniversary dinner',
        specialRequests: 'Window seat preferred',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-reservations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.create(input);

      expect(result.id).toBe('tres_123');
      expect(result.resourceId).toBe('table_456');
      expect(result.customerId).toBe('cust_789');
      expect(result.personsNumber).toBe(4);
      expect(result.status).toBe(ReservationStatus.PENDING);
    });

    it('should create a VIP table reservation with floor plan', async () => {
      const input = {
        locationId: 'loc_123',
        channelId: 'channel_001',
        resourceId: 'table_vip_01',
        customerId: 'cust_vip_001',
        floorPlanId: 'fp_123',
        floorPlanSectionId: 'sec_main',
        personsNumber: 6,
        time: Date.now() + 172800000,
        duration: 120,
        status: ReservationStatus.CONFIRMED,
        source: 'web',
        isVip: true,
        specialRequests: 'Champagne on arrival',
        externalRef: {
          externalId: 'ext_123',
          source: 'opentable',
        },
      };

      const mockResponse: TableReservation = {
        id: 'tres_vip_001',
        locationId: 'loc_123',
        channelId: 'channel_001',
        resourceId: 'table_vip_01',
        customerId: 'cust_vip_001',
        floorPlanId: 'fp_123',
        floorPlanSectionId: 'sec_main',
        personsNumber: 6,
        time: input.time,
        duration: 120,
        status: ReservationStatus.CONFIRMED,
        source: 'web',
        isVip: true,
        specialRequests: 'Champagne on arrival',
        externalRef: {
          externalId: 'ext_123',
          source: 'opentable',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-reservations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.create(input);

      expect(result.id).toBe('tres_vip_001');
      expect(result.isVip).toBe(true);
      expect(result.floorPlanId).toBe('fp_123');
      expect(result.floorPlanSectionId).toBe('sec_main');
      expect(result.externalRef?.source).toBe('opentable');
    });
  });

  describe('get', () => {
    it('should retrieve a table reservation by ID', async () => {
      const mockResponse: TableReservation = {
        id: 'tres_123',
        locationId: 'loc_123',
        resourceId: 'table_456',
        customerId: 'cust_789',
        personsNumber: 2,
        time: Date.now() + 3600000,
        duration: 60,
        status: ReservationStatus.CONFIRMED,
        isVip: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/table-reservations/tres_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.get('tres_123');

      expect(result.id).toBe('tres_123');
      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(result.personsNumber).toBe(2);
    });

    it('should throw API error when table reservation not found', async () => {
      nock(BASE_URL)
        .get('/table-reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Table reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.tableReservations.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve table reservations by customer ID', async () => {
      const mockReservations: TableReservation[] = [
        {
          id: 'tres_1',
          resourceId: 'table_1',
          customerId: 'cust_123',
          personsNumber: 2,
          time: Date.now() + 3600000,
          duration: 60,
          status: ReservationStatus.CONFIRMED,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'tres_2',
          resourceId: 'table_2',
          customerId: 'cust_123',
          personsNumber: 4,
          time: Date.now() + 86400000,
          duration: 90,
          status: ReservationStatus.PENDING,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableReservation> = {
        data: mockReservations,
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
        .get('/table-reservations/by-customer/cust_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.getByCustomer('cust_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.customerId === 'cust_123')).toBe(true);
    });

    it('should get reservations by customer with pagination', async () => {
      const mockResponse: PaginatedResultType<TableReservation> = {
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
        .get('/table-reservations/by-customer/cust_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.getByCustomer('cust_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByResource', () => {
    it('should retrieve table reservations by resource ID', async () => {
      const mockReservations: TableReservation[] = [
        {
          id: 'tres_1',
          resourceId: 'table_456',
          customerId: 'cust_1',
          personsNumber: 4,
          time: Date.now() + 3600000,
          duration: 90,
          status: ReservationStatus.CONFIRMED,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableReservation> = {
        data: mockReservations,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/table-reservations/by-resource/table_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.getByResource('table_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].resourceId).toBe('table_456');
    });
  });

  describe('getByDateRange', () => {
    it('should retrieve table reservations by date range', async () => {
      const startTime = Date.now();
      const endTime = Date.now() + 86400000 * 7;

      const mockReservations: TableReservation[] = [
        {
          id: 'tres_1',
          resourceId: 'table_1',
          customerId: 'cust_1',
          personsNumber: 2,
          time: Date.now() + 86400000,
          duration: 60,
          status: ReservationStatus.PENDING,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'tres_2',
          resourceId: 'table_2',
          customerId: 'cust_2',
          personsNumber: 6,
          time: Date.now() + 172800000,
          duration: 120,
          status: ReservationStatus.CONFIRMED,
          isVip: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableReservation> = {
        data: mockReservations,
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
        .get('/table-reservations/by-date-range')
        .query({ startTime: startTime.toString(), endTime: endTime.toString() })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.getByDateRange(startTime, endTime);

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should get reservations by date range with pagination', async () => {
      const startTime = Date.now();
      const endTime = Date.now() + 86400000 * 30;

      const mockResponse: PaginatedResultType<TableReservation> = {
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
        .get('/table-reservations/by-date-range')
        .query({
          startTime: startTime.toString(),
          endTime: endTime.toString(),
          page: '3',
          pageSize: '15',
        })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.getByDateRange(startTime, endTime, {
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('update', () => {
    it('should update a table reservation', async () => {
      const updateData = {
        id: 'tres_123',
        personsNumber: 6,
        duration: 120,
        notes: 'Updated party size',
      };

      const mockResponse: TableReservation = {
        id: 'tres_123',
        resourceId: 'table_456',
        customerId: 'cust_789',
        personsNumber: 6,
        time: Date.now() + 86400000,
        duration: 120,
        status: ReservationStatus.CONFIRMED,
        notes: 'Updated party size',
        isVip: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/table-reservations/tres_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.update('tres_123', updateData);

      expect(result.personsNumber).toBe(6);
      expect(result.duration).toBe(120);
      expect(result.notes).toBe('Updated party size');
    });

    it('should update reservation status', async () => {
      const updateData = {
        id: 'tres_123',
        status: ReservationStatus.SEATED,
      };

      const mockResponse: TableReservation = {
        id: 'tres_123',
        resourceId: 'table_456',
        customerId: 'cust_789',
        personsNumber: 4,
        time: Date.now(),
        duration: 90,
        status: ReservationStatus.SEATED,
        isVip: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/table-reservations/tres_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.update('tres_123', updateData);

      expect(result.status).toBe(ReservationStatus.SEATED);
    });
  });

  describe('cancel', () => {
    it('should cancel a table reservation', async () => {
      const mockResponse: TableReservation = {
        id: 'tres_123',
        resourceId: 'table_456',
        customerId: 'cust_789',
        personsNumber: 4,
        time: Date.now() + 86400000,
        duration: 90,
        status: ReservationStatus.CANCELLED,
        isVip: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-reservations/tres_123/cancel', { reason: 'Customer requested cancellation' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.cancel('tres_123', 'Customer requested cancellation');

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should cancel a table reservation without reason', async () => {
      const mockResponse: TableReservation = {
        id: 'tres_456',
        resourceId: 'table_789',
        customerId: 'cust_001',
        personsNumber: 2,
        time: Date.now() + 86400000,
        duration: 60,
        status: ReservationStatus.CANCELLED,
        isVip: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-reservations/tres_456/cancel', { reason: undefined })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.cancel('tres_456');

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  describe('delete', () => {
    it('should delete a table reservation', async () => {
      nock(BASE_URL)
        .delete('/table-reservations/tres_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.delete('tres_123');
      expect(result).toBe(true);
    });

    it('should throw API error when table reservation not found', async () => {
      nock(BASE_URL)
        .delete('/table-reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Table reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.tableReservations.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list table reservations with pagination', async () => {
      const mockReservations: TableReservation[] = [
        {
          id: 'tres_1',
          resourceId: 'table_1',
          customerId: 'cust_1',
          personsNumber: 2,
          time: Date.now() + 3600000,
          duration: 60,
          status: ReservationStatus.PENDING,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'tres_2',
          resourceId: 'table_2',
          customerId: 'cust_2',
          personsNumber: 4,
          time: Date.now() + 7200000,
          duration: 90,
          status: ReservationStatus.CONFIRMED,
          isVip: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableReservation> = {
        data: mockReservations,
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
        .get('/table-reservations')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list table reservations with custom pagination', async () => {
      const mockResponse: PaginatedResultType<TableReservation> = {
        data: [],
        meta: {
          page: 5,
          pageSize: 25,
          totalCount: 125,
          totalPages: 5,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/table-reservations')
        .query({ page: '5', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.list({
        page: 5,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(5);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple table reservations in batch', async () => {
      const batchInput = [
        {
          resourceId: 'table_1',
          customerId: 'cust_1',
          personsNumber: 2,
          time: Date.now() + 86400000,
          duration: 60,
          status: ReservationStatus.PENDING,
          isVip: false,
        },
        {
          resourceId: 'table_2',
          customerId: 'cust_2',
          personsNumber: 4,
          time: Date.now() + 172800000,
          duration: 90,
          status: ReservationStatus.PENDING,
          isVip: false,
        },
      ];

      const mockReservations: TableReservation[] = [
        {
          id: 'tres_1',
          resourceId: 'table_1',
          customerId: 'cust_1',
          personsNumber: 2,
          time: batchInput[0].time,
          duration: 60,
          status: ReservationStatus.PENDING,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'tres_2',
          resourceId: 'table_2',
          customerId: 'cust_2',
          personsNumber: 4,
          time: batchInput[1].time,
          duration: 90,
          status: ReservationStatus.PENDING,
          isVip: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableReservation> = {
        data: mockReservations,
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
        .post('/table-reservations/batch', batchInput)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableReservations.createBatch(batchInput);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('tres_1');
      expect(result.data[1].id).toBe('tres_2');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const batchInput = Array.from({ length: 51 }, (_, i) => ({
        resourceId: `table_${i}`,
        customerId: `cust_${i}`,
        personsNumber: 2,
        time: Date.now() + 86400000,
        duration: 60,
        status: ReservationStatus.PENDING,
        isVip: false,
      }));

      await expect(
        client.tableReservations.createBatch(batchInput)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
