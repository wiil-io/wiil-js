/**
 * @fileoverview Tests for Room Reservations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { RoomReservation, PaginatedResultType, ReservationStatus, PaymentStatus } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('RoomReservationsResource', () => {
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
    it('should create a new room reservation', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 3;

      const input = {
        locationId: 'loc_123',
        resourceId: 'room_456',
        guestId: 'guest_789',
        personsNumber: 2,
        checkIn,
        checkOut,
        nights: 3,
        status: ReservationStatus.PENDING,
        ratePerNight: [
          { date: '2024-06-15', amount: 199.99 },
          { date: '2024-06-16', amount: 199.99 },
          { date: '2024-06-17', amount: 249.99 },
        ],
        totalWithTax: 715.67,
        deposit: 200.00,
        paymentStatus: PaymentStatus.PENDING,
        notes: 'Late check-in requested',
      };

      const mockResponse: RoomReservation = {
        id: 'rres_123',
        locationId: 'loc_123',
        resourceId: 'room_456',
        guestId: 'guest_789',
        personsNumber: 2,
        checkIn,
        checkOut,
        nights: 3,
        status: ReservationStatus.PENDING,
        ratePerNight: [
          { date: '2024-06-15', amount: 199.99 },
          { date: '2024-06-16', amount: 199.99 },
          { date: '2024-06-17', amount: 249.99 },
        ],
        totalWithTax: 715.67,
        deposit: 200.00,
        paymentStatus: PaymentStatus.PENDING,
        notes: 'Late check-in requested',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-reservations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.create(input);

      expect(result.id).toBe('rres_123');
      expect(result.resourceId).toBe('room_456');
      expect(result.guestId).toBe('guest_789');
      expect(result.nights).toBe(3);
      expect(result.totalWithTax).toBe(715.67);
      expect(result.ratePerNight).toHaveLength(3);
    });

    it('should create a room reservation with external reference', async () => {
      const checkIn = Date.now() + 172800000;
      const checkOut = checkIn + 86400000 * 2;

      const input = {
        locationId: 'loc_456',
        channelId: 'channel_booking',
        resourceId: 'room_suite_01',
        guestId: 'guest_vip_001',
        personsNumber: 4,
        checkIn,
        checkOut,
        nights: 2,
        status: ReservationStatus.CONFIRMED,
        source: 'booking.com',
        ratePerNight: [
          { date: '2024-07-01', amount: 399.99 },
          { date: '2024-07-02', amount: 399.99 },
        ],
        totalWithTax: 879.98,
        deposit: 400.00,
        paymentStatus: PaymentStatus.PAID,
        externalRef: {
          externalId: 'booking_12345',
          source: 'booking.com',
          url: 'https://admin.booking.com/reservations/12345',
        },
      };

      const mockResponse: RoomReservation = {
        id: 'rres_suite_001',
        locationId: 'loc_456',
        channelId: 'channel_booking',
        resourceId: 'room_suite_01',
        guestId: 'guest_vip_001',
        personsNumber: 4,
        checkIn,
        checkOut,
        nights: 2,
        status: ReservationStatus.CONFIRMED,
        source: 'booking.com',
        ratePerNight: [
          { date: '2024-07-01', amount: 399.99 },
          { date: '2024-07-02', amount: 399.99 },
        ],
        totalWithTax: 879.98,
        deposit: 400.00,
        paymentStatus: PaymentStatus.PAID,
        externalRef: {
          externalId: 'booking_12345',
          source: 'booking.com',
          url: 'https://admin.booking.com/reservations/12345',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-reservations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.create(input);

      expect(result.id).toBe('rres_suite_001');
      expect(result.externalRef?.source).toBe('booking.com');
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });

  describe('get', () => {
    it('should retrieve a room reservation by ID', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 2;

      const mockResponse: RoomReservation = {
        id: 'rres_123',
        locationId: 'loc_123',
        resourceId: 'room_456',
        guestId: 'guest_789',
        personsNumber: 2,
        checkIn,
        checkOut,
        nights: 2,
        status: ReservationStatus.CONFIRMED,
        ratePerNight: [
          { date: '2024-06-15', amount: 149.99 },
          { date: '2024-06-16', amount: 149.99 },
        ],
        totalWithTax: 329.98,
        deposit: 100.00,
        paymentStatus: PaymentStatus.PAID,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/room-reservations/rres_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.get('rres_123');

      expect(result.id).toBe('rres_123');
      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
    });

    it('should throw API error when room reservation not found', async () => {
      nock(BASE_URL)
        .get('/room-reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Room reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.roomReservations.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByGuest', () => {
    it('should retrieve room reservations by guest ID', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 2;

      const mockReservations: RoomReservation[] = [
        {
          id: 'rres_1',
          resourceId: 'room_1',
          guestId: 'guest_123',
          personsNumber: 2,
          checkIn,
          checkOut,
          nights: 2,
          status: ReservationStatus.COMPLETED,
          ratePerNight: [],
          totalWithTax: 299.98,
          deposit: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rres_2',
          resourceId: 'room_2',
          guestId: 'guest_123',
          personsNumber: 1,
          checkIn: checkIn + 86400000 * 30,
          checkOut: checkOut + 86400000 * 30,
          nights: 2,
          status: ReservationStatus.CONFIRMED,
          ratePerNight: [],
          totalWithTax: 259.98,
          deposit: 50.00,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomReservation> = {
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
        .get('/room-reservations/by-guest/guest_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.getByGuest('guest_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.guestId === 'guest_123')).toBe(true);
    });

    it('should get reservations by guest with pagination', async () => {
      const mockResponse: PaginatedResultType<RoomReservation> = {
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
        .get('/room-reservations/by-guest/guest_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.getByGuest('guest_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByResource', () => {
    it('should retrieve room reservations by resource ID', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 3;

      const mockReservations: RoomReservation[] = [
        {
          id: 'rres_1',
          resourceId: 'room_456',
          guestId: 'guest_1',
          personsNumber: 2,
          checkIn,
          checkOut,
          nights: 3,
          status: ReservationStatus.CONFIRMED,
          ratePerNight: [],
          totalWithTax: 449.97,
          deposit: 100.00,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomReservation> = {
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
        .get('/room-reservations/by-resource/room_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.getByResource('room_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].resourceId).toBe('room_456');
    });
  });

  describe('getByCheckInRange', () => {
    it('should retrieve room reservations by check-in date range', async () => {
      const startDate = Date.now();
      const endDate = Date.now() + 86400000 * 7;
      const checkIn = Date.now() + 86400000 * 2;
      const checkOut = checkIn + 86400000 * 2;

      const mockReservations: RoomReservation[] = [
        {
          id: 'rres_1',
          resourceId: 'room_1',
          guestId: 'guest_1',
          personsNumber: 2,
          checkIn,
          checkOut,
          nights: 2,
          status: ReservationStatus.PENDING,
          ratePerNight: [],
          totalWithTax: 299.98,
          deposit: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rres_2',
          resourceId: 'room_2',
          guestId: 'guest_2',
          personsNumber: 3,
          checkIn: checkIn + 86400000,
          checkOut: checkOut + 86400000 * 2,
          nights: 3,
          status: ReservationStatus.CONFIRMED,
          ratePerNight: [],
          totalWithTax: 449.97,
          deposit: 150.00,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomReservation> = {
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
        .get('/room-reservations/by-check-in-range')
        .query({ checkInStart: startDate.toString(), checkInEnd: endDate.toString() })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.getByCheckInRange(startDate, endDate);

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should get reservations by check-in range with pagination', async () => {
      const startDate = Date.now();
      const endDate = Date.now() + 86400000 * 30;

      const mockResponse: PaginatedResultType<RoomReservation> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 15,
          totalCount: 40,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/room-reservations/by-check-in-range')
        .query({
          checkInStart: startDate.toString(),
          checkInEnd: endDate.toString(),
          page: '3',
          pageSize: '15',
        })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.getByCheckInRange(startDate, endDate, {
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('update', () => {
    it('should update a room reservation', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 4;

      const updateData = {
        id: 'rres_123',
        nights: 4,
        totalWithTax: 599.96,
        notes: 'Extended stay - additional night added',
      };

      const mockResponse: RoomReservation = {
        id: 'rres_123',
        resourceId: 'room_456',
        guestId: 'guest_789',
        personsNumber: 2,
        checkIn,
        checkOut,
        nights: 4,
        status: ReservationStatus.CONFIRMED,
        ratePerNight: [],
        totalWithTax: 599.96,
        deposit: 200.00,
        notes: 'Extended stay - additional night added',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/room-reservations/rres_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.update('rres_123', updateData);

      expect(result.nights).toBe(4);
      expect(result.totalWithTax).toBe(599.96);
      expect(result.notes).toBe('Extended stay - additional night added');
    });

    it('should update reservation payment status', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 2;

      const updateData = {
        id: 'rres_123',
        paymentStatus: PaymentStatus.PAID,
      };

      const mockResponse: RoomReservation = {
        id: 'rres_123',
        resourceId: 'room_456',
        guestId: 'guest_789',
        personsNumber: 2,
        checkIn,
        checkOut,
        nights: 2,
        status: ReservationStatus.CONFIRMED,
        ratePerNight: [],
        totalWithTax: 299.98,
        deposit: 100.00,
        paymentStatus: PaymentStatus.PAID,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/room-reservations/rres_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.update('rres_123', updateData);

      expect(result.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });

  describe('cancel', () => {
    it('should cancel a room reservation', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 2;

      const mockResponse: RoomReservation = {
        id: 'rres_123',
        resourceId: 'room_456',
        guestId: 'guest_789',
        personsNumber: 2,
        checkIn,
        checkOut,
        nights: 2,
        status: ReservationStatus.CANCELLED,
        ratePerNight: [],
        totalWithTax: 299.98,
        deposit: 100.00,
        paymentStatus: PaymentStatus.REFUNDED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-reservations/rres_123/cancel', { reason: 'Change of travel plans' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.cancel('rres_123', 'Change of travel plans');

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should cancel a room reservation without reason', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000;

      const mockResponse: RoomReservation = {
        id: 'rres_456',
        resourceId: 'room_789',
        guestId: 'guest_001',
        personsNumber: 1,
        checkIn,
        checkOut,
        nights: 1,
        status: ReservationStatus.CANCELLED,
        ratePerNight: [],
        totalWithTax: 149.99,
        deposit: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-reservations/rres_456/cancel', { reason: undefined })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.cancel('rres_456');

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  describe('delete', () => {
    it('should delete a room reservation', async () => {
      nock(BASE_URL)
        .delete('/room-reservations/rres_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.delete('rres_123');
      expect(result).toBe(true);
    });

    it('should throw API error when room reservation not found', async () => {
      nock(BASE_URL)
        .delete('/room-reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Room reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.roomReservations.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list room reservations with pagination', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000 * 2;

      const mockReservations: RoomReservation[] = [
        {
          id: 'rres_1',
          resourceId: 'room_1',
          guestId: 'guest_1',
          personsNumber: 2,
          checkIn,
          checkOut,
          nights: 2,
          status: ReservationStatus.PENDING,
          ratePerNight: [],
          totalWithTax: 299.98,
          deposit: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rres_2',
          resourceId: 'room_2',
          guestId: 'guest_2',
          personsNumber: 4,
          checkIn: checkIn + 86400000,
          checkOut: checkOut + 86400000,
          nights: 2,
          status: ReservationStatus.CONFIRMED,
          ratePerNight: [],
          totalWithTax: 499.98,
          deposit: 200.00,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomReservation> = {
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
        .get('/room-reservations')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list room reservations with custom pagination', async () => {
      const mockResponse: PaginatedResultType<RoomReservation> = {
        data: [],
        meta: {
          page: 4,
          pageSize: 25,
          totalCount: 100,
          totalPages: 4,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/room-reservations')
        .query({ page: '4', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.list({
        page: 4,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(4);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple room reservations in batch', async () => {
      const checkIn1 = Date.now() + 86400000;
      const checkOut1 = checkIn1 + 86400000 * 2;
      const checkIn2 = Date.now() + 172800000;
      const checkOut2 = checkIn2 + 86400000 * 3;

      const batchInput = [
        {
          resourceId: 'room_1',
          guestId: 'guest_1',
          personsNumber: 2,
          checkIn: checkIn1,
          checkOut: checkOut1,
          nights: 2,
          status: ReservationStatus.PENDING,
          ratePerNight: [],
          totalWithTax: 299.98,
          deposit: 0,
        },
        {
          resourceId: 'room_2',
          guestId: 'guest_2',
          personsNumber: 3,
          checkIn: checkIn2,
          checkOut: checkOut2,
          nights: 3,
          status: ReservationStatus.PENDING,
          ratePerNight: [],
          totalWithTax: 449.97,
          deposit: 100.00,
        },
      ];

      const mockReservations: RoomReservation[] = [
        {
          id: 'rres_1',
          resourceId: 'room_1',
          guestId: 'guest_1',
          personsNumber: 2,
          checkIn: checkIn1,
          checkOut: checkOut1,
          nights: 2,
          status: ReservationStatus.PENDING,
          ratePerNight: [],
          totalWithTax: 299.98,
          deposit: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rres_2',
          resourceId: 'room_2',
          guestId: 'guest_2',
          personsNumber: 3,
          checkIn: checkIn2,
          checkOut: checkOut2,
          nights: 3,
          status: ReservationStatus.PENDING,
          ratePerNight: [],
          totalWithTax: 449.97,
          deposit: 100.00,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomReservation> = {
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
        .post('/room-reservations/batch', batchInput)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomReservations.createBatch(batchInput);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('rres_1');
      expect(result.data[1].id).toBe('rres_2');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const checkIn = Date.now() + 86400000;
      const checkOut = checkIn + 86400000;

      const batchInput = Array.from({ length: 51 }, (_, i) => ({
        resourceId: `room_${i}`,
        guestId: `guest_${i}`,
        personsNumber: 2,
        checkIn,
        checkOut,
        nights: 1,
        status: ReservationStatus.PENDING,
        ratePerNight: [],
        totalWithTax: 149.99,
        deposit: 0,
      }));

      await expect(
        client.roomReservations.createBatch(batchInput)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
