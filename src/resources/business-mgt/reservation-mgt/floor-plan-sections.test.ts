/**
 * @fileoverview Tests for Floor Plan Sections resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { Section, TablePlacement, PaginatedResultType, TableShape } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('FloorPlanSectionsResource', () => {
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
    it('should create a new floor plan section', async () => {
      const input = {
        locationId: 'loc_123',
        floorPlanId: 'fp_123',
        name: 'Window Section',
        capacity: 24,
        color: '#3B82F6',
        isActive: true,
        sortOrder: 1,
        tables: [],
      };

      const mockResponse: Section = {
        id: 'sec_123',
        locationId: 'loc_123',
        floorPlanId: 'fp_123',
        name: 'Window Section',
        capacity: 24,
        color: '#3B82F6',
        isActive: true,
        sortOrder: 1,
        tables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/floor-plan-sections', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.create(input);

      expect(result.id).toBe('sec_123');
      expect(result.name).toBe('Window Section');
      expect(result.capacity).toBe(24);
      expect(result.color).toBe('#3B82F6');
      expect(result.isActive).toBe(true);
    });

    it('should create a section with geometry', async () => {
      const input = {
        locationId: 'loc_456',
        floorPlanId: 'fp_456',
        name: 'VIP Area',
        capacity: 16,
        color: '#EF4444',
        isActive: true,
        sortOrder: 0,
        tables: [],
        geometry: {
          kind: 'rect' as const,
          x: 100,
          y: 200,
          width: 400,
          height: 300,
          rotation: 0,
        },
      };

      const mockResponse: Section = {
        id: 'sec_vip_001',
        locationId: 'loc_456',
        floorPlanId: 'fp_456',
        name: 'VIP Area',
        capacity: 16,
        color: '#EF4444',
        isActive: true,
        sortOrder: 0,
        tables: [],
        geometry: {
          kind: 'rect',
          x: 100,
          y: 200,
          width: 400,
          height: 300,
          rotation: 0,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/floor-plan-sections', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.create(input);

      expect(result.id).toBe('sec_vip_001');
      expect(result.geometry?.kind).toBe('rect');
      expect((result.geometry as { x: number }).x).toBe(100);
    });
  });

  describe('get', () => {
    it('should retrieve a section by ID', async () => {
      const mockResponse: Section = {
        id: 'sec_123',
        locationId: 'loc_123',
        floorPlanId: 'fp_123',
        name: 'Main Section',
        capacity: 30,
        color: '#10B981',
        isActive: true,
        sortOrder: 1,
        tables: [
          {
            id: 'tp_1',
            tableResourceId: 'table_res_1',
            floorPlanSectionId: 'sec_123',
            number: 'T1',
            x: 100,
            y: 150,
            width: 80,
            height: 80,
            shape: TableShape.ROUND,
            minParty: 2,
            maxParty: 4,
            combinableWith: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/floor-plan-sections/sec_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.get('sec_123');

      expect(result.id).toBe('sec_123');
      expect(result.name).toBe('Main Section');
      expect(result.tables).toHaveLength(1);
      expect(result.tables[0].number).toBe('T1');
    });

    it('should throw API error when section not found', async () => {
      nock(BASE_URL)
        .get('/floor-plan-sections/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Floor plan section not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.floorPlanSections.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByFloorPlan', () => {
    it('should retrieve sections by floor plan ID', async () => {
      const mockSections: Section[] = [
        {
          id: 'sec_1',
          locationId: 'loc_123',
          floorPlanId: 'fp_123',
          name: 'Section A',
          capacity: 20,
          color: '#3B82F6',
          isActive: true,
          sortOrder: 1,
          tables: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sec_2',
          locationId: 'loc_123',
          floorPlanId: 'fp_123',
          name: 'Section B',
          capacity: 25,
          color: '#10B981',
          isActive: true,
          sortOrder: 2,
          tables: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Section> = {
        data: mockSections,
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
        .get('/floor-plan-sections/by-floor-plan/fp_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.getByFloorPlan('fp_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(s => s.floorPlanId === 'fp_123')).toBe(true);
    });

    it('should get sections by floor plan with pagination', async () => {
      const mockResponse: PaginatedResultType<Section> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 12,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/floor-plan-sections/by-floor-plan/fp_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.getByFloorPlan('fp_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getByLocation', () => {
    it('should retrieve sections by location ID', async () => {
      const mockSections: Section[] = [
        {
          id: 'sec_1',
          locationId: 'loc_123',
          floorPlanId: 'fp_1',
          name: 'Main Section',
          capacity: 30,
          color: '#3B82F6',
          isActive: true,
          sortOrder: 1,
          tables: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sec_2',
          locationId: 'loc_123',
          floorPlanId: 'fp_2',
          name: 'Patio Section',
          capacity: 20,
          color: '#F59E0B',
          isActive: true,
          sortOrder: 1,
          tables: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Section> = {
        data: mockSections,
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
        .get('/floor-plan-sections/by-location/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.getByLocation('loc_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(s => s.locationId === 'loc_123')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a section', async () => {
      const updateData = {
        id: 'sec_123',
        name: 'VIP Section',
        capacity: 12,
        color: '#EF4444',
      };

      const mockResponse: Section = {
        id: 'sec_123',
        locationId: 'loc_123',
        floorPlanId: 'fp_123',
        name: 'VIP Section',
        capacity: 12,
        color: '#EF4444',
        isActive: true,
        sortOrder: 1,
        tables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/floor-plan-sections', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.update(updateData);

      expect(result.name).toBe('VIP Section');
      expect(result.capacity).toBe(12);
      expect(result.color).toBe('#EF4444');
    });

    it('should deactivate a section', async () => {
      const updateData = {
        id: 'sec_123',
        isActive: false,
      };

      const mockResponse: Section = {
        id: 'sec_123',
        locationId: 'loc_123',
        floorPlanId: 'fp_123',
        name: 'Old Section',
        capacity: 20,
        color: '#9CA3AF',
        isActive: false,
        sortOrder: 1,
        tables: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/floor-plan-sections', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.update(updateData);

      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a section', async () => {
      nock(BASE_URL)
        .delete('/floor-plan-sections/sec_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.delete('sec_123');
      expect(result).toBe(true);
    });

    it('should throw API error when section not found', async () => {
      nock(BASE_URL)
        .delete('/floor-plan-sections/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Floor plan section not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.floorPlanSections.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list sections with pagination', async () => {
      const mockSections: Section[] = [
        {
          id: 'sec_1',
          locationId: 'loc_1',
          floorPlanId: 'fp_1',
          name: 'Section 1',
          capacity: 20,
          color: '#3B82F6',
          isActive: true,
          sortOrder: 1,
          tables: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sec_2',
          locationId: 'loc_2',
          floorPlanId: 'fp_2',
          name: 'Section 2',
          capacity: 25,
          color: '#10B981',
          isActive: true,
          sortOrder: 1,
          tables: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Section> = {
        data: mockSections,
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
        .get('/floor-plan-sections')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list sections with custom pagination', async () => {
      const mockResponse: PaginatedResultType<Section> = {
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
        .get('/floor-plan-sections')
        .query({ page: '3', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.list({
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(15);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  // Table Placement Methods

  describe('addTablePlacement', () => {
    it('should add a table placement to a section', async () => {
      const input = {
        tableResourceId: 'table_res_456',
        floorPlanSectionId: 'sec_123',
        number: 'T5',
        x: 200,
        y: 300,
        width: 80,
        height: 80,
        shape: TableShape.ROUND,
        minParty: 2,
        maxParty: 4,
        combinableWith: [],
      };

      const mockResponse: TablePlacement = {
        id: 'tp_456',
        tableResourceId: 'table_res_456',
        floorPlanSectionId: 'sec_123',
        number: 'T5',
        x: 200,
        y: 300,
        width: 80,
        height: 80,
        shape: TableShape.ROUND,
        minParty: 2,
        maxParty: 4,
        combinableWith: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/floor-plan-sections/sec_123/tables', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.addTablePlacement('sec_123', input);

      expect(result.id).toBe('tp_456');
      expect(result.number).toBe('T5');
      expect(result.shape).toBe(TableShape.ROUND);
      expect(result.minParty).toBe(2);
      expect(result.maxParty).toBe(4);
    });

    it('should add a booth table placement', async () => {
      const input = {
        tableResourceId: 'table_res_booth_01',
        floorPlanSectionId: 'sec_123',
        number: 'B1',
        x: 50,
        y: 100,
        width: 120,
        height: 60,
        shape: TableShape.BOOTH,
        rotation: 0,
        minParty: 2,
        maxParty: 6,
        combinableWith: ['table_res_booth_02'],
        serverSectionId: 'server_sec_1',
      };

      const mockResponse: TablePlacement = {
        id: 'tp_booth_001',
        tableResourceId: 'table_res_booth_01',
        floorPlanSectionId: 'sec_123',
        number: 'B1',
        x: 50,
        y: 100,
        width: 120,
        height: 60,
        shape: TableShape.BOOTH,
        rotation: 0,
        minParty: 2,
        maxParty: 6,
        combinableWith: ['table_res_booth_02'],
        serverSectionId: 'server_sec_1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/floor-plan-sections/sec_123/tables', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.addTablePlacement('sec_123', input);

      expect(result.id).toBe('tp_booth_001');
      expect(result.shape).toBe(TableShape.BOOTH);
      expect(result.combinableWith).toContain('table_res_booth_02');
      expect(result.serverSectionId).toBe('server_sec_1');
    });
  });

  describe('getTablePlacement', () => {
    it('should retrieve a table placement by ID', async () => {
      const mockResponse: TablePlacement = {
        id: 'tp_123',
        tableResourceId: 'table_res_123',
        floorPlanSectionId: 'sec_123',
        number: 'T1',
        x: 100,
        y: 150,
        width: 80,
        height: 80,
        shape: TableShape.SQUARE,
        minParty: 2,
        maxParty: 4,
        combinableWith: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/floor-plan-sections/sec_123/tables/tp_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.getTablePlacement('sec_123', 'tp_123');

      expect(result.id).toBe('tp_123');
      expect(result.number).toBe('T1');
      expect(result.shape).toBe(TableShape.SQUARE);
    });

    it('should throw API error when table placement not found', async () => {
      nock(BASE_URL)
        .get('/floor-plan-sections/sec_123/tables/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Table placement not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.floorPlanSections.getTablePlacement('sec_123', 'invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('updateTablePlacement', () => {
    it('should update a table placement', async () => {
      const updateData = {
        id: 'tp_123',
        x: 150,
        y: 250,
        maxParty: 6,
      };

      const mockResponse: TablePlacement = {
        id: 'tp_123',
        tableResourceId: 'table_res_123',
        floorPlanSectionId: 'sec_123',
        number: 'T1',
        x: 150,
        y: 250,
        width: 80,
        height: 80,
        shape: TableShape.ROUND,
        minParty: 2,
        maxParty: 6,
        combinableWith: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/floor-plan-sections/sec_123/tables', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.updateTablePlacement('sec_123', updateData);

      expect(result.x).toBe(150);
      expect(result.y).toBe(250);
      expect(result.maxParty).toBe(6);
    });

    it('should update table placement shape and rotation', async () => {
      const updateData = {
        id: 'tp_123',
        shape: TableShape.HIGH_TOP,
        rotation: 45,
      };

      const mockResponse: TablePlacement = {
        id: 'tp_123',
        tableResourceId: 'table_res_123',
        floorPlanSectionId: 'sec_123',
        number: 'HT1',
        x: 100,
        y: 150,
        width: 60,
        height: 60,
        shape: TableShape.HIGH_TOP,
        rotation: 45,
        minParty: 2,
        maxParty: 4,
        combinableWith: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/floor-plan-sections/sec_123/tables', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.updateTablePlacement('sec_123', updateData);

      expect(result.shape).toBe(TableShape.HIGH_TOP);
      expect(result.rotation).toBe(45);
    });
  });

  describe('removeTablePlacement', () => {
    it('should remove a table placement from a section', async () => {
      nock(BASE_URL)
        .delete('/floor-plan-sections/sec_123/tables/tp_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlanSections.removeTablePlacement('sec_123', 'tp_456');
      expect(result).toBe(true);
    });

    it('should throw API error when table placement not found', async () => {
      nock(BASE_URL)
        .delete('/floor-plan-sections/sec_123/tables/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Table placement not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.floorPlanSections.removeTablePlacement('sec_123', 'invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });
});
