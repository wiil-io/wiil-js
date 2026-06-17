/**
 * @fileoverview Tests for Table Assignments resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../../client/WiilClient';
import {
  TableAssignment,
  PaginatedResultType,
  TableAssignmentType,
  TableAssignmentStatus,
} from 'wiil-core-js';
import { WiilAPIError } from '../../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('TableAssignmentsResource', () => {
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
    it('should create a table assignment with soft lock', async () => {
      const slotStart = Date.now();
      const slotEnd = slotStart + 7200000; // 2 hours later
      const input = {
        locationId: 'loc_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        floorPlanSectionId: 'sec_def',
        slotStart,
        slotEnd,
        assignmentType: TableAssignmentType.SOFT,
        assignedAt: Date.now(),
        assignedBy: 'user_123',
      };

      const mockResponse: TableAssignment = {
        id: 'ta_123',
        locationId: 'loc_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        floorPlanSectionId: 'sec_def',
        slotStart,
        slotEnd,
        assignmentType: TableAssignmentType.SOFT,
        status: TableAssignmentStatus.ASSIGNED,
        assignedAt: input.assignedAt,
        assignedBy: 'user_123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-assignments', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.create(input);

      expect(result.id).toBe('ta_123');
      expect(result.reservationId).toBe('res_456');
      expect(result.tableInstanceId).toBe('ti_789');
      expect(result.assignmentType).toBe(TableAssignmentType.SOFT);
      expect(result.status).toBe(TableAssignmentStatus.ASSIGNED);
    });

    it('should create a table assignment with hard lock', async () => {
      const slotStart = Date.now();
      const slotEnd = slotStart + 7200000; // 2 hours later
      const input = {
        reservationId: 'res_789',
        tableInstanceId: 'ti_101',
        floorPlanId: 'fp_xyz',
        slotStart,
        slotEnd,
        assignmentType: TableAssignmentType.HARD,
        assignedAt: Date.now(),
        notes: 'VIP guest - preferred table',
      };

      const mockResponse: TableAssignment = {
        id: 'ta_456',
        reservationId: 'res_789',
        tableInstanceId: 'ti_101',
        floorPlanId: 'fp_xyz',
        slotStart,
        slotEnd,
        assignmentType: TableAssignmentType.HARD,
        status: TableAssignmentStatus.ASSIGNED,
        assignedAt: input.assignedAt,
        notes: 'VIP guest - preferred table',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-assignments', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.create(input);

      expect(result.id).toBe('ta_456');
      expect(result.assignmentType).toBe(TableAssignmentType.HARD);
      expect(result.notes).toBe('VIP guest - preferred table');
    });
  });

  describe('get', () => {
    it('should retrieve a table assignment by ID', async () => {
      const mockResponse: TableAssignment = {
        id: 'ta_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        assignmentType: TableAssignmentType.SOFT,
        status: TableAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/table-assignments/ta_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.get('ta_123');

      expect(result.id).toBe('ta_123');
      expect(result.reservationId).toBe('res_456');
      expect(result.tableInstanceId).toBe('ti_789');
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .get('/table-assignments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Table assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.tableAssignments.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByReservation', () => {
    it('should retrieve table assignments by reservation', async () => {
      const mockAssignments: TableAssignment[] = [
        {
          id: 'ta_1',
          reservationId: 'res_123',
          tableInstanceId: 'ti_1',
          floorPlanId: 'fp_abc',
          assignmentType: TableAssignmentType.SOFT,
          status: TableAssignmentStatus.RELEASED,
          assignedAt: Date.now() - 3600000,
          releasedAt: Date.now() - 1800000,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ta_2',
          reservationId: 'res_123',
          tableInstanceId: 'ti_2',
          floorPlanId: 'fp_abc',
          assignmentType: TableAssignmentType.HARD,
          status: TableAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableAssignment> = {
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
        .get('/table-assignments/by-reservation/res_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByReservation('res_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.reservationId === 'res_123')).toBe(true);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should retrieve table assignments by reservation with pagination', async () => {
      const mockResponse: PaginatedResultType<TableAssignment> = {
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
        .get('/table-assignments/by-reservation/res_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByReservation('res_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByTableInstance', () => {
    it('should retrieve table assignments by table instance', async () => {
      const mockAssignments: TableAssignment[] = [
        {
          id: 'ta_1',
          reservationId: 'res_1',
          tableInstanceId: 'ti_123',
          floorPlanId: 'fp_abc',
          assignmentType: TableAssignmentType.SOFT,
          status: TableAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableAssignment> = {
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
        .get('/table-assignments/by-table-instance/ti_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByTableInstance('ti_123');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].tableInstanceId).toBe('ti_123');
    });
  });

  describe('getByStatus', () => {
    it('should retrieve table assignments by status', async () => {
      const mockAssignments: TableAssignment[] = [
        {
          id: 'ta_1',
          reservationId: 'res_1',
          tableInstanceId: 'ti_1',
          floorPlanId: 'fp_abc',
          assignmentType: TableAssignmentType.HARD,
          status: TableAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ta_2',
          reservationId: 'res_2',
          tableInstanceId: 'ti_2',
          floorPlanId: 'fp_abc',
          assignmentType: TableAssignmentType.SOFT,
          status: TableAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableAssignment> = {
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
        .get('/table-assignments/by-status')
        .query({ status: 'assigned' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByStatus(TableAssignmentStatus.ASSIGNED);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.status === TableAssignmentStatus.ASSIGNED)).toBe(true);
    });

    it('should retrieve released table assignments with pagination', async () => {
      const mockResponse: PaginatedResultType<TableAssignment> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 25,
          totalCount: 50,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/table-assignments/by-status')
        .query({ status: 'released', page: '1', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByStatus(
        TableAssignmentStatus.RELEASED,
        { page: 1, pageSize: 25 }
      );

      expect(result.meta.totalCount).toBe(50);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a table assignment status', async () => {
      const updateData = {
        id: 'ta_123',
        status: TableAssignmentStatus.RELEASED,
        releasedAt: Date.now(),
        releasedBy: 'user_456',
      };

      const mockResponse: TableAssignment = {
        id: 'ta_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        assignmentType: TableAssignmentType.SOFT,
        status: TableAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 3600000,
        releasedAt: updateData.releasedAt,
        releasedBy: 'user_456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/table-assignments', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.update(updateData);

      expect(result.status).toBe(TableAssignmentStatus.RELEASED);
      expect(result.releasedBy).toBe('user_456');
    });

    it('should update assignment notes', async () => {
      const updateData = {
        id: 'ta_123',
        notes: 'Guest requested table change due to draft',
      };

      const mockResponse: TableAssignment = {
        id: 'ta_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        assignmentType: TableAssignmentType.SOFT,
        status: TableAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        notes: 'Guest requested table change due to draft',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/table-assignments', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.update(updateData);

      expect(result.notes).toBe('Guest requested table change due to draft');
    });
  });

  describe('release', () => {
    it('should release a table assignment', async () => {
      const mockResponse: TableAssignment = {
        id: 'ta_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        assignmentType: TableAssignmentType.SOFT,
        status: TableAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 3600000,
        releasedAt: Date.now(),
        releasedBy: 'user_456',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-assignments/ta_123/release', { releasedBy: 'user_456' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.release('ta_123', 'user_456');

      expect(result.status).toBe(TableAssignmentStatus.RELEASED);
      expect(result.releasedAt).toBeDefined();
      expect(result.releasedBy).toBe('user_456');
    });

    it('should release a table assignment without specifying user', async () => {
      const mockResponse: TableAssignment = {
        id: 'ta_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        assignmentType: TableAssignmentType.SOFT,
        status: TableAssignmentStatus.RELEASED,
        assignedAt: Date.now() - 3600000,
        releasedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/table-assignments/ta_123/release', { releasedBy: undefined })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.release('ta_123');

      expect(result.status).toBe(TableAssignmentStatus.RELEASED);
    });
  });

  describe('delete', () => {
    it('should delete a table assignment', async () => {
      nock(BASE_URL)
        .delete('/table-assignments/ta_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.delete('ta_123');
      expect(result).toBe(true);
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .delete('/table-assignments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Table assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.tableAssignments.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list table assignments with pagination', async () => {
      const mockAssignments: TableAssignment[] = [
        {
          id: 'ta_1',
          reservationId: 'res_1',
          tableInstanceId: 'ti_1',
          floorPlanId: 'fp_abc',
          assignmentType: TableAssignmentType.SOFT,
          status: TableAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ta_2',
          reservationId: 'res_2',
          tableInstanceId: 'ti_2',
          floorPlanId: 'fp_abc',
          assignmentType: TableAssignmentType.HARD,
          status: TableAssignmentStatus.RELEASED,
          assignedAt: Date.now() - 7200000,
          releasedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<TableAssignment> = {
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
        .get('/table-assignments')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list table assignments with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<TableAssignment> = {
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
        .get('/table-assignments')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
