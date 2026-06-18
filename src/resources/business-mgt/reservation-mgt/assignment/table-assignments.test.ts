/**
 * @fileoverview Tests for Table Assignments resource (read-only).
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

  describe('get', () => {
    it('should retrieve a table assignment by ID', async () => {
      const mockResponse: TableAssignment = {
        id: 'ta_123',
        locationId: 'loc_123',
        reservationId: 'res_456',
        tableInstanceId: 'ti_789',
        floorPlanId: 'fp_abc',
        floorPlanSectionId: 'sec_def',
        slotStart: Date.now(),
        slotEnd: Date.now() + 7200000,
        assignmentType: TableAssignmentType.SOFT,
        status: TableAssignmentStatus.ASSIGNED,
        assignedAt: Date.now(),
        assignedBy: 'user_123',
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
      expect(result.status).toBe(TableAssignmentStatus.ASSIGNED);
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
          id: 'ta_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          tableInstanceId: 'ti_789',
          floorPlanId: 'fp_abc',
          slotStart: Date.now(),
          slotEnd: Date.now() + 7200000,
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
        .get('/table-assignments/by-reservation/res_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByReservation('res_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].reservationId).toBe('res_456');
    });
  });

  describe('getByTableInstance', () => {
    it('should retrieve table assignments by table instance', async () => {
      const mockAssignments: TableAssignment[] = [
        {
          id: 'ta_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          tableInstanceId: 'ti_789',
          floorPlanId: 'fp_abc',
          slotStart: Date.now(),
          slotEnd: Date.now() + 7200000,
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
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/table-assignments/by-table-instance/ti_789')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByTableInstance('ti_789');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].tableInstanceId).toBe('ti_789');
    });
  });

  describe('getByStatus', () => {
    it('should retrieve table assignments by status', async () => {
      const mockAssignments: TableAssignment[] = [
        {
          id: 'ta_123',
          locationId: 'loc_123',
          reservationId: 'res_456',
          tableInstanceId: 'ti_789',
          floorPlanId: 'fp_abc',
          slotStart: Date.now(),
          slotEnd: Date.now() + 7200000,
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
        .get('/table-assignments/by-status')
        .query({ status: TableAssignmentStatus.ASSIGNED })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.getByStatus(TableAssignmentStatus.ASSIGNED);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(TableAssignmentStatus.ASSIGNED);
    });
  });

  describe('list', () => {
    it('should list table assignments with pagination', async () => {
      const mockAssignments: TableAssignment[] = [
        {
          id: 'ta_1',
          locationId: 'loc_123',
          reservationId: 'res_1',
          tableInstanceId: 'ti_1',
          floorPlanId: 'fp_abc',
          slotStart: Date.now(),
          slotEnd: Date.now() + 7200000,
          assignmentType: TableAssignmentType.SOFT,
          status: TableAssignmentStatus.ASSIGNED,
          assignedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'ta_2',
          locationId: 'loc_123',
          reservationId: 'res_2',
          tableInstanceId: 'ti_2',
          floorPlanId: 'fp_abc',
          slotStart: Date.now(),
          slotEnd: Date.now() + 7200000,
          assignmentType: TableAssignmentType.HARD,
          status: TableAssignmentStatus.RELEASED,
          assignedAt: Date.now(),
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
          page: 2,
          pageSize: 50,
          totalCount: 100,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/table-assignments')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.tableAssignments.list({ page: 2, pageSize: 50 });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
    });
  });
});
