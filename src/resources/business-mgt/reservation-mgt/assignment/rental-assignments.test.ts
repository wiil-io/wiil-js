/**
 * @fileoverview Tests for Rental Assignments resource (read-only).
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

  describe('get', () => {
    it('should retrieve a rental assignment by ID', async () => {
      const mockResponse: RentalAssignment = {
        id: 'rna_123',
        locationId: 'loc_123',
        reservationId: 'res_456',
        rentalInstanceId: 'ri_789',
        slotStart: Date.now(),
        slotEnd: Date.now() + 86400000,
        assignmentType: RentalAssignmentType.SOFT,
        status: RentalAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        assignedBy: 'user_123',
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
      expect(result.rentalInstanceId).toBe('ri_789');
      expect(result.status).toBe(RentalAssignmentStatus.ASSIGNED);
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
          id: 'rna_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          rentalInstanceId: 'ri_789',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
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
        .get('/rental-assignments/by-reservation/res_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByReservation('res_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].reservationId).toBe('res_456');
    });
  });

  describe('getByRentalInstance', () => {
    it('should retrieve rental assignments by rental instance', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          rentalInstanceId: 'ri_789',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
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
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/rental-assignments/by-rental-instance/ri_789')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByRentalInstance('ri_789');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].rentalInstanceId).toBe('ri_789');
    });
  });

  describe('getByStatus', () => {
    it('should retrieve rental assignments by status', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          rentalInstanceId: 'ri_789',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
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
        .get('/rental-assignments/by-status')
        .query({ status: RentalAssignmentStatus.ASSIGNED })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.getByStatus(RentalAssignmentStatus.ASSIGNED);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(RentalAssignmentStatus.ASSIGNED);
    });
  });

  describe('getWithDamage', () => {
    it('should retrieve rental assignments with damage reported', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          rentalInstanceId: 'ri_789',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RentalAssignmentType.HARD,
          status: RentalAssignmentStatus.RELEASED,
          assignedAt: Date.now(),
          releasedAt: Date.now(),
          conditionAtReturn: {
            recordedAt: Date.now(),
            recordedBy: 'user_456',
            notes: 'Scratch on bumper',
            damageReported: true,
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
  });

  describe('list', () => {
    it('should list rental assignments with pagination', async () => {
      const mockAssignments: RentalAssignment[] = [
        {
          id: 'rna_1',
          locationId: 'loc_123',
          reservationId: 'res_1',
          rentalInstanceId: 'ri_1',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RentalAssignmentType.SOFT,
          status: RentalAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'rna_2',
          locationId: 'loc_123',
          reservationId: 'res_2',
          rentalInstanceId: 'ri_2',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RentalAssignmentType.HARD,
          status: RentalAssignmentStatus.RELEASED,
          assignedAt: Date.now(),
          releasedAt: Date.now(),
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
          page: 2,
          pageSize: 50,
          totalCount: 100,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/rental-assignments')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.rentalAssignments.list({ page: 2, pageSize: 50 });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
    });
  });
});
