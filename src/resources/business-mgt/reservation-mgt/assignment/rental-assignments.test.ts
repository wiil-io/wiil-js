/**
 * @fileoverview Tests for Rental Assignments resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../../client/WiilClient';
import {
  RentalAssignment,
  PaginatedResultType,
  RentalAssignmentType,
  RentalAssignmentStatus,
} from 'wiil-core-js';
import { WiilAPIError } from '../../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('RentalAssignmentsResource', () => {
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
    it('should create a rental assignment with soft lock', async () => {
      const slotStart = Date.now();
      const slotEnd = slotStart + 172800000; // 2 days later
      const input = {
        locationId: 'loc_123',
        reservationId: 'res_456',
        rentalInstanceId: 'rni_789',
        slotStart,
        slotEnd,
        assignmentType: RentalAssignmentType.SOFT,
        assignedAt: Date.now(),
        assignedBy: 'user_123',
      };

      const mockResponse: RentalAssignment = {
        id: 'rna_123',
        locationId: 'loc_123',
        reservationId: 'res_456',
        rentalInstanceId: 'rni_789',
        slotStart,
        slotEnd,
        assignmentType: RentalAssignmentType.SOFT,
        status: RentalAssignmentStatus.ASSIGNED,
        assignedAt: input.assignedAt,
        assignedBy: 'user_123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-assignments', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.create(input);

      expect(result.id).toBe('rna_123');
      expect(result.reservationId).toBe('res_456');
      expect(result.rentalInstanceId).toBe('rni_789');
      expect(result.assignmentType).toBe(RentalAssignmentType.SOFT);
      expect(result.status).toBe(RentalAssignmentStatus.ASSIGNED);
    });

    it('should create a rental assignment with hard lock and pickup condition', async () => {
      const pickupTime = Date.now();
      const slotStart = pickupTime;
      const slotEnd = slotStart + 172800000; // 2 days later
      const input = {
        reservationId: 'res_789',
        rentalInstanceId: 'rni_101',
        slotStart,
        slotEnd,
        assignmentType: RentalAssignmentType.HARD,
        assignedAt: pickupTime,
        assignedBy: 'user_123',
        conditionAtPickup: {
          recordedAt: pickupTime,
          recordedBy: 'user_123',
          notes: 'Minor scratches on rear bumper',
          damageReported: false,
          imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
        },
        notes: 'Customer ID verified',
      };

      const mockResponse: RentalAssignment = {
        id: 'rna_456',
        reservationId: 'res_789',
        rentalInstanceId: 'rni_101',
        slotStart,
        slotEnd,
        assignmentType: RentalAssignmentType.HARD,
        status: RentalAssignmentStatus.ASSIGNED,
        assignedAt: pickupTime,
        assignedBy: 'user_123',
        conditionAtPickup: {
          recordedAt: pickupTime,
          recordedBy: 'user_123',
          notes: 'Minor scratches on rear bumper',
          damageReported: false,
          imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
        },
        notes: 'Customer ID verified',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-assignments', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.create(input);

      expect(result.id).toBe('rna_456');
      expect(result.assignmentType).toBe(RentalAssignmentType.HARD);
      expect(result.conditionAtPickup?.notes).toBe('Minor scratches on rear bumper');
      expect(result.conditionAtPickup?.damageReported).toBe(false);
      expect(result.conditionAtPickup?.imageUrls).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should retrieve a rental assignment by ID', async () => {
      const mockResponse: RentalAssignment = {
        id: 'rna_123',
        reservationId: 'res_456',
        rentalInstanceId: 'rni_789',
        assignmentType: RentalAssignmentType.SOFT,
        status: RentalAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/rental-assignments/rna_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.get('rna_123');

      expect(result.id).toBe('rna_123');
      expect(result.reservationId).toBe('res_456');
      expect(result.rentalInstanceId).toBe('rni_789');
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .get('/rental-assignments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Rental assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.rentalAssignments.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByReservation', () => {
    it('should retrieve rental assignments by reservation', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_1',
          reservationId: 'res_123',
          rentalInstanceId: 'rni_1',
          assignmentType: RentalAssignmentType.SOFT,
          status: RentalAssignmentStatus.RELEASED,
          assignedAt: Date.now() - 172800000,
          releasedAt: Date.now() - 86400000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rna_2',
          reservationId: 'res_123',
          rentalInstanceId: 'rni_2',
          assignmentType: RentalAssignmentType.HARD,
          status: RentalAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalAssignment> = {
        data: mockAssignments,
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
        .get('/rental-assignments/by-reservation/res_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByReservation('res_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.reservationId === 'res_123')).toBe(true);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should retrieve rental assignments by reservation with pagination', async () => {
      const mockResponse: PaginatedResultType<RentalAssignment> = {
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
        .get('/rental-assignments/by-reservation/res_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByReservation('res_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByRentalInstance', () => {
    it('should retrieve rental assignments by rental instance', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_1',
          reservationId: 'res_1',
          rentalInstanceId: 'rni_123',
          assignmentType: RentalAssignmentType.SOFT,
          status: RentalAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalAssignment> = {
        data: mockAssignments,
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
        .get('/rental-assignments/by-rental-instance/rni_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByRentalInstance('rni_123');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].rentalInstanceId).toBe('rni_123');
    });

    it('should retrieve rental assignments by rental instance with pagination', async () => {
      const mockResponse: PaginatedResultType<RentalAssignment> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 15,
          totalCount: 30,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/rental-assignments/by-rental-instance/rni_123')
        .query({ page: '1', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByRentalInstance('rni_123', {
        page: 1,
        pageSize: 15,
      });

      expect(result.meta.totalCount).toBe(30);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByStatus', () => {
    it('should retrieve rental assignments by status', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_1',
          reservationId: 'res_1',
          rentalInstanceId: 'rni_1',
          assignmentType: RentalAssignmentType.HARD,
          status: RentalAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rna_2',
          reservationId: 'res_2',
          rentalInstanceId: 'rni_2',
          assignmentType: RentalAssignmentType.SOFT,
          status: RentalAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalAssignment> = {
        data: mockAssignments,
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
        .get('/rental-assignments/by-status')
        .query({ status: 'assigned' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByStatus(RentalAssignmentStatus.ASSIGNED);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.status === RentalAssignmentStatus.ASSIGNED)).toBe(true);
    });

    it('should retrieve released rental assignments with pagination', async () => {
      const mockResponse: PaginatedResultType<RentalAssignment> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 25,
          totalCount: 100,
          totalPages: 4,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/rental-assignments/by-status')
        .query({ status: 'released', page: '1', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByStatus(
        RentalAssignmentStatus.RELEASED,
        { page: 1, pageSize: 25 }
      );

      expect(result.meta.totalCount).toBe(100);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getWithDamage', () => {
    it('should retrieve rental assignments with damage reported', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_1',
          reservationId: 'res_1',
          rentalInstanceId: 'rni_1',
          assignmentType: RentalAssignmentType.HARD,
          status: RentalAssignmentStatus.RELEASED,
          assignedAt: Date.now() - 172800000,
          releasedAt: Date.now(),
          conditionAtReturn: {
            recordedAt: Date.now(),
            recordedBy: 'user_456',
            notes: 'New scratch on driver door',
            damageReported: true,
            imageUrls: ['https://example.com/damage1.jpg'],
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalAssignment> = {
        data: mockAssignments,
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
        .get('/rental-assignments/with-damage')
        .query({ damageReported: 'true' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getWithDamage();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].conditionAtReturn?.damageReported).toBe(true);
    });

    it('should retrieve damaged rentals with pagination', async () => {
      const mockResponse: PaginatedResultType<RentalAssignment> = {
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
        .get('/rental-assignments/with-damage')
        .query({ damageReported: 'true', page: '2', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getWithDamage({ page: 2, pageSize: 15 });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a rental assignment with return condition', async () => {
      const returnTime = Date.now();
      const updateData = {
        id: 'rna_123',
        conditionAtReturn: {
          recordedAt: returnTime,
          recordedBy: 'user_456',
          notes: 'New scratch on driver door',
          damageReported: true,
          imageUrls: ['https://example.com/damage1.jpg'],
        },
        status: RentalAssignmentStatus.RELEASED,
        releasedAt: returnTime,
        releasedBy: 'user_456',
      };

      const mockResponse: RentalAssignment = {
        id: 'rna_123',
        reservationId: 'res_456',
        rentalInstanceId: 'rni_789',
        assignmentType: RentalAssignmentType.HARD,
        status: RentalAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 172800000,
        releasedAt: returnTime,
        releasedBy: 'user_456',
        conditionAtReturn: {
          recordedAt: returnTime,
          recordedBy: 'user_456',
          notes: 'New scratch on driver door',
          damageReported: true,
          imageUrls: ['https://example.com/damage1.jpg'],
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/rental-assignments', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.update(updateData);

      expect(result.status).toBe(RentalAssignmentStatus.RELEASED);
      expect(result.conditionAtReturn?.damageReported).toBe(true);
      expect(result.conditionAtReturn?.notes).toBe('New scratch on driver door');
    });

    it('should update assignment notes', async () => {
      const updateData = {
        id: 'rna_123',
        notes: 'Customer extended rental by 2 days',
      };

      const mockResponse: RentalAssignment = {
        id: 'rna_123',
        reservationId: 'res_456',
        rentalInstanceId: 'rni_789',
        assignmentType: RentalAssignmentType.SOFT,
        status: RentalAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        notes: 'Customer extended rental by 2 days',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/rental-assignments', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.update(updateData);

      expect(result.notes).toBe('Customer extended rental by 2 days');
    });
  });

  describe('release', () => {
    it('should release a rental assignment', async () => {
      const mockResponse: RentalAssignment = {
        id: 'rna_123',
        reservationId: 'res_456',
        rentalInstanceId: 'rni_789',
        assignmentType: RentalAssignmentType.SOFT,
        status: RentalAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 172800000,
        releasedAt: Date.now(),
        releasedBy: 'user_456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-assignments/rna_123/release', { releasedBy: 'user_456' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.release('rna_123', 'user_456');

      expect(result.status).toBe(RentalAssignmentStatus.RELEASED);
      expect(result.releasedAt).toBeDefined();
      expect(result.releasedBy).toBe('user_456');
    });

    it('should release a rental assignment without specifying user', async () => {
      const mockResponse: RentalAssignment = {
        id: 'rna_123',
        reservationId: 'res_456',
        rentalInstanceId: 'rni_789',
        assignmentType: RentalAssignmentType.SOFT,
        status: RentalAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 172800000,
        releasedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/rental-assignments/rna_123/release', { releasedBy: undefined })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.release('rna_123');

      expect(result.status).toBe(RentalAssignmentStatus.RELEASED);
    });
  });

  describe('delete', () => {
    it('should delete a rental assignment', async () => {
      nock(BASE_URL)
        .delete('/rental-assignments/rna_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.delete('rna_123');
      expect(result).toBe(true);
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .delete('/rental-assignments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Rental assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.rentalAssignments.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list rental assignments with pagination', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_1',
          reservationId: 'res_1',
          rentalInstanceId: 'rni_1',
          assignmentType: RentalAssignmentType.SOFT,
          status: RentalAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rna_2',
          reservationId: 'res_2',
          rentalInstanceId: 'rni_2',
          assignmentType: RentalAssignmentType.HARD,
          status: RentalAssignmentStatus.RELEASED,
          assignedAt: Date.now() - 172800000,
          releasedAt: Date.now() - 86400000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RentalAssignment> = {
        data: mockAssignments,
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
        .get('/rental-assignments')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list rental assignments with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<RentalAssignment> = {
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
        .get('/rental-assignments')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
