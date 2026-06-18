/**
 * @fileoverview Tests for Business Locations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { BusinessLocation, BusinessLocationStatus, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('BusinessLocationsResource', () => {
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
    it('should create a new business location', async () => {
      const input = {
        name: 'Downtown Branch',
        code: 'DT001',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: false,
        timezone: 'America/New_York',
        businessHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: null,
          sunday: null,
        },
        phoneNumber: '+15551234567',
        email: 'downtown@example.com',
      };

      const mockResponse: BusinessLocation = {
        id: 'loc_123',
        name: 'Downtown Branch',
        code: 'DT001',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: false,
        timezone: 'America/New_York',
        businessHours: input.businessHours,
        phoneNumber: '+15551234567',
        email: 'downtown@example.com',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/business-locations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.create(input);

      expect(result.id).toBe('loc_123');
      expect(result.name).toBe('Downtown Branch');
      expect(result.code).toBe('DT001');
      expect(result.status).toBe(BusinessLocationStatus.ACTIVE);
      expect(result.isPrimary).toBe(false);
    });

    it('should create a primary business location', async () => {
      const input = {
        name: 'Main Office',
        code: 'HQ001',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: true,
        timezone: 'America/Los_Angeles',
        businessHours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' },
          saturday: null,
          sunday: null,
        },
      };

      const mockResponse: BusinessLocation = {
        id: 'loc_456',
        name: 'Main Office',
        code: 'HQ001',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: true,
        timezone: 'America/Los_Angeles',
        businessHours: input.businessHours,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/business-locations', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.create(input);

      expect(result.id).toBe('loc_456');
      expect(result.isPrimary).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a business location by ID', async () => {
      const mockResponse: BusinessLocation = {
        id: 'loc_123',
        name: 'Westside Store',
        code: 'WS001',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: false,
        timezone: 'America/Chicago',
        businessHours: {
          monday: { open: '10:00', close: '20:00' },
          tuesday: { open: '10:00', close: '20:00' },
          wednesday: { open: '10:00', close: '20:00' },
          thursday: { open: '10:00', close: '20:00' },
          friday: { open: '10:00', close: '20:00' },
          saturday: { open: '10:00', close: '18:00' },
          sunday: { open: '12:00', close: '17:00' },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/business-locations/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.get('loc_123');

      expect(result.id).toBe('loc_123');
      expect(result.name).toBe('Westside Store');
      expect(result.code).toBe('WS001');
    });

    it('should throw API error when business location not found', async () => {
      nock(BASE_URL)
        .get('/business-locations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Business location not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.businessLocations.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCode', () => {
    it('should retrieve a business location by code', async () => {
      const mockResponse: BusinessLocation = {
        id: 'loc_123',
        name: 'Downtown',
        code: 'DT001',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: false,
        timezone: 'America/New_York',
        businessHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: null,
          sunday: null,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/business-locations/code/DT001')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.getByCode('DT001');

      expect(result?.code).toBe('DT001');
      expect(result?.name).toBe('Downtown');
    });

    it('should return null when business location not found by code', async () => {
      nock(BASE_URL)
        .get('/business-locations/code/UNKNOWN')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.getByCode('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getPrimary', () => {
    it('should retrieve the primary business location', async () => {
      const mockResponse: BusinessLocation = {
        id: 'loc_primary',
        name: 'Headquarters',
        code: 'HQ',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: true,
        timezone: 'America/New_York',
        businessHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: null,
          sunday: null,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/business-locations/primary')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.getPrimary();

      expect(result?.isPrimary).toBe(true);
      expect(result?.name).toBe('Headquarters');
    });

    it('should return null when no primary location exists', async () => {
      nock(BASE_URL)
        .get('/business-locations/primary')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.getPrimary();
      expect(result).toBeNull();
    });
  });

  describe('getActive', () => {
    it('should retrieve active business locations', async () => {
      const mockLocations: BusinessLocation[] = [
        {
          id: 'loc_1',
          name: 'Store A',
          code: 'A',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: true,
          timezone: 'America/New_York',
          businessHours: { monday: { open: '09:00', close: '17:00' } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'loc_2',
          name: 'Store B',
          code: 'B',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: false,
          timezone: 'America/Chicago',
          businessHours: { monday: { open: '09:00', close: '17:00' } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<BusinessLocation> = {
        data: mockLocations,
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
        .get('/business-locations/active')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.getActive();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(loc => loc.status === BusinessLocationStatus.ACTIVE)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a business location', async () => {
      const updateData = {
        id: 'loc_123',
        name: 'Updated Downtown Branch',
        phoneNumber: '+15559876543',
      };

      const mockResponse: BusinessLocation = {
        id: 'loc_123',
        name: 'Updated Downtown Branch',
        code: 'DT001',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: false,
        timezone: 'America/New_York',
        businessHours: {
          monday: { open: '09:00', close: '17:00' },
          tuesday: { open: '09:00', close: '17:00' },
          wednesday: { open: '09:00', close: '17:00' },
          thursday: { open: '09:00', close: '17:00' },
          friday: { open: '09:00', close: '17:00' },
          saturday: null,
          sunday: null,
        },
        phoneNumber: '+15559876543',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/business-locations', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.update(updateData);

      expect(result.name).toBe('Updated Downtown Branch');
      expect(result.phoneNumber).toBe('+15559876543');
    });

    it('should update location status', async () => {
      const updateData = {
        id: 'loc_123',
        status: BusinessLocationStatus.INACTIVE,
      };

      const mockResponse: BusinessLocation = {
        id: 'loc_123',
        name: 'Store',
        code: 'ST',
        status: BusinessLocationStatus.INACTIVE,
        isPrimary: false,
        timezone: 'America/New_York',
        businessHours: { monday: { open: '09:00', close: '17:00' } },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/business-locations', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.update(updateData);

      expect(result.status).toBe(BusinessLocationStatus.INACTIVE);
    });
  });

  describe('setPrimary', () => {
    it('should set a location as primary', async () => {
      const mockResponse: BusinessLocation = {
        id: 'loc_123',
        name: 'New Primary Store',
        code: 'NPS',
        status: BusinessLocationStatus.ACTIVE,
        isPrimary: true,
        timezone: 'America/New_York',
        businessHours: { monday: { open: '09:00', close: '17:00' } },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/business-locations/loc_123/set-primary', {})
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.setPrimary('loc_123');

      expect(result.isPrimary).toBe(true);
      expect(result.id).toBe('loc_123');
    });
  });

  describe('delete', () => {
    it('should delete a business location', async () => {
      nock(BASE_URL)
        .delete('/business-locations/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.delete('loc_123');
      expect(result).toBe(true);
    });

    it('should throw API error when business location not found', async () => {
      nock(BASE_URL)
        .delete('/business-locations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Business location not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.businessLocations.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list business locations with pagination', async () => {
      const mockLocations: BusinessLocation[] = [
        {
          id: 'loc_1',
          name: 'Store A',
          code: 'A',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: true,
          timezone: 'America/New_York',
          businessHours: { monday: { open: '09:00', close: '17:00' } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'loc_2',
          name: 'Store B',
          code: 'B',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: false,
          timezone: 'America/Chicago',
          businessHours: { monday: { open: '09:00', close: '17:00' } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'loc_3',
          name: 'Store C',
          code: 'C',
          status: BusinessLocationStatus.INACTIVE,
          isPrimary: false,
          timezone: 'America/Los_Angeles',
          businessHours: { monday: { open: '09:00', close: '17:00' } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<BusinessLocation> = {
        data: mockLocations,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/business-locations')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.list();

      expect(result.data).toHaveLength(3);
      expect(result.meta.totalCount).toBe(3);
      expect(result.data[0].name).toBe('Store A');
      expect(result.data[1].name).toBe('Store B');
      expect(result.data[2].name).toBe('Store C');
    });

    it('should list business locations with filters', async () => {
      const mockResponse: PaginatedResultType<BusinessLocation> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/business-locations')
        .query({ status: 'ACTIVE', isPrimary: 'true' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.list(
        {},
        { status: BusinessLocationStatus.ACTIVE, isPrimary: true }
      );

      expect(result.data).toHaveLength(0);
    });
  });

  describe('createBatch', () => {
    it('should create multiple business locations in batch', async () => {
      const inputData = [
        {
          name: 'North Store',
          code: 'NS',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: false,
          timezone: 'America/Chicago',
          businessHours: { monday: { open: '08:00', close: '20:00' } },
        },
        {
          name: 'South Store',
          code: 'SS',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: false,
          timezone: 'America/Chicago',
          businessHours: { monday: { open: '08:00', close: '20:00' } },
        },
      ];

      const mockLocations: BusinessLocation[] = [
        {
          id: 'loc_1',
          name: 'North Store',
          code: 'NS',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: false,
          timezone: 'America/Chicago',
          businessHours: { monday: { open: '08:00', close: '20:00' } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'loc_2',
          name: 'South Store',
          code: 'SS',
          status: BusinessLocationStatus.ACTIVE,
          isPrimary: false,
          timezone: 'America/Chicago',
          businessHours: { monday: { open: '08:00', close: '20:00' } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<BusinessLocation> = {
        data: mockLocations,
        meta: {
          page: 1,
          pageSize: 2,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/business-locations/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessLocations.createBatch(inputData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('North Store');
      expect(result.data[1].name).toBe('South Store');
    });
  });
});
