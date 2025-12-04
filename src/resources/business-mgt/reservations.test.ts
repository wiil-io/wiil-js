/**
 * @fileoverview Tests for Reservations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { Reservation, ReservationSettings, PaginatedResultType, ResourceType, AppointmentStatus, ReservationSettingType, ResourceReservationDurationUnit } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ReservationsResource', () => {
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
    it('should create a TABLE reservation', async () => {
      const input = {
        reservationType: ResourceType.TABLE,
        resourceId: 'resource_table5',
        customerId: 'cust_123',
        startTime: Date.now(),
        endTime: Date.now() + 2 * 60 * 60 * 1000,
        duration: 2,
        personsNumber: 4,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        notes: 'Window table preferred',
        isResourceReservation: true,
      };

      const mockResponse: Reservation = {
        id: 'reservation_123',
        reservationType: ResourceType.TABLE,
        resourceId: 'resource_table5',
        customerId: 'cust_123',
        startTime: Date.now(),
        endTime: Date.now() + 2 * 60 * 60 * 1000,
        duration: 2,
        personsNumber: 4,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        notes: 'Window table preferred',
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.create(input);

      expect(result.id).toBe('reservation_123');
      expect(result.reservationType).toBe(ResourceType.TABLE);
      expect(result.personsNumber).toBe(4);
      expect(result.notes).toBe('Window table preferred');
    });

    it('should create a ROOM reservation with deposit', async () => {
      const input = {
        reservationType: ResourceType.ROOM,
        resourceId: 'resource_room101',
        customerId: 'cust_456',
        startTime: Date.now(),
        endTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
        duration: 3,
        personsNumber: 2,
        totalPrice: 899.97,
        depositPaid: 299.99,
        status: AppointmentStatus.CONFIRMED,
        notes: 'Early check-in requested',
        isResourceReservation: true,
      };

      const mockResponse: Reservation = {
        id: 'reservation_456',
        reservationType: ResourceType.ROOM,
        resourceId: 'resource_room101',
        customerId: 'cust_456',
        startTime: Date.now(),
        endTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
        duration: 3,
        personsNumber: 2,
        totalPrice: 899.97,
        depositPaid: 299.99,
        status: AppointmentStatus.CONFIRMED,
        notes: 'Early check-in requested',
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.create(input);

      expect(result.id).toBe('reservation_456');
      expect(result.reservationType).toBe(ResourceType.ROOM);
      expect(result.totalPrice).toBe(899.97);
      expect(result.depositPaid).toBe(299.99);
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should create a RENTAL reservation', async () => {
      const input = {
        reservationType: ResourceType.RENTALS,
        resourceId: 'resource_confroom',
        customerId: 'cust_789',
        startTime: Date.now(),
        endTime: Date.now() + 4 * 60 * 60 * 1000,
        duration: 4,
        personsNumber: 10,
        totalPrice: 200.00,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        isResourceReservation: true,
      };

      const mockResponse: Reservation = {
        id: 'reservation_789',
        reservationType: ResourceType.RENTALS,
        resourceId: 'resource_confroom',
        customerId: 'cust_789',
        startTime: Date.now(),
        endTime: Date.now() + 4 * 60 * 60 * 1000,
        duration: 4,
        personsNumber: 10,
        totalPrice: 200.00,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.create(input);

      expect(result.reservationType).toBe(ResourceType.RENTALS);
      expect(result.duration).toBe(4);
      expect(result.totalPrice).toBe(200.00);
    });

    it('should create a general availability reservation without resource', async () => {
      const input = {
        reservationType: ResourceType.TABLE,
        customerId: 'cust_999',
        startTime: Date.now(),
        duration: 1,
        personsNumber: 2,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        isResourceReservation: false,
      };

      const mockResponse: Reservation = {
        id: 'reservation_general',
        reservationType: ResourceType.TABLE,
        customerId: 'cust_999',
        startTime: Date.now(),
        duration: 1,
        personsNumber: 2,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        isResourceReservation: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.create(input);

      expect(result.isResourceReservation).toBe(false);
      expect(result.resourceId).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should retrieve a reservation by ID', async () => {
      const mockResponse: Reservation = {
        id: 'reservation_123',
        reservationType: ResourceType.TABLE,
        resourceId: 'resource_table5',
        customerId: 'cust_123',
        startTime: Date.now(),
        endTime: Date.now() + 2 * 60 * 60 * 1000,
        duration: 2,
        personsNumber: 4,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/reservations/reservation_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.get('reservation_123');

      expect(result.id).toBe('reservation_123');
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
      expect(result.personsNumber).toBe(4);
    });

    it('should throw API error when reservation not found', async () => {
      nock(BASE_URL)
        .get('/reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.reservations.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve reservations by customer ID', async () => {
      const mockReservations: Reservation[] = [
        {
          id: 'reservation_1',
          reservationType: ResourceType.TABLE,
          customerId: 'cust_123',
          startTime: Date.now(),
          duration: 2,
          personsNumber: 4,
          totalPrice: 0,
          depositPaid: 0,
          status: AppointmentStatus.COMPLETED,
          isResourceReservation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'reservation_2',
          reservationType: ResourceType.ROOM,
          customerId: 'cust_123',
          startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
          duration: 2,
          personsNumber: 2,
          totalPrice: 599.98,
          depositPaid: 200.00,
          status: AppointmentStatus.CONFIRMED,
          isResourceReservation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Reservation> = {
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
        .get('/reservations/by-customer/cust_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.getByCustomer('cust_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.customerId === 'cust_123')).toBe(true);
      expect(result.data[0].status).toBe(AppointmentStatus.COMPLETED);
      expect(result.data[1].status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should get customer reservations with pagination', async () => {
      const mockResponse: PaginatedResultType<Reservation> = {
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
        .get('/reservations/by-customer/cust_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.getByCustomer('cust_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByResource', () => {
    it('should retrieve reservations by resource ID', async () => {
      const mockReservations: Reservation[] = [
        {
          id: 'reservation_1',
          reservationType: ResourceType.TABLE,
          resourceId: 'resource_table5',
          customerId: 'cust_1',
          startTime: Date.now(),
          duration: 2,
          personsNumber: 4,
          totalPrice: 0,
          depositPaid: 0,
          status: AppointmentStatus.CONFIRMED,
          isResourceReservation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'reservation_2',
          reservationType: ResourceType.TABLE,
          resourceId: 'resource_table5',
          customerId: 'cust_2',
          startTime: Date.now() + 3 * 60 * 60 * 1000,
          duration: 2,
          personsNumber: 2,
          totalPrice: 0,
          depositPaid: 0,
          status: AppointmentStatus.PENDING,
          isResourceReservation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Reservation> = {
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
        .get('/reservations/by-resource/resource_table5')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.getByResource('resource_table5');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.resourceId === 'resource_table5')).toBe(true);
    });

    it('should get resource reservations with pagination', async () => {
      const mockResponse: PaginatedResultType<Reservation> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 15,
          totalCount: 50,
          totalPages: 4,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/reservations/by-resource/resource_room101')
        .query({ page: '1', pageSize: '15' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.getByResource('resource_room101', {
        page: 1,
        pageSize: 15,
      });

      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a reservation', async () => {
      const updateData = {
        id: 'reservation_123',
        personsNumber: 6,
        notes: 'Updated party size',
      };

      const mockResponse: Reservation = {
        id: 'reservation_123',
        reservationType: ResourceType.TABLE,
        resourceId: 'resource_table5',
        customerId: 'cust_123',
        startTime: Date.now(),
        duration: 2,
        personsNumber: 6,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        notes: 'Updated party size',
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservations', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.update(updateData);

      expect(result.personsNumber).toBe(6);
      expect(result.notes).toBe('Updated party size');
    });
  });

  describe('updateStatus', () => {
    it('should update reservation status', async () => {
      const mockResponse: Reservation = {
        id: 'reservation_123',
        reservationType: ResourceType.TABLE,
        customerId: 'cust_123',
        startTime: Date.now(),
        duration: 2,
        personsNumber: 4,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.COMPLETED,
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservations/reservation_123/status', { status: AppointmentStatus.COMPLETED })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.updateStatus('reservation_123', { status: AppointmentStatus.COMPLETED });

      expect(result.status).toBe(AppointmentStatus.COMPLETED);
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation with reason', async () => {
      const mockResponse: Reservation = {
        id: 'reservation_123',
        reservationType: ResourceType.TABLE,
        customerId: 'cust_123',
        startTime: Date.now(),
        duration: 2,
        personsNumber: 4,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.CANCELLED,
        cancelReason: 'Customer requested cancellation',
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations/reservation_123/cancel', { reason: 'Customer requested cancellation' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.cancel('reservation_123', { reason: 'Customer requested cancellation' });

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(result.cancelReason).toBe('Customer requested cancellation');
    });

    it('should cancel a reservation without reason', async () => {
      const mockResponse: Reservation = {
        id: 'reservation_456',
        reservationType: ResourceType.ROOM,
        customerId: 'cust_456',
        startTime: Date.now(),
        duration: 1,
        personsNumber: 2,
        totalPrice: 299.99,
        depositPaid: 299.99,
        status: AppointmentStatus.CANCELLED,
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations/reservation_456/cancel', {})
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.cancel('reservation_456', {});

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });
  });

  describe('reschedule', () => {
    it('should reschedule a reservation with new time', async () => {
      const newStartTime = Date.now() + 24 * 60 * 60 * 1000;
      const newEndTime = newStartTime + 2 * 60 * 60 * 1000;

      const mockResponse: Reservation = {
        id: 'reservation_123',
        reservationType: ResourceType.TABLE,
        resourceId: 'resource_table5',
        customerId: 'cust_123',
        startTime: newStartTime,
        endTime: newEndTime,
        duration: 2,
        personsNumber: 4,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations/reservation_123/reschedule', {
          startTime: newStartTime.toString(),
          endTime: newEndTime.toString(),
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.reschedule('reservation_123', {
        startTime: newStartTime.toString(),
        endTime: newEndTime.toString(),
      });

      expect(result.startTime).toBe(newStartTime);
      expect(result.endTime).toBe(newEndTime);
    });

    it('should reschedule with different resource', async () => {
      const newStartTime = Date.now() + 24 * 60 * 60 * 1000;
      const newEndTime = newStartTime + 2 * 60 * 60 * 1000;

      const mockResponse: Reservation = {
        id: 'reservation_123',
        reservationType: ResourceType.TABLE,
        resourceId: 'resource_table10',
        customerId: 'cust_123',
        startTime: newStartTime,
        endTime: newEndTime,
        duration: 2,
        personsNumber: 4,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        isResourceReservation: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservations/reservation_123/reschedule', {
          startTime: newStartTime.toString(),
          endTime: newEndTime.toString(),
          resourceId: 'resource_table10',
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.reschedule('reservation_123', {
        startTime: newStartTime.toString(),
        endTime: newEndTime.toString(),
        resourceId: 'resource_table10',
      });

      expect(result.resourceId).toBe('resource_table10');
    });
  });

  describe('delete', () => {
    it('should delete a reservation', async () => {
      nock(BASE_URL)
        .delete('/reservations/reservation_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.delete('reservation_123');
      expect(result).toBe(true);
    });

    it('should throw API error when reservation not found', async () => {
      nock(BASE_URL)
        .delete('/reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.reservations.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list reservations with pagination', async () => {
      const mockReservations: Reservation[] = [
        {
          id: 'reservation_1',
          reservationType: ResourceType.TABLE,
          customerId: 'cust_1',
          startTime: Date.now(),
          duration: 2,
          personsNumber: 4,
          totalPrice: 0,
          depositPaid: 0,
          status: AppointmentStatus.CONFIRMED,
          isResourceReservation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'reservation_2',
          reservationType: ResourceType.ROOM,
          customerId: 'cust_2',
          startTime: Date.now() + 24 * 60 * 60 * 1000,
          duration: 3,
          personsNumber: 2,
          totalPrice: 899.97,
          depositPaid: 299.99,
          status: AppointmentStatus.PENDING,
          isResourceReservation: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Reservation> = {
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
        .get('/reservations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].reservationType).toBe(ResourceType.TABLE);
      expect(result.data[1].reservationType).toBe(ResourceType.ROOM);
    });

    it('should list reservations with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<Reservation> = {
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
        .get('/reservations')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservations.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('Reservation Settings', () => {
    describe('getSettings', () => {
      it('should retrieve reservation settings', async () => {
        const mockSettings: ReservationSettings[] = [
          {
            id: 'settings_1',
            reservationType: ResourceType.TABLE,
            settingType: ReservationSettingType.CAPACITY,
            defaultReservationDuration: 2,
            defaultReservationDurationUnit: ResourceReservationDurationUnit.HOURS,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'settings_2',
            reservationType: ResourceType.ROOM,
            settingType: ReservationSettingType.CAPACITY,
            defaultReservationDuration: 1,
            defaultReservationDurationUnit: ResourceReservationDurationUnit.NIGHTS,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        nock(BASE_URL)
          .get('/reservations/settings')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockSettings,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.reservations.getSettings();

        expect(result).toHaveLength(2);
        expect(result[0].reservationType).toBe(ResourceType.TABLE);
        expect(result[0].defaultReservationDuration).toBe(2);
        expect(result[1].reservationType).toBe(ResourceType.ROOM);
      });
    });

    describe('updateSettings', () => {
      it('should update reservation settings', async () => {
        const updateData = {
          id: 'settings_123',
          defaultReservationDuration: 3,
          isActive: false,
        };

        const mockResponse: ReservationSettings = {
          id: 'settings_123',
          reservationType: ResourceType.TABLE,
          settingType: ReservationSettingType.CAPACITY,
          defaultReservationDuration: 3,
          defaultReservationDurationUnit: ResourceReservationDurationUnit.HOURS,
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/reservations/settings', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.reservations.updateSettings(updateData);

        expect(result.defaultReservationDuration).toBe(3);
        expect(result.isActive).toBe(false);
      });
    });

    describe('deleteSettings', () => {
      it('should delete reservation settings', async () => {
        nock(BASE_URL)
          .delete('/reservations/settings/settings_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.reservations.deleteSettings('settings_123');
        expect(result).toBe(true);
      });

      it('should throw API error when settings not found', async () => {
        nock(BASE_URL)
          .delete('/reservations/settings/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Reservation settings not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.reservations.deleteSettings('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });
  });
});
