/**
 * @fileoverview Tests for Reservation Settings resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import {
  ReservationSettings,
  PaginatedResultType,
  ReservationSettingType,
} from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ReservationSettingsResource', () => {
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
    it('should create reservation settings with table configuration', async () => {
      const input = {
        locationId: 'loc_123',
        supportTableReservations: true,
        supportRoomReservations: false,
        supportRentalReservations: false,
        table: {
          settingType: ReservationSettingType.CAPACITY,
          defaultDurationMinutes: 90,
          turnoverMinutes: 15,
          slotIntervalMinutes: 30,
          maxPartySize: 12,
          advanceBookingDays: 30,
        },
      };

      const mockResponse: ReservationSettings = {
        id: 'rs_123',
        locationId: 'loc_123',
        supportTableReservations: true,
        supportRoomReservations: false,
        supportRentalReservations: false,
        table: {
          settingType: ReservationSettingType.CAPACITY,
          defaultDurationMinutes: 90,
          turnoverMinutes: 15,
          slotIntervalMinutes: 30,
          maxPartySize: 12,
          advanceBookingDays: 30,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-settings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.create(input);

      expect(result.id).toBe('rs_123');
      expect(result.supportTableReservations).toBe(true);
      expect(result.table?.defaultDurationMinutes).toBe(90);
      expect(result.table?.maxPartySize).toBe(12);
    });

    it('should create reservation settings with room configuration', async () => {
      const input = {
        locationId: 'loc_456',
        supportTableReservations: false,
        supportRoomReservations: true,
        supportRentalReservations: false,
        room: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          minStayNights: 1,
          maxStayNights: 30,
          advanceBookingDays: 90,
        },
      };

      const mockResponse: ReservationSettings = {
        id: 'rs_456',
        locationId: 'loc_456',
        supportTableReservations: false,
        supportRoomReservations: true,
        supportRentalReservations: false,
        room: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          minStayNights: 1,
          maxStayNights: 30,
          advanceBookingDays: 90,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-settings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.create(input);

      expect(result.id).toBe('rs_456');
      expect(result.supportRoomReservations).toBe(true);
      expect(result.room?.checkInTime).toBe('15:00');
      expect(result.room?.checkOutTime).toBe('11:00');
      expect(result.room?.maxStayNights).toBe(30);
    });

    it('should create reservation settings with rental configuration', async () => {
      const input = {
        locationId: 'loc_789',
        supportTableReservations: false,
        supportRoomReservations: false,
        supportRentalReservations: true,
        rental: {
          tiers: [
            { id: 'tier_1', name: '1 Hour', durationMinutes: 60, sortOrder: 0 },
            { id: 'tier_2', name: 'Half Day', durationMinutes: 240, sortOrder: 1 },
            { id: 'tier_3', name: 'Full Day', durationMinutes: 480, sortOrder: 2 },
          ],
          requireWaiver: true,
          requireIdVerification: true,
          defaultDepositPercent: 20,
        },
      };

      const mockResponse: ReservationSettings = {
        id: 'rs_789',
        locationId: 'loc_789',
        supportTableReservations: false,
        supportRoomReservations: false,
        supportRentalReservations: true,
        rental: {
          tiers: [
            { id: 'tier_1', name: '1 Hour', durationMinutes: 60, sortOrder: 0 },
            { id: 'tier_2', name: 'Half Day', durationMinutes: 240, sortOrder: 1 },
            { id: 'tier_3', name: 'Full Day', durationMinutes: 480, sortOrder: 2 },
          ],
          requireWaiver: true,
          requireIdVerification: true,
          defaultDepositPercent: 20,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-settings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.create(input);

      expect(result.id).toBe('rs_789');
      expect(result.supportRentalReservations).toBe(true);
      expect(result.rental?.tiers).toHaveLength(3);
      expect(result.rental?.requireWaiver).toBe(true);
      expect(result.rental?.defaultDepositPercent).toBe(20);
    });

    it('should create reservation settings with all reservation types enabled', async () => {
      const input = {
        locationId: 'loc_full',
        supportTableReservations: true,
        supportRoomReservations: true,
        supportRentalReservations: true,
        table: {
          settingType: ReservationSettingType.RESOURCE,
          defaultDurationMinutes: 120,
          turnoverMinutes: 30,
          slotIntervalMinutes: 15,
          advanceBookingDays: 14,
        },
        room: {
          checkInTime: '14:00',
          checkOutTime: '12:00',
          minStayNights: 2,
          advanceBookingDays: 180,
        },
        rental: {
          tiers: [
            { id: 'tier_1', name: '2 Hours', durationMinutes: 120, sortOrder: 0 },
          ],
          requireWaiver: false,
          requireIdVerification: false,
        },
      };

      const mockResponse: ReservationSettings = {
        id: 'rs_full',
        locationId: 'loc_full',
        supportTableReservations: true,
        supportRoomReservations: true,
        supportRentalReservations: true,
        table: {
          settingType: ReservationSettingType.RESOURCE,
          defaultDurationMinutes: 120,
          turnoverMinutes: 30,
          slotIntervalMinutes: 15,
          advanceBookingDays: 14,
        },
        room: {
          checkInTime: '14:00',
          checkOutTime: '12:00',
          minStayNights: 2,
          advanceBookingDays: 180,
        },
        rental: {
          tiers: [
            { id: 'tier_1', name: '2 Hours', durationMinutes: 120, sortOrder: 0 },
          ],
          requireWaiver: false,
          requireIdVerification: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-settings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.create(input);

      expect(result.supportTableReservations).toBe(true);
      expect(result.supportRoomReservations).toBe(true);
      expect(result.supportRentalReservations).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve reservation settings by ID', async () => {
      const mockResponse: ReservationSettings = {
        id: 'rs_123',
        locationId: 'loc_123',
        supportTableReservations: true,
        supportRoomReservations: false,
        supportRentalReservations: false,
        table: {
          settingType: ReservationSettingType.CAPACITY,
          defaultDurationMinutes: 90,
          turnoverMinutes: 15,
          slotIntervalMinutes: 30,
          advanceBookingDays: 30,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/reservation-settings/rs_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.get('rs_123');

      expect(result.id).toBe('rs_123');
      expect(result.locationId).toBe('loc_123');
      expect(result.table?.defaultDurationMinutes).toBe(90);
    });

    it('should throw API error when settings not found', async () => {
      nock(BASE_URL)
        .get('/reservation-settings/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation settings not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.reservationSettings.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByLocation', () => {
    it('should retrieve reservation settings by location', async () => {
      const mockResponse: ReservationSettings = {
        id: 'rs_123',
        locationId: 'loc_123',
        supportTableReservations: true,
        supportRoomReservations: true,
        supportRentalReservations: false,
        table: {
          settingType: ReservationSettingType.CAPACITY,
          defaultDurationMinutes: 60,
          turnoverMinutes: 10,
          slotIntervalMinutes: 15,
          advanceBookingDays: 14,
        },
        room: {
          checkInTime: '16:00',
          checkOutTime: '10:00',
          minStayNights: 1,
          advanceBookingDays: 60,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/reservation-settings/by-location/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.getByLocation('loc_123');

      expect(result.id).toBe('rs_123');
      expect(result.locationId).toBe('loc_123');
      expect(result.supportTableReservations).toBe(true);
      expect(result.supportRoomReservations).toBe(true);
    });

    it('should throw API error when location has no settings', async () => {
      nock(BASE_URL)
        .get('/reservation-settings/by-location/loc_unknown')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation settings not found for location' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.reservationSettings.getByLocation('loc_unknown')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('update', () => {
    it('should update table settings', async () => {
      const updateData = {
        id: 'rs_123',
        table: {
          settingType: ReservationSettingType.CAPACITY,
          defaultDurationMinutes: 120,
          turnoverMinutes: 20,
          slotIntervalMinutes: 15,
          maxPartySize: 20,
          advanceBookingDays: 60,
        },
      };

      const mockResponse: ReservationSettings = {
        id: 'rs_123',
        locationId: 'loc_123',
        supportTableReservations: true,
        supportRoomReservations: false,
        supportRentalReservations: false,
        table: {
          settingType: ReservationSettingType.CAPACITY,
          defaultDurationMinutes: 120,
          turnoverMinutes: 20,
          slotIntervalMinutes: 15,
          maxPartySize: 20,
          advanceBookingDays: 60,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservation-settings', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.update(updateData);

      expect(result.table?.defaultDurationMinutes).toBe(120);
      expect(result.table?.maxPartySize).toBe(20);
      expect(result.table?.advanceBookingDays).toBe(60);
    });

    it('should enable room reservations', async () => {
      const updateData = {
        id: 'rs_123',
        supportRoomReservations: true,
        room: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          minStayNights: 1,
          advanceBookingDays: 90,
        },
      };

      const mockResponse: ReservationSettings = {
        id: 'rs_123',
        locationId: 'loc_123',
        supportTableReservations: true,
        supportRoomReservations: true,
        supportRentalReservations: false,
        table: {
          settingType: ReservationSettingType.CAPACITY,
          defaultDurationMinutes: 90,
          turnoverMinutes: 15,
          slotIntervalMinutes: 30,
          advanceBookingDays: 30,
        },
        room: {
          checkInTime: '15:00',
          checkOutTime: '11:00',
          minStayNights: 1,
          advanceBookingDays: 90,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservation-settings', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.update(updateData);

      expect(result.supportRoomReservations).toBe(true);
      expect(result.room?.checkInTime).toBe('15:00');
    });

    it('should update rental tiers', async () => {
      const updateData = {
        id: 'rs_789',
        rental: {
          tiers: [
            { id: 'tier_1', name: '30 Minutes', durationMinutes: 30, sortOrder: 0 },
            { id: 'tier_2', name: '1 Hour', durationMinutes: 60, sortOrder: 1 },
            { id: 'tier_3', name: '2 Hours', durationMinutes: 120, sortOrder: 2 },
            { id: 'tier_4', name: 'Half Day', durationMinutes: 240, sortOrder: 3 },
          ],
          requireWaiver: true,
          requireIdVerification: true,
          defaultDepositPercent: 25,
        },
      };

      const mockResponse: ReservationSettings = {
        id: 'rs_789',
        locationId: 'loc_789',
        supportTableReservations: false,
        supportRoomReservations: false,
        supportRentalReservations: true,
        rental: {
          tiers: [
            { id: 'tier_1', name: '30 Minutes', durationMinutes: 30, sortOrder: 0 },
            { id: 'tier_2', name: '1 Hour', durationMinutes: 60, sortOrder: 1 },
            { id: 'tier_3', name: '2 Hours', durationMinutes: 120, sortOrder: 2 },
            { id: 'tier_4', name: 'Half Day', durationMinutes: 240, sortOrder: 3 },
          ],
          requireWaiver: true,
          requireIdVerification: true,
          defaultDepositPercent: 25,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservation-settings', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.update(updateData);

      expect(result.rental?.tiers).toHaveLength(4);
      expect(result.rental?.defaultDepositPercent).toBe(25);
    });
  });

  describe('delete', () => {
    it('should delete reservation settings', async () => {
      nock(BASE_URL)
        .delete('/reservation-settings/rs_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.delete('rs_123');
      expect(result).toBe(true);
    });

    it('should throw API error when settings not found', async () => {
      nock(BASE_URL)
        .delete('/reservation-settings/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation settings not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.reservationSettings.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list reservation settings with pagination', async () => {
      const mockSettings: ReservationSettings[] = [
        {
          id: 'rs_1',
          locationId: 'loc_1',
          supportTableReservations: true,
          supportRoomReservations: false,
          supportRentalReservations: false,
          table: {
            settingType: ReservationSettingType.CAPACITY,
            defaultDurationMinutes: 60,
            turnoverMinutes: 10,
            slotIntervalMinutes: 15,
            advanceBookingDays: 14,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rs_2',
          locationId: 'loc_2',
          supportTableReservations: false,
          supportRoomReservations: true,
          supportRentalReservations: false,
          room: {
            checkInTime: '15:00',
            checkOutTime: '11:00',
            minStayNights: 1,
            advanceBookingDays: 90,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rs_3',
          locationId: 'loc_3',
          supportTableReservations: false,
          supportRoomReservations: false,
          supportRentalReservations: true,
          rental: {
            tiers: [],
            requireWaiver: false,
            requireIdVerification: false,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ReservationSettings> = {
        data: mockSettings,
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
        .get('/reservation-settings')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.list();

      expect(result.data).toHaveLength(3);
      expect(result.meta.totalCount).toBe(3);
      expect(result.data[0].supportTableReservations).toBe(true);
      expect(result.data[1].supportRoomReservations).toBe(true);
      expect(result.data[2].supportRentalReservations).toBe(true);
    });

    it('should list reservation settings with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ReservationSettings> = {
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
        .get('/reservation-settings')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationSettings.list({
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
