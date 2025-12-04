/**
 * @fileoverview Tests for Reservation Resources resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { Resource, PaginatedResultType, ResourceType, ResourceReservationDurationUnit } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ReservationResourcesResource', () => {
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
    it('should create a TABLE resource', async () => {
      const input = {
        resourceType: ResourceType.TABLE,
        name: 'Table 5',
        description: 'Window-side table for 4 guests',
        capacity: 4,
        isAvailable: true,
        location: 'Main dining area',
        amenities: ['Window view', 'Booth seating'],
        reservationDuration: 2,
        reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
        syncEnabled: false,
      };

      const mockResponse: Resource = {
        id: 'resource_123',
        resourceType: ResourceType.TABLE,
        name: 'Table 5',
        description: 'Window-side table for 4 guests',
        capacity: 4,
        isAvailable: true,
        location: 'Main dining area',
        amenities: ['Window view', 'Booth seating'],
        reservationDuration: 2,
        reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
        syncEnabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-resources', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.create(input);

      expect(result.id).toBe('resource_123');
      expect(result.resourceType).toBe(ResourceType.TABLE);
      expect(result.name).toBe('Table 5');
      expect(result.capacity).toBe(4);
      expect(result.amenities).toEqual(['Window view', 'Booth seating']);
    });

    it('should create a ROOM resource with room-specific fields', async () => {
      const input = {
        resourceType: ResourceType.ROOM,
        name: 'Room 101',
        description: 'Deluxe ocean view suite',
        capacity: 2,
        isAvailable: true,
        location: 'Building A, Floor 1',
        amenities: ['WiFi', 'Mini-bar', 'Ocean view', 'King bed'],
        reservationDuration: 1,
        reservationDurationUnit: ResourceReservationDurationUnit.NIGHTS,
        syncEnabled: false,
        roomResource: {
          roomNumber: '101',
          roomType: 'Deluxe King',
          pricePerNight: 299.99,
          view: 'Ocean View',
          bedType: 'King',
          isSmoking: false,
          accessibilityFeatures: 'Roll-in shower, Grab bars',
        },
      };

      const mockResponse: Resource = {
        id: 'resource_456',
        resourceType: ResourceType.ROOM,
        name: 'Room 101',
        description: 'Deluxe ocean view suite',
        capacity: 2,
        isAvailable: true,
        location: 'Building A, Floor 1',
        amenities: ['WiFi', 'Mini-bar', 'Ocean view', 'King bed'],
        reservationDuration: 1,
        reservationDurationUnit: ResourceReservationDurationUnit.NIGHTS,
        roomResource: {
          roomNumber: '101',
          roomType: 'Deluxe King',
          pricePerNight: 299.99,
          view: 'Ocean View',
          bedType: 'King',
          isSmoking: false,
          accessibilityFeatures: 'Roll-in shower, Grab bars',
        },
        syncEnabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-resources', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.create(input);

      expect(result.id).toBe('resource_456');
      expect(result.resourceType).toBe(ResourceType.ROOM);
      expect(result.roomResource?.roomNumber).toBe('101');
      expect(result.roomResource?.pricePerNight).toBe(299.99);
      expect(result.roomResource?.isSmoking).toBe(false);
    });

    it('should create a RENTAL resource with rental-specific fields', async () => {
      const input = {
        resourceType: ResourceType.RENTALS,
        name: 'Conference Room A',
        description: 'Large conference room with projector',
        capacity: 12,
        isAvailable: true,
        location: 'Floor 2',
        amenities: ['Projector', 'Whiteboard', 'Video-conference'],
        reservationDuration: 1,
        reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
        syncEnabled: false,
        rentalResource: {
          itemType: 'Conference Room',
          pricePerHour: 50.00,
        },
      };

      const mockResponse: Resource = {
        id: 'resource_789',
        resourceType: ResourceType.RENTALS,
        name: 'Conference Room A',
        description: 'Large conference room with projector',
        capacity: 12,
        isAvailable: true,
        location: 'Floor 2',
        amenities: ['Projector', 'Whiteboard', 'Video-conference'],
        reservationDuration: 1,
        reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
        rentalResource: {
          itemType: 'Conference Room',
          pricePerHour: 50.00,
        },
        syncEnabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-resources', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.create(input);

      expect(result.id).toBe('resource_789');
      expect(result.resourceType).toBe(ResourceType.RENTALS);
      expect(result.rentalResource?.itemType).toBe('Conference Room');
      expect(result.rentalResource?.pricePerHour).toBe(50.00);
    });

    it('should create a resource with calendar sync', async () => {
      const input = {
        resourceType: ResourceType.ROOM,
        name: 'Room 202',
        capacity: 2,
        isAvailable: true,
        amenities: [],
        reservationDuration: 1,
        reservationDurationUnit: ResourceReservationDurationUnit.NIGHTS,
        calendarId: 'google-calendar-123',
        syncEnabled: true,
      };

      const mockResponse: Resource = {
        id: 'resource_sync',
        resourceType: ResourceType.ROOM,
        name: 'Room 202',
        capacity: 2,
        isAvailable: true,
        amenities: [],
        reservationDuration: 1,
        reservationDurationUnit: ResourceReservationDurationUnit.NIGHTS,
        calendarId: 'google-calendar-123',
        syncEnabled: true,
        lastSyncAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/reservation-resources', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.create(input);

      expect(result.calendarId).toBe('google-calendar-123');
      expect(result.syncEnabled).toBe(true);
      expect(result.lastSyncAt).toBeDefined();
    });
  });

  describe('get', () => {
    it('should retrieve a resource by ID', async () => {
      const mockResponse: Resource = {
        id: 'resource_123',
        resourceType: ResourceType.TABLE,
        name: 'Table 10',
        description: 'Private dining table',
        capacity: 6,
        isAvailable: true,
        location: 'Private room',
        amenities: ['Privacy screen', 'Premium seating'],
        reservationDuration: 2,
        reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
        syncEnabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/reservation-resources/resource_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.get('resource_123');

      expect(result.id).toBe('resource_123');
      expect(result.name).toBe('Table 10');
      expect(result.capacity).toBe(6);
    });

    it('should throw API error when resource not found', async () => {
      nock(BASE_URL)
        .get('/reservation-resources/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation resource not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.reservationResources.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByType', () => {
    it('should retrieve resources by type', async () => {
      const mockResources: Resource[] = [
        {
          id: 'resource_1',
          resourceType: ResourceType.TABLE,
          name: 'Table 1',
          capacity: 2,
          isAvailable: true,
          amenities: [],
          syncEnabled: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'resource_2',
          resourceType: ResourceType.TABLE,
          name: 'Table 2',
          capacity: 4,
          isAvailable: true,
          amenities: [],
          syncEnabled: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Resource> = {
        data: mockResources,
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
        .get('/reservation-resources/by-type/table')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.getByType(ResourceType.TABLE);

      expect(result.data).toHaveLength(2);
      expect(result.data.every(r => r.resourceType === ResourceType.TABLE)).toBe(true);
      expect(result.data[0].name).toBe('Table 1');
      expect(result.data[1].name).toBe('Table 2');
    });

    it('should get resources by type with pagination', async () => {
      const mockResponse: PaginatedResultType<Resource> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 15,
          totalCount: 30,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/reservation-resources/by-type/room')
        .query({ page: '2', pageSize: '15' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.getByType(ResourceType.ROOM, {
        page: 2,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(15);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a resource', async () => {
      const updateData = {
        id: 'resource_123',
        name: 'Table 5 (VIP)',
        capacity: 6,
        description: 'Expanded VIP table',
        isAvailable: true,
      };

      const mockResponse: Resource = {
        id: 'resource_123',
        resourceType: ResourceType.TABLE,
        name: 'Table 5 (VIP)',
        capacity: 6,
        description: 'Expanded VIP table',
        isAvailable: true,
        location: 'Main dining area',
        amenities: ['Window view', 'Booth seating'],
        reservationDuration: 2,
        reservationDurationUnit: ResourceReservationDurationUnit.HOURS,
        syncEnabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservation-resources', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.update(updateData);

      expect(result.name).toBe('Table 5 (VIP)');
      expect(result.capacity).toBe(6);
      expect(result.description).toBe('Expanded VIP table');
    });

    it('should update resource availability', async () => {
      const updateData = {
        id: 'resource_456',
        isAvailable: false,
      };

      const mockResponse: Resource = {
        id: 'resource_456',
        resourceType: ResourceType.ROOM,
        name: 'Room 101',
        capacity: 2,
        isAvailable: false,
        amenities: [],
        syncEnabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservation-resources', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.update(updateData);

      expect(result.isAvailable).toBe(false);
    });

    it('should update room resource pricing', async () => {
      const updateData = {
        id: 'resource_room',
        roomResource: {
          roomNumber: '101',
          roomType: 'Deluxe King',
          pricePerNight: 349.99,
          view: 'Ocean View',
          bedType: 'King',
          isSmoking: false,
        },
      };

      const mockResponse: Resource = {
        id: 'resource_room',
        resourceType: ResourceType.ROOM,
        name: 'Room 101',
        capacity: 2,
        isAvailable: true,
        amenities: [],
        roomResource: {
          roomNumber: '101',
          roomType: 'Deluxe King',
          pricePerNight: 349.99,
          view: 'Ocean View',
          bedType: 'King',
          isSmoking: false,
        },
        syncEnabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/reservation-resources', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.update(updateData);

      expect(result.roomResource?.pricePerNight).toBe(349.99);
    });
  });

  describe('delete', () => {
    it('should delete a resource', async () => {
      nock(BASE_URL)
        .delete('/reservation-resources/resource_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.delete('resource_123');
      expect(result).toBe(true);
    });

    it('should throw API error when resource not found', async () => {
      nock(BASE_URL)
        .delete('/reservation-resources/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Reservation resource not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.reservationResources.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list resources with pagination', async () => {
      const mockResources: Resource[] = [
        {
          id: 'resource_1',
          resourceType: ResourceType.TABLE,
          name: 'Table 1',
          capacity: 4,
          isAvailable: true,
          amenities: [],
          syncEnabled: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'resource_2',
          resourceType: ResourceType.ROOM,
          name: 'Room 101',
          capacity: 2,
          isAvailable: true,
          amenities: [],
          syncEnabled: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Resource> = {
        data: mockResources,
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
        .get('/reservation-resources')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].resourceType).toBe(ResourceType.TABLE);
      expect(result.data[1].resourceType).toBe(ResourceType.ROOM);
    });

    it('should list resources with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<Resource> = {
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
        .get('/reservation-resources')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.reservationResources.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
