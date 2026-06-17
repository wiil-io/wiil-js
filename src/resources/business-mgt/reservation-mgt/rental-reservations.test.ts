/**
 * @fileoverview Tests for Rental Reservations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { RentalReservation, PaginatedResultType, RentalReservationStatus, DepositStatus } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('RentalReservationsResource', () => {
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
    it('should create a new rental reservation', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 4;

      const input = {
        locationId: 'loc_123',
        customerId: 'cust_456',
        resourceId: 'bike_789',
        startAt,
        endAt,
        tierId: 'tier_standard',
        status: RentalReservationStatus.UPCOMING,
        payment: {
          rentalCharge: 50.00,
          securityDeposit: 100.00,
          depositStatus: DepositStatus.PENDING,
        },
        checklistCompletions: [],
        notes: 'Customer is a first-time renter',
      };

      const mockResponse: RentalReservation = {
        id: 'rental_123',
        locationId: 'loc_123',
        customerId: 'cust_456',
        resourceId: 'bike_789',
        startAt,
        endAt,
        tierId: 'tier_standard',
        status: RentalReservationStatus.UPCOMING,
        payment: {
          rentalCharge: 50.00,
          securityDeposit: 100.00,
          depositStatus: DepositStatus.PENDING,
        },
        checklistCompletions: [],
        notes: 'Customer is a first-time renter',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-reservations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.create(input);

      expect(result.id).toBe('rental_123');
      expect(result.resourceId).toBe('bike_789');
      expect(result.customerId).toBe('cust_456');
      expect(result.status).toBe(RentalReservationStatus.UPCOMING);
      expect(result.payment.rentalCharge).toBe(50.00);
    });

    it('should create a rental reservation with waiver and ID verification', async () => {
      const startAt = Date.now() + 172800000;
      const endAt = startAt + 86400000;

      const input = {
        locationId: 'loc_456',
        channelId: 'channel_web',
        customerId: 'cust_premium_001',
        resourceId: 'jetski_001',
        startAt,
        endAt,
        tierId: 'tier_premium',
        status: RentalReservationStatus.UPCOMING,
        payment: {
          rentalCharge: 299.99,
          securityDeposit: 500.00,
          depositStatus: DepositStatus.PAID,
        },
        checklistCompletions: [
          {
            itemId: 'check_life_jacket',
            completed: true,
            completedAt: Date.now(),
            completedBy: 'staff_001',
          },
        ],
        waiver: {
          waiverId: 'waiver_001',
          signedAt: Date.now(),
          status: 'signed' as const,
        },
        idVerification: {
          verificationId: 'verify_001',
          provider: 'jumio',
          verifiedAt: Date.now(),
          status: 'verified' as const,
        },
        externalRef: {
          externalId: 'ext_rental_123',
          source: 'partner_app',
        },
      };

      const mockResponse: RentalReservation = {
        id: 'rental_premium_001',
        locationId: 'loc_456',
        channelId: 'channel_web',
        customerId: 'cust_premium_001',
        resourceId: 'jetski_001',
        startAt,
        endAt,
        tierId: 'tier_premium',
        status: RentalReservationStatus.UPCOMING,
        payment: {
          rentalCharge: 299.99,
          securityDeposit: 500.00,
          depositStatus: DepositStatus.PAID,
        },
        checklistCompletions: [
          {
            itemId: 'check_life_jacket',
            completed: true,
            completedAt: Date.now(),
            completedBy: 'staff_001',
          },
        ],
        waiver: {
          waiverId: 'waiver_001',
          signedAt: Date.now(),
          status: 'signed',
        },
        idVerification: {
          verificationId: 'verify_001',
          provider: 'jumio',
          verifiedAt: Date.now(),
          status: 'verified',
        },
        externalRef: {
          externalId: 'ext_rental_123',
          source: 'partner_app',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-reservations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.create(input);

      expect(result.id).toBe('rental_premium_001');
      expect(result.waiver?.status).toBe('signed');
      expect(result.idVerification?.status).toBe('verified');
      expect(result.payment.depositStatus).toBe(DepositStatus.PAID);
    });
  });

  describe('get', () => {
    it('should retrieve a rental reservation by ID', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 2;

      const mockResponse: RentalReservation = {
        id: 'rental_123',
        locationId: 'loc_123',
        customerId: 'cust_456',
        resourceId: 'kayak_789',
        startAt,
        endAt,
        tierId: 'tier_basic',
        status: RentalReservationStatus.OUT,
        payment: {
          rentalCharge: 35.00,
          securityDeposit: 50.00,
          depositStatus: DepositStatus.PAID,
        },
        checklistCompletions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/rental-reservations/rental_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.get('rental_123');

      expect(result.id).toBe('rental_123');
      expect(result.status).toBe(RentalReservationStatus.OUT);
    });

    it('should throw API error when rental reservation not found', async () => {
      nock(BASE_URL)
        .get('/rental-reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Rental reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.rentalReservations.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve rental reservations by customer ID', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 3;

      const mockReservations: RentalReservation[] = [
        {
          id: 'rental_1',
          customerId: 'cust_123',
          resourceId: 'bike_1',
          startAt,
          endAt,
          tierId: 'tier_basic',
          status: RentalReservationStatus.RETURNED,
          payment: {
            rentalCharge: 25.00,
            securityDeposit: 50.00,
            depositStatus: DepositStatus.RETURNED,
          },
          checklistCompletions: [],
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now(),
        },
        {
          id: 'rental_2',
          customerId: 'cust_123',
          resourceId: 'bike_2',
          startAt: startAt + 172800000,
          endAt: endAt + 172800000,
          tierId: 'tier_basic',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 25.00,
            securityDeposit: 50.00,
            depositStatus: DepositStatus.PENDING,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .get('/rental-reservations/by-customer/cust_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.getByCustomer('cust_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.customerId === 'cust_123')).toBe(true);
    });

    it('should get reservations by customer with pagination', async () => {
      const mockResponse: PaginatedResultType<RentalReservation> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 18,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/rental-reservations/by-customer/cust_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.getByCustomer('cust_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByResource', () => {
    it('should retrieve rental reservations by resource ID', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 4;

      const mockReservations: RentalReservation[] = [
        {
          id: 'rental_1',
          customerId: 'cust_1',
          resourceId: 'bike_premium_01',
          startAt,
          endAt,
          tierId: 'tier_premium',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 75.00,
            securityDeposit: 150.00,
            depositStatus: DepositStatus.PAID,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .get('/rental-reservations/by-resource/bike_premium_01')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.getByResource('bike_premium_01');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].resourceId).toBe('bike_premium_01');
    });
  });

  describe('getByTier', () => {
    it('should retrieve rental reservations by tier ID', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 2;

      const mockReservations: RentalReservation[] = [
        {
          id: 'rental_1',
          customerId: 'cust_1',
          resourceId: 'resource_1',
          startAt,
          endAt,
          tierId: 'tier_premium',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 100.00,
            securityDeposit: 200.00,
            depositStatus: DepositStatus.PAID,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rental_2',
          customerId: 'cust_2',
          resourceId: 'resource_2',
          startAt: startAt + 3600000,
          endAt: endAt + 3600000,
          tierId: 'tier_premium',
          status: RentalReservationStatus.OUT,
          payment: {
            rentalCharge: 100.00,
            securityDeposit: 200.00,
            depositStatus: DepositStatus.PAID,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .get('/rental-reservations/by-tier/tier_premium')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.getByTier('tier_premium');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.tierId === 'tier_premium')).toBe(true);
    });
  });

  describe('getByDateRange', () => {
    it('should retrieve rental reservations by date range', async () => {
      const startAt = Date.now();
      const endAt = Date.now() + 86400000 * 7;
      const rentalStart = Date.now() + 86400000 * 2;
      const rentalEnd = rentalStart + 3600000 * 4;

      const mockReservations: RentalReservation[] = [
        {
          id: 'rental_1',
          customerId: 'cust_1',
          resourceId: 'resource_1',
          startAt: rentalStart,
          endAt: rentalEnd,
          tierId: 'tier_basic',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 40.00,
            securityDeposit: 80.00,
            depositStatus: DepositStatus.PENDING,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .get('/rental-reservations/by-date-range')
        .query({ startAt: startAt.toString(), endAt: endAt.toString() })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.getByDateRange(startAt, endAt);

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
    });

    it('should get reservations by date range with pagination', async () => {
      const startAt = Date.now();
      const endAt = Date.now() + 86400000 * 30;

      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .get('/rental-reservations/by-date-range')
        .query({
          startAt: startAt.toString(),
          endAt: endAt.toString(),
          page: '3',
          pageSize: '15',
        })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.getByDateRange(startAt, endAt, {
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('update', () => {
    it('should update a rental reservation', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 6;

      const updateData = {
        id: 'rental_123',
        endAt,
        notes: 'Extended rental period',
      };

      const mockResponse: RentalReservation = {
        id: 'rental_123',
        customerId: 'cust_456',
        resourceId: 'bike_789',
        startAt,
        endAt,
        tierId: 'tier_basic',
        status: RentalReservationStatus.OUT,
        payment: {
          rentalCharge: 60.00,
          securityDeposit: 100.00,
          depositStatus: DepositStatus.PAID,
        },
        checklistCompletions: [],
        notes: 'Extended rental period',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/rental-reservations/rental_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.update('rental_123', updateData);

      expect(result.endAt).toBe(endAt);
      expect(result.notes).toBe('Extended rental period');
    });

    it('should update reservation payment', async () => {
      const startAt = Date.now();
      const endAt = startAt + 3600000 * 4;

      const updateData = {
        id: 'rental_123',
        payment: {
          rentalCharge: 50.00,
          securityDeposit: 100.00,
          depositStatus: DepositStatus.PAID,
        },
      };

      const mockResponse: RentalReservation = {
        id: 'rental_123',
        customerId: 'cust_456',
        resourceId: 'bike_789',
        startAt,
        endAt,
        tierId: 'tier_basic',
        status: RentalReservationStatus.OUT,
        payment: {
          rentalCharge: 50.00,
          securityDeposit: 100.00,
          depositStatus: DepositStatus.PAID,
        },
        checklistCompletions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/rental-reservations/rental_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.update('rental_123', updateData);

      expect(result.payment.depositStatus).toBe(DepositStatus.PAID);
    });
  });

  describe('recordReturn', () => {
    it('should record the return of a rental item', async () => {
      const startAt = Date.now() - 3600000 * 4;
      const endAt = Date.now();
      const actualReturnAt = Date.now() - 1800000;

      const mockResponse: RentalReservation = {
        id: 'rental_123',
        customerId: 'cust_456',
        resourceId: 'bike_789',
        startAt,
        endAt,
        actualReturnAt,
        tierId: 'tier_basic',
        status: RentalReservationStatus.RETURNED,
        payment: {
          rentalCharge: 40.00,
          securityDeposit: 80.00,
          depositStatus: DepositStatus.RETURNED,
        },
        checklistCompletions: [],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-reservations/rental_123/return', { actualReturnAt })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.recordReturn('rental_123', actualReturnAt);

      expect(result.status).toBe(RentalReservationStatus.RETURNED);
      expect(result.actualReturnAt).toBe(actualReturnAt);
    });
  });

  describe('cancel', () => {
    it('should cancel a rental reservation', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 4;

      const mockResponse: RentalReservation = {
        id: 'rental_123',
        customerId: 'cust_456',
        resourceId: 'bike_789',
        startAt,
        endAt,
        tierId: 'tier_basic',
        status: RentalReservationStatus.CANCELLED,
        payment: {
          rentalCharge: 40.00,
          securityDeposit: 80.00,
          depositStatus: DepositStatus.RETURNED,
        },
        checklistCompletions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-reservations/rental_123/cancel', { reason: 'Weather conditions' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.cancel('rental_123', 'Weather conditions');

      expect(result.status).toBe(RentalReservationStatus.CANCELLED);
    });

    it('should cancel a rental reservation without reason', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 2;

      const mockResponse: RentalReservation = {
        id: 'rental_456',
        customerId: 'cust_789',
        resourceId: 'kayak_001',
        startAt,
        endAt,
        tierId: 'tier_basic',
        status: RentalReservationStatus.CANCELLED,
        payment: {
          rentalCharge: 30.00,
          securityDeposit: 50.00,
          depositStatus: DepositStatus.RETURNED,
        },
        checklistCompletions: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-reservations/rental_456/cancel', { reason: undefined })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.cancel('rental_456');

      expect(result.status).toBe(RentalReservationStatus.CANCELLED);
    });
  });

  describe('delete', () => {
    it('should delete a rental reservation', async () => {
      nock(BASE_URL)
        .delete('/rental-reservations/rental_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.delete('rental_123');
      expect(result).toBe(true);
    });

    it('should throw API error when rental reservation not found', async () => {
      nock(BASE_URL)
        .delete('/rental-reservations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Rental reservation not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.rentalReservations.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list rental reservations with pagination', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 4;

      const mockReservations: RentalReservation[] = [
        {
          id: 'rental_1',
          customerId: 'cust_1',
          resourceId: 'resource_1',
          startAt,
          endAt,
          tierId: 'tier_basic',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 40.00,
            securityDeposit: 80.00,
            depositStatus: DepositStatus.PENDING,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rental_2',
          customerId: 'cust_2',
          resourceId: 'resource_2',
          startAt: startAt + 3600000,
          endAt: endAt + 3600000,
          tierId: 'tier_premium',
          status: RentalReservationStatus.OUT,
          payment: {
            rentalCharge: 80.00,
            securityDeposit: 150.00,
            depositStatus: DepositStatus.PAID,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .get('/rental-reservations')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list rental reservations with custom pagination', async () => {
      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .get('/rental-reservations')
        .query({ page: '5', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.list({
        page: 5,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(5);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple rental reservations in batch', async () => {
      const startAt1 = Date.now() + 86400000;
      const endAt1 = startAt1 + 3600000 * 4;
      const startAt2 = Date.now() + 172800000;
      const endAt2 = startAt2 + 3600000 * 6;

      const batchInput = [
        {
          customerId: 'cust_1',
          resourceId: 'resource_1',
          startAt: startAt1,
          endAt: endAt1,
          tierId: 'tier_basic',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 40.00,
            securityDeposit: 80.00,
            depositStatus: DepositStatus.PENDING,
          },
          checklistCompletions: [],
        },
        {
          customerId: 'cust_2',
          resourceId: 'resource_2',
          startAt: startAt2,
          endAt: endAt2,
          tierId: 'tier_premium',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 75.00,
            securityDeposit: 150.00,
            depositStatus: DepositStatus.PENDING,
          },
          checklistCompletions: [],
        },
      ];

      const mockReservations: RentalReservation[] = [
        {
          id: 'rental_1',
          customerId: 'cust_1',
          resourceId: 'resource_1',
          startAt: startAt1,
          endAt: endAt1,
          tierId: 'tier_basic',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 40.00,
            securityDeposit: 80.00,
            depositStatus: DepositStatus.PENDING,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rental_2',
          customerId: 'cust_2',
          resourceId: 'resource_2',
          startAt: startAt2,
          endAt: endAt2,
          tierId: 'tier_premium',
          status: RentalReservationStatus.UPCOMING,
          payment: {
            rentalCharge: 75.00,
            securityDeposit: 150.00,
            depositStatus: DepositStatus.PENDING,
          },
          checklistCompletions: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalReservation> = {
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
        .post('/rental-reservations/batch', batchInput)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalReservations.createBatch(batchInput);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('rental_1');
      expect(result.data[1].id).toBe('rental_2');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const startAt = Date.now() + 86400000;
      const endAt = startAt + 3600000 * 2;

      const batchInput = Array.from({ length: 51 }, (_, i) => ({
        customerId: `cust_${i}`,
        resourceId: `resource_${i}`,
        startAt,
        endAt,
        tierId: 'tier_basic',
        status: RentalReservationStatus.UPCOMING,
        payment: {
          rentalCharge: 30.00,
          securityDeposit: 50.00,
          depositStatus: DepositStatus.PENDING,
        },
        checklistCompletions: [],
      }));

      await expect(
        client.rentalReservations.createBatch(batchInput)
      ).rejects.toThrow(WiilValidationError);
    });
  });
});
