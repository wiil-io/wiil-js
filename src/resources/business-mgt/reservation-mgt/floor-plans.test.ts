/**
 * @fileoverview Tests for Floor Plans resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { FloorPlan, FloorPlanDefinition, PaginatedResultType, CanvasUnit, TableShape } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('FloorPlansResource', () => {
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
    it('should create a new floor plan', async () => {
      const input = {
        locationId: 'loc_123',
        name: 'Main Dining Room',
        description: 'Primary dining area with 20 tables',
        capacity: 80,
        canvasDimensions: {
          width: 1000,
          height: 800,
          unit: CanvasUnit.PX,
        },
        isActive: true,
      };

      const mockResponse: FloorPlan = {
        id: 'fp_123',
        locationId: 'loc_123',
        name: 'Main Dining Room',
        description: 'Primary dining area with 20 tables',
        capacity: 80,
        canvasDimensions: {
          width: 1000,
          height: 800,
          unit: CanvasUnit.PX,
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/floor-plans', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.create(input);

      expect(result.id).toBe('fp_123');
      expect(result.name).toBe('Main Dining Room');
      expect(result.capacity).toBe(80);
      expect(result.canvasDimensions.width).toBe(1000);
      expect(result.isActive).toBe(true);
    });

    it('should create a floor plan with images and metadata', async () => {
      const input = {
        locationId: 'loc_456',
        name: 'Rooftop Patio',
        description: 'Outdoor seating area with city views',
        capacity: 40,
        canvasDimensions: {
          width: 800,
          height: 600,
          unit: CanvasUnit.FT,
        },
        imageUrls: [
          'https://example.com/images/rooftop-1.jpg',
          'https://example.com/images/rooftop-2.jpg',
        ],
        isActive: true,
        metadata: {
          theme: 'outdoor',
          season: 'summer',
        },
      };

      const mockResponse: FloorPlan = {
        id: 'fp_rooftop_001',
        locationId: 'loc_456',
        name: 'Rooftop Patio',
        description: 'Outdoor seating area with city views',
        capacity: 40,
        canvasDimensions: {
          width: 800,
          height: 600,
          unit: CanvasUnit.FT,
        },
        imageUrls: [
          'https://example.com/images/rooftop-1.jpg',
          'https://example.com/images/rooftop-2.jpg',
        ],
        isActive: true,
        metadata: {
          theme: 'outdoor',
          season: 'summer',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/floor-plans', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.create(input);

      expect(result.id).toBe('fp_rooftop_001');
      expect(result.imageUrls).toHaveLength(2);
      expect(result.metadata?.theme).toBe('outdoor');
      expect(result.canvasDimensions.unit).toBe(CanvasUnit.FT);
    });
  });

  describe('get', () => {
    it('should retrieve a floor plan by ID', async () => {
      const mockResponse: FloorPlan = {
        id: 'fp_123',
        locationId: 'loc_123',
        name: 'Main Floor',
        description: 'Ground floor dining area',
        capacity: 60,
        canvasDimensions: {
          width: 1200,
          height: 900,
          unit: CanvasUnit.PX,
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/floor-plans/fp_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.get('fp_123');

      expect(result.id).toBe('fp_123');
      expect(result.name).toBe('Main Floor');
      expect(result.capacity).toBe(60);
    });

    it('should throw API error when floor plan not found', async () => {
      nock(BASE_URL)
        .get('/floor-plans/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Floor plan not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.floorPlans.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByLocation', () => {
    it('should retrieve floor plans by location ID', async () => {
      const mockFloorPlans: FloorPlan[] = [
        {
          id: 'fp_1',
          locationId: 'loc_123',
          name: 'Main Floor',
          description: 'Ground floor',
          capacity: 60,
          canvasDimensions: { width: 1000, height: 800, unit: CanvasUnit.PX },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'fp_2',
          locationId: 'loc_123',
          name: 'Mezzanine',
          description: 'Upper level',
          capacity: 30,
          canvasDimensions: { width: 600, height: 500, unit: CanvasUnit.PX },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<FloorPlan> = {
        data: mockFloorPlans,
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
        .get('/floor-plans/by-location/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.getByLocation('loc_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(fp => fp.locationId === 'loc_123')).toBe(true);
    });

    it('should get floor plans by location with pagination', async () => {
      const mockResponse: PaginatedResultType<FloorPlan> = {
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
        .get('/floor-plans/by-location/loc_123')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.getByLocation('loc_123', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('getActive', () => {
    it('should retrieve active floor plans', async () => {
      const mockFloorPlans: FloorPlan[] = [
        {
          id: 'fp_active_1',
          locationId: 'loc_123',
          name: 'Active Floor 1',
          description: 'Active dining area',
          capacity: 50,
          canvasDimensions: { width: 800, height: 600, unit: CanvasUnit.PX },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'fp_active_2',
          locationId: 'loc_456',
          name: 'Active Floor 2',
          description: 'Active bar area',
          capacity: 30,
          canvasDimensions: { width: 600, height: 400, unit: CanvasUnit.PX },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<FloorPlan> = {
        data: mockFloorPlans,
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
        .get('/floor-plans/active')
        .query({ isActive: 'true' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.getActive();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(fp => fp.isActive === true)).toBe(true);
    });

    it('should get active floor plans with pagination', async () => {
      const mockResponse: PaginatedResultType<FloorPlan> = {
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
        .get('/floor-plans/active')
        .query({ isActive: 'true', page: '3', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.getActive({
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('update', () => {
    it('should update a floor plan', async () => {
      const updateData = {
        id: 'fp_123',
        name: 'Main Dining - Updated',
        capacity: 100,
        description: 'Expanded dining area',
      };

      const mockResponse: FloorPlan = {
        id: 'fp_123',
        locationId: 'loc_123',
        name: 'Main Dining - Updated',
        description: 'Expanded dining area',
        capacity: 100,
        canvasDimensions: {
          width: 1200,
          height: 1000,
          unit: CanvasUnit.PX,
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/floor-plans', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.update(updateData);

      expect(result.name).toBe('Main Dining - Updated');
      expect(result.capacity).toBe(100);
      expect(result.description).toBe('Expanded dining area');
    });

    it('should deactivate a floor plan', async () => {
      const updateData = {
        id: 'fp_123',
        isActive: false,
      };

      const mockResponse: FloorPlan = {
        id: 'fp_123',
        locationId: 'loc_123',
        name: 'Old Floor Plan',
        description: 'Retired layout',
        capacity: 50,
        canvasDimensions: {
          width: 800,
          height: 600,
          unit: CanvasUnit.PX,
        },
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/floor-plans', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.update(updateData);

      expect(result.isActive).toBe(false);
    });

    it('should update floor plan canvas dimensions', async () => {
      const updateData = {
        id: 'fp_123',
        canvasDimensions: {
          width: 1500,
          height: 1200,
          unit: CanvasUnit.M,
        },
      };

      const mockResponse: FloorPlan = {
        id: 'fp_123',
        locationId: 'loc_123',
        name: 'Large Venue',
        description: 'Event space',
        capacity: 200,
        canvasDimensions: {
          width: 1500,
          height: 1200,
          unit: CanvasUnit.M,
        },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/floor-plans', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.update(updateData);

      expect(result.canvasDimensions.width).toBe(1500);
      expect(result.canvasDimensions.height).toBe(1200);
      expect(result.canvasDimensions.unit).toBe(CanvasUnit.M);
    });
  });

  describe('delete', () => {
    it('should delete a floor plan', async () => {
      nock(BASE_URL)
        .delete('/floor-plans/fp_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.delete('fp_123');
      expect(result).toBe(true);
    });

    it('should throw API error when floor plan not found', async () => {
      nock(BASE_URL)
        .delete('/floor-plans/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Floor plan not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.floorPlans.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list floor plans with pagination', async () => {
      const mockFloorPlans: FloorPlan[] = [
        {
          id: 'fp_1',
          locationId: 'loc_1',
          name: 'Floor 1',
          description: 'First floor',
          capacity: 50,
          canvasDimensions: { width: 800, height: 600, unit: CanvasUnit.PX },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'fp_2',
          locationId: 'loc_2',
          name: 'Floor 2',
          description: 'Second floor',
          capacity: 40,
          canvasDimensions: { width: 700, height: 500, unit: CanvasUnit.PX },
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<FloorPlan> = {
        data: mockFloorPlans,
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
        .get('/floor-plans')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list floor plans with custom pagination', async () => {
      const mockResponse: PaginatedResultType<FloorPlan> = {
        data: [],
        meta: {
          page: 4,
          pageSize: 25,
          totalCount: 90,
          totalPages: 4,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/floor-plans')
        .query({ page: '4', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.list({
        page: 4,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(4);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createDefinition', () => {
    it('should atomically create a floor plan with sections and table placements', async () => {
      const input = {
        name: 'Main Dining',
        description: 'Primary dining area',
        capacity: 20,
        canvasDimensions: { width: 800, height: 600, unit: CanvasUnit.PX },
        isActive: true,
        sections: [
          {
            name: 'Section A',
            capacity: 20,
            color: '#FF5733',
            isActive: true,
            sortOrder: 1,
            tables: [
              {
                number: 'T1',
                x: 100,
                y: 100,
                width: 80,
                height: 80,
                shape: TableShape.ROUND,
                minParty: 1,
                maxParty: 4,
                combinableWith: [],
              },
            ],
          },
        ],
      };

      const mockResponse: FloorPlanDefinition = {
        id: 'fp_def_123',
        name: 'Main Dining',
        description: 'Primary dining area',
        capacity: 20,
        canvasDimensions: { width: 800, height: 600, unit: CanvasUnit.PX },
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sections: [
          {
            id: 'sec_001',
            locationId: 'loc_123',
            floorPlanId: 'fp_def_123',
            name: 'Section A',
            capacity: 20,
            color: '#FF5733',
            isActive: true,
            sortOrder: 1,
            tables: [
              {
                id: 'tbl_001',
                tableResourceId: 'fp_def_123',
                floorPlanSectionId: 'sec_001',
                number: 'T1',
                x: 100,
                y: 100,
                width: 80,
                height: 80,
                shape: TableShape.ROUND,
                minParty: 1,
                maxParty: 4,
                combinableWith: [],
              },
            ],
          },
        ],
      };

      nock(BASE_URL)
        .post('/floor-plans-definition', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.floorPlans.createDefinition(input);

      expect(result.id).toBe('fp_def_123');
      expect(result.name).toBe('Main Dining');
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].name).toBe('Section A');
      expect(result.sections[0].tables).toHaveLength(1);
      expect(result.sections[0].tables[0].number).toBe('T1');
      expect(result.sections[0].tables[0].tableResourceId).toBe('fp_def_123');
    });

    it('should throw API error on invalid definition payload', async () => {
      nock(BASE_URL)
        .post('/floor-plans-definition')
        .reply(400, {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid floor plan definition' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.floorPlans.createDefinition({
          name: 'Bad',
          description: 'Missing required fields',
          capacity: 0,
          isActive: false,
          canvasDimensions: { width: 0, height: 0, unit: CanvasUnit.PX },
          sections: [],
        })
      ).rejects.toThrow(WiilAPIError);
    });
  });
});
