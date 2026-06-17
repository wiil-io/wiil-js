/**
 * @fileoverview Tests for Service Providers resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ServiceProvider, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ServiceProvidersResource', () => {
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
    it('should create a service provider assignment with basic details', async () => {
      const input = {
        serviceId: 'svc_123',
        providerId: 'person_456',
        active: true,
      };

      const mockResponse: ServiceProvider = {
        id: 'sp_123',
        serviceId: 'svc_123',
        providerId: 'person_456',
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-providers', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.create(input);

      expect(result.id).toBe('sp_123');
      expect(result.serviceId).toBe('svc_123');
      expect(result.providerId).toBe('person_456');
      expect(result.active).toBe(true);
    });

    it('should create a service provider with price override', async () => {
      const input = {
        serviceId: 'svc_456',
        providerId: 'person_789',
        priceOverride: 80.00,
        active: true,
      };

      const mockResponse: ServiceProvider = {
        id: 'sp_456',
        serviceId: 'svc_456',
        providerId: 'person_789',
        priceOverride: 80.00,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-providers', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.create(input);

      expect(result.id).toBe('sp_456');
      expect(result.priceOverride).toBe(80.00);
    });

    it('should create a service provider with duration override', async () => {
      const input = {
        serviceId: 'svc_789',
        providerId: 'person_111',
        durationOverride: 45,
        active: true,
      };

      const mockResponse: ServiceProvider = {
        id: 'sp_789',
        serviceId: 'svc_789',
        providerId: 'person_111',
        durationOverride: 45,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-providers', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.create(input);

      expect(result.durationOverride).toBe(45);
    });

    it('should create a service provider with both price and duration overrides', async () => {
      const input = {
        serviceId: 'svc_999',
        providerId: 'person_222',
        priceOverride: 120.00,
        durationOverride: 90,
        active: true,
      };

      const mockResponse: ServiceProvider = {
        id: 'sp_999',
        serviceId: 'svc_999',
        providerId: 'person_222',
        priceOverride: 120.00,
        durationOverride: 90,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-providers', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.create(input);

      expect(result.priceOverride).toBe(120.00);
      expect(result.durationOverride).toBe(90);
    });
  });

  describe('get', () => {
    it('should retrieve a service provider assignment by ID', async () => {
      const mockResponse: ServiceProvider = {
        id: 'sp_123',
        serviceId: 'svc_123',
        providerId: 'person_456',
        priceOverride: 75.00,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/service-providers/sp_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.get('sp_123');

      expect(result.id).toBe('sp_123');
      expect(result.serviceId).toBe('svc_123');
      expect(result.providerId).toBe('person_456');
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .get('/service-providers/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service provider assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceProviders.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByService', () => {
    it('should retrieve service provider assignments by service ID', async () => {
      const mockProviders: ServiceProvider[] = [
        {
          id: 'sp_1',
          serviceId: 'svc_123',
          providerId: 'person_1',
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sp_2',
          serviceId: 'svc_123',
          providerId: 'person_2',
          priceOverride: 85.00,
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProvider> = {
        data: mockProviders,
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
        .get('/service-providers/by-service/svc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.getByService('svc_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.serviceId === 'svc_123')).toBe(true);
    });

    it('should get service providers with pagination', async () => {
      const mockResponse: PaginatedResultType<ServiceProvider> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/service-providers/by-service/svc_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.getByService('svc_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByProvider', () => {
    it('should retrieve service provider assignments by provider ID', async () => {
      const mockProviders: ServiceProvider[] = [
        {
          id: 'sp_1',
          serviceId: 'svc_1',
          providerId: 'person_456',
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sp_2',
          serviceId: 'svc_2',
          providerId: 'person_456',
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sp_3',
          serviceId: 'svc_3',
          providerId: 'person_456',
          active: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProvider> = {
        data: mockProviders,
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
        .get('/service-providers/by-provider/person_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.getByProvider('person_456');

      expect(result.data).toHaveLength(3);
      expect(result.data.every(p => p.providerId === 'person_456')).toBe(true);
      expect(result.meta.totalCount).toBe(3);
    });

    it('should get provider services with pagination', async () => {
      const mockResponse: PaginatedResultType<ServiceProvider> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 5,
          totalCount: 15,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/service-providers/by-provider/person_789')
        .query({ page: '1', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.getByProvider('person_789', {
        page: 1,
        pageSize: 5,
      });

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a service provider price override', async () => {
      const input = {
        id: 'sp_123',
        priceOverride: 90.00,
      };

      const mockResponse: ServiceProvider = {
        id: 'sp_123',
        serviceId: 'svc_123',
        providerId: 'person_456',
        priceOverride: 90.00,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-providers', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.update(input);

      expect(result.priceOverride).toBe(90.00);
    });

    it('should update a service provider active status', async () => {
      const input = {
        id: 'sp_456',
        active: false,
      };

      const mockResponse: ServiceProvider = {
        id: 'sp_456',
        serviceId: 'svc_456',
        providerId: 'person_789',
        active: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-providers', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.update(input);

      expect(result.active).toBe(false);
    });

    it('should update duration override', async () => {
      const input = {
        id: 'sp_789',
        durationOverride: 60,
      };

      const mockResponse: ServiceProvider = {
        id: 'sp_789',
        serviceId: 'svc_789',
        providerId: 'person_111',
        durationOverride: 60,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-providers', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.update(input);

      expect(result.durationOverride).toBe(60);
    });
  });

  describe('delete', () => {
    it('should delete a service provider assignment', async () => {
      nock(BASE_URL)
        .delete('/service-providers/sp_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.delete('sp_123');
      expect(result).toBe(true);
    });

    it('should throw API error when assignment not found', async () => {
      nock(BASE_URL)
        .delete('/service-providers/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service provider assignment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceProviders.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list service provider assignments with pagination', async () => {
      const mockProviders: ServiceProvider[] = [
        {
          id: 'sp_1',
          serviceId: 'svc_1',
          providerId: 'person_1',
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sp_2',
          serviceId: 'svc_2',
          providerId: 'person_2',
          priceOverride: 100.00,
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProvider> = {
        data: mockProviders,
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
        .get('/service-providers')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list assignments with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ServiceProvider> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 50,
          totalCount: 150,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/service-providers')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.list({
        page: 2,
        pageSize: 50,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
    });
  });

  describe('createBatch', () => {
    it('should create multiple service provider assignments in batch', async () => {
      const input = [
        { serviceId: 'svc_123', providerId: 'person_1', active: true },
        { serviceId: 'svc_123', providerId: 'person_2', active: true },
        { serviceId: 'svc_456', providerId: 'person_1', priceOverride: 95.00, active: true },
      ];

      const mockProviders: ServiceProvider[] = [
        {
          id: 'sp_1',
          serviceId: 'svc_123',
          providerId: 'person_1',
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sp_2',
          serviceId: 'svc_123',
          providerId: 'person_2',
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'sp_3',
          serviceId: 'svc_456',
          providerId: 'person_1',
          priceOverride: 95.00,
          active: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceProvider> = {
        data: mockProviders,
        meta: {
          page: 1,
          pageSize: 3,
          totalCount: 3,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/service-providers/batch', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceProviders.createBatch(input);

      expect(result.data).toHaveLength(3);
      expect(result.data[2].priceOverride).toBe(95.00);
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const input = Array(101).fill({
        serviceId: 'svc_123',
        providerId: 'person_456',
        active: true,
      });

      await expect(
        client.serviceProviders.createBatch(input)
      ).rejects.toThrow('Batch size exceeds maximum limit of 100');
    });
  });
});
