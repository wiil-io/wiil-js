/**
 * @fileoverview Tests for Room Assignments resource (read-only).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../../client/WiilClient';
import {
  RoomAssignment,
  PaginatedResultType,
  RoomAssignmentType,
  RoomAssignmentStatus,
} from 'wiil-core-js';
import { WiilAPIError } from '../../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('RoomAssignmentsResource', () => {
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
    it('should retrieve a room assignment by ID', async () => {
      const mockResponse: RoomAssignment = {
        id: 'ra_123',
        locationId: 'loc_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        slotStart: Date.now(),
        slotEnd: Date.now() + 86400000,
        assignmentType: RoomAssignmentType.SOFT,
        status: RoomAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        assignedBy: 'user_123',
        housekeepingNotes: 'Extra towels requested',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/room-assignments/ra_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.get('ra_123');

      expect(result.id).toBe('ra_123');
      expect(result.reservationId).toBe('res_456');
      expect(result.roomInstanceId).toBe('ri_789');
      expect(result.status).toBe(RoomAssignmentStatus.ASSIGNED);
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .get('/room-assignments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Room assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.roomAssignments.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByReservation', () => {
    it('should retrieve room assignments by reservation', async () => {
      const mockAssignments: RoomAssignment[] = [
        {
          id: 'ra_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          roomInstanceId: 'ri_789',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RoomAssignmentType.SOFT,
          status: RoomAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomAssignment> = {
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
        .get('/room-assignments/by-reservation/res_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByReservation('res_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].reservationId).toBe('res_456');
    });
  });

  describe('getByRoomInstance', () => {
    it('should retrieve room assignments by room instance', async () => {
      const mockAssignments: RoomAssignment[] = [
        {
          id: 'ra_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          roomInstanceId: 'ri_789',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RoomAssignmentType.HARD,
          status: RoomAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomAssignment> = {
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
        .get('/room-assignments/by-room-instance/ri_789')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByRoomInstance('ri_789');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].roomInstanceId).toBe('ri_789');
    });
  });

  describe('getByStatus', () => {
    it('should retrieve room assignments by status', async () => {
      const mockAssignments: RoomAssignment[] = [
        {
          id: 'ra_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          roomInstanceId: 'ri_789',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RoomAssignmentType.SOFT,
          status: RoomAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomAssignment> = {
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
        .get('/room-assignments/by-status')
        .query({ status: RoomAssignmentStatus.ASSIGNED })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByStatus(RoomAssignmentStatus.ASSIGNED);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(RoomAssignmentStatus.ASSIGNED);
    });
  });

  describe('list', () => {
    it('should list room assignments with pagination', async () => {
      const mockAssignments: RoomAssignment[] = [
        {
          id: 'ra_1',
          locationId: 'loc_123',
          reservationId: 'res_1',
          roomInstanceId: 'ri_1',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RoomAssignmentType.SOFT,
          status: RoomAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ra_2',
          locationId: 'loc_123',
          reservationId: 'res_2',
          roomInstanceId: 'ri_2',
          slotStart: Date.now(),
          slotEnd: Date.now() + 86400000,
          assignmentType: RoomAssignmentType.HARD,
          status: RoomAssignmentStatus.RELEASED,
          assignedAt: Date.now(),
          releasedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<RoomAssignment> = {
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
        .get('/room-assignments')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list room assignments with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<RoomAssignment> = {
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
        .get('/room-assignments')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.list({ page: 2, pageSize: 50 });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
    });
  });
});
