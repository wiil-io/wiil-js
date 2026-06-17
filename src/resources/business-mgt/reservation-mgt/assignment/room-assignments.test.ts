/**
 * @fileoverview Tests for Room Assignments resource.
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

  describe('create', () => {
    it('should create a room assignment with soft lock', async () => {
      const slotStart = Date.now();
      const slotEnd = slotStart + 86400000; // 1 day later
      const input = {
        locationId: 'loc_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        slotStart,
        slotEnd,
        assignmentType: RoomAssignmentType.SOFT,
        assignedAt: Date.now(),
        assignedBy: 'user_123',
      };

      const mockResponse: RoomAssignment = {
        id: 'ra_123',
        locationId: 'loc_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        slotStart,
        slotEnd,
        assignmentType: RoomAssignmentType.SOFT,
        status: RoomAssignmentStatus.ASSIGNED,
        assignedAt: input.assignedAt,
        assignedBy: 'user_123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-assignments', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.create(input);

      expect(result.id).toBe('ra_123');
      expect(result.reservationId).toBe('res_456');
      expect(result.roomInstanceId).toBe('ri_789');
      expect(result.assignmentType).toBe(RoomAssignmentType.SOFT);
      expect(result.status).toBe(RoomAssignmentStatus.ASSIGNED);
    });

    it('should create a room assignment with hard lock and housekeeping notes', async () => {
      const slotStart = Date.now();
      const slotEnd = slotStart + 86400000; // 1 day later
      const input = {
        reservationId: 'res_789',
        roomInstanceId: 'ri_101',
        slotStart,
        slotEnd,
        assignmentType: RoomAssignmentType.HARD,
        assignedAt: Date.now(),
        housekeepingNotes: 'Extra towels requested, late checkout approved',
        notes: 'VIP guest - honeymoon suite',
      };

      const mockResponse: RoomAssignment = {
        id: 'ra_456',
        reservationId: 'res_789',
        roomInstanceId: 'ri_101',
        slotStart,
        slotEnd,
        assignmentType: RoomAssignmentType.HARD,
        status: RoomAssignmentStatus.ASSIGNED,
        assignedAt: input.assignedAt,
        housekeepingNotes: 'Extra towels requested, late checkout approved',
        notes: 'VIP guest - honeymoon suite',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-assignments', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.create(input);

      expect(result.id).toBe('ra_456');
      expect(result.assignmentType).toBe(RoomAssignmentType.HARD);
      expect(result.housekeepingNotes).toBe('Extra towels requested, late checkout approved');
      expect(result.notes).toBe('VIP guest - honeymoon suite');
    });
  });

  describe('get', () => {
    it('should retrieve a room assignment by ID', async () => {
      const mockResponse: RoomAssignment = {
        id: 'ra_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        assignmentType: RoomAssignmentType.SOFT,
        status: RoomAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
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
          id: 'ra_1',
          reservationId: 'res_123',
          roomInstanceId: 'ri_1',
          assignmentType: RoomAssignmentType.SOFT,
          status: RoomAssignmentStatus.RELEASED,
          assignedAt: Date.now() - 86400000,
          releasedAt: Date.now() - 3600000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ra_2',
          reservationId: 'res_123',
          roomInstanceId: 'ri_2',
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
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/room-assignments/by-reservation/res_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByReservation('res_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.reservationId === 'res_123')).toBe(true);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should retrieve room assignments by reservation with pagination', async () => {
      const mockResponse: PaginatedResultType<RoomAssignment> = {
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
        .get('/room-assignments/by-reservation/res_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByReservation('res_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByRoomInstance', () => {
    it('should retrieve room assignments by room instance', async () => {
      const mockAssignments: RoomAssignment[] = [
        {
          id: 'ra_1',
          reservationId: 'res_1',
          roomInstanceId: 'ri_123',
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
        .get('/room-assignments/by-room-instance/ri_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByRoomInstance('ri_123');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].roomInstanceId).toBe('ri_123');
    });

    it('should retrieve room assignments by room instance with pagination', async () => {
      const mockResponse: PaginatedResultType<RoomAssignment> = {
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
        .get('/room-assignments/by-room-instance/ri_123')
        .query({ page: '1', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByRoomInstance('ri_123', {
        page: 1,
        pageSize: 15,
      });

      expect(result.meta.totalCount).toBe(30);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByStatus', () => {
    it('should retrieve room assignments by status', async () => {
      const mockAssignments: RoomAssignment[] = [
        {
          id: 'ra_1',
          reservationId: 'res_1',
          roomInstanceId: 'ri_1',
          assignmentType: RoomAssignmentType.HARD,
          status: RoomAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ra_2',
          reservationId: 'res_2',
          roomInstanceId: 'ri_2',
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
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/room-assignments/by-status')
        .query({ status: 'assigned' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByStatus(RoomAssignmentStatus.ASSIGNED);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.status === RoomAssignmentStatus.ASSIGNED)).toBe(true);
    });

    it('should retrieve reassigned room assignments with pagination', async () => {
      const mockResponse: PaginatedResultType<RoomAssignment> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 25,
          totalCount: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/room-assignments/by-status')
        .query({ status: 'reassigned', page: '1', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.getByStatus(
        RoomAssignmentStatus.REASSIGNED,
        { page: 1, pageSize: 25 }
      );

      expect(result.meta.totalCount).toBe(10);
    });
  });

  describe('update', () => {
    it('should update a room assignment status', async () => {
      const updateData = {
        id: 'ra_123',
        status: RoomAssignmentStatus.RELEASED,
        releasedAt: Date.now(),
        releasedBy: 'user_456',
      };

      const mockResponse: RoomAssignment = {
        id: 'ra_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        assignmentType: RoomAssignmentType.SOFT,
        status: RoomAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 86400000,
        releasedAt: updateData.releasedAt,
        releasedBy: 'user_456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/room-assignments', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.update(updateData);

      expect(result.status).toBe(RoomAssignmentStatus.RELEASED);
      expect(result.releasedBy).toBe('user_456');
    });

    it('should update housekeeping notes', async () => {
      const updateData = {
        id: 'ra_123',
        housekeepingNotes: 'Room cleaned and ready for next guest',
      };

      const mockResponse: RoomAssignment = {
        id: 'ra_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        assignmentType: RoomAssignmentType.SOFT,
        status: RoomAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        housekeepingNotes: 'Room cleaned and ready for next guest',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/room-assignments', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.update(updateData);

      expect(result.housekeepingNotes).toBe('Room cleaned and ready for next guest');
    });
  });

  describe('release', () => {
    it('should release a room assignment', async () => {
      const mockResponse: RoomAssignment = {
        id: 'ra_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        assignmentType: RoomAssignmentType.SOFT,
        status: RoomAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 86400000,
        releasedAt: Date.now(),
        releasedBy: 'user_456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-assignments/ra_123/release', { releasedBy: 'user_456' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.release('ra_123', 'user_456');

      expect(result.status).toBe(RoomAssignmentStatus.RELEASED);
      expect(result.releasedAt).toBeDefined();
      expect(result.releasedBy).toBe('user_456');
    });

    it('should release a room assignment without specifying user', async () => {
      const mockResponse: RoomAssignment = {
        id: 'ra_123',
        reservationId: 'res_456',
        roomInstanceId: 'ri_789',
        assignmentType: RoomAssignmentType.SOFT,
        status: RoomAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 86400000,
        releasedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/room-assignments/ra_123/release', { releasedBy: undefined })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.release('ra_123');

      expect(result.status).toBe(RoomAssignmentStatus.RELEASED);
    });
  });

  describe('delete', () => {
    it('should delete a room assignment', async () => {
      nock(BASE_URL)
        .delete('/room-assignments/ra_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.delete('ra_123');
      expect(result).toBe(true);
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .delete('/room-assignments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Room assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.roomAssignments.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list room assignments with pagination', async () => {
      const mockAssignments: RoomAssignment[] = [
        {
          id: 'ra_1',
          reservationId: 'res_1',
          roomInstanceId: 'ri_1',
          assignmentType: RoomAssignmentType.SOFT,
          status: RoomAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ra_2',
          reservationId: 'res_2',
          roomInstanceId: 'ri_2',
          assignmentType: RoomAssignmentType.HARD,
          status: RoomAssignmentStatus.RELEASED,
          assignedAt: Date.now() - 172800000,
          releasedAt: Date.now() - 86400000,
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
          page: 3,
          pageSize: 25,
          totalCount: 75,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/room-assignments')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.roomAssignments.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
