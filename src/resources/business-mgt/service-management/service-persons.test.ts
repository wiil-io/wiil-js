/**
 * @fileoverview Tests for Service Persons resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ServicePerson, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ServicePersonsResource', () => {
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
    it('should create a service person with basic details', async () => {
      const input = {
        name: 'Jane Smith',
        description: 'Senior Hair Stylist',
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
      };

      const mockResponse: ServicePerson = {
        id: 'person_123',
        name: 'Jane Smith',
        description: 'Senior Hair Stylist',
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-persons', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.create(input);

      expect(result.id).toBe('person_123');
      expect(result.name).toBe('Jane Smith');
      expect(result.description).toBe('Senior Hair Stylist');
      expect(result.bookableOnline).toBe(true);
      expect(result.bookableByStaff).toBe(true);
    });

    it('should create a service person with location and commission', async () => {
      const input = {
        name: 'John Doe',
        description: 'Massage Therapist',
        locationId: 'loc_123',
        commissionPercent: 35,
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
      };

      const mockResponse: ServicePerson = {
        id: 'person_456',
        name: 'John Doe',
        description: 'Massage Therapist',
        locationId: 'loc_123',
        commissionPercent: 35,
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-persons', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.create(input);

      expect(result.id).toBe('person_456');
      expect(result.locationId).toBe('loc_123');
      expect(result.commissionPercent).toBe(35);
    });

    it('should create a service person with skills and user account', async () => {
      const input = {
        name: 'Sarah Johnson',
        userAccountId: 'user_789',
        skills: ['massage', 'aromatherapy', 'reflexology'],
        avatar: 'https://example.com/sarah.jpg',
        scheduleId: 'schedule_123',
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
      };

      const mockResponse: ServicePerson = {
        id: 'person_789',
        name: 'Sarah Johnson',
        userAccountId: 'user_789',
        skills: ['massage', 'aromatherapy', 'reflexology'],
        avatar: 'https://example.com/sarah.jpg',
        scheduleId: 'schedule_123',
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-persons', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.create(input);

      expect(result.skills).toHaveLength(3);
      expect(result.userAccountId).toBe('user_789');
      expect(result.avatar).toBe('https://example.com/sarah.jpg');
      expect(result.scheduleId).toBe('schedule_123');
    });

    it('should create a service person with staff-only booking', async () => {
      const input = {
        name: 'Back Office Staff',
        bookableOnline: false,
        bookableByStaff: true,
        isActive: true,
      };

      const mockResponse: ServicePerson = {
        id: 'person_staff',
        name: 'Back Office Staff',
        bookableOnline: false,
        bookableByStaff: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-persons', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.create(input);

      expect(result.bookableOnline).toBe(false);
      expect(result.bookableByStaff).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a service person by ID', async () => {
      const mockResponse: ServicePerson = {
        id: 'person_123',
        name: 'Jane Smith',
        description: 'Senior Hair Stylist',
        commissionPercent: 40,
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/service-persons/person_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.get('person_123');

      expect(result.id).toBe('person_123');
      expect(result.name).toBe('Jane Smith');
      expect(result.commissionPercent).toBe(40);
    });

    it('should throw API error when person not found', async () => {
      nock(BASE_URL)
        .get('/service-persons/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service person not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.servicePersons.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByLocation', () => {
    it('should retrieve service persons by location ID', async () => {
      const mockPersons: ServicePerson[] = [
        {
          id: 'person_1',
          name: 'Jane Smith',
          locationId: 'loc_123',
          bookableOnline: true,
          bookableByStaff: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'person_2',
          name: 'John Doe',
          locationId: 'loc_123',
          bookableOnline: true,
          bookableByStaff: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServicePerson> = {
        data: mockPersons,
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
        .get('/service-persons/by-location/loc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.getByLocation('loc_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.locationId === 'loc_123')).toBe(true);
    });

    it('should get location persons with pagination', async () => {
      const mockResponse: PaginatedResultType<ServicePerson> = {
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
        .get('/service-persons/by-location/loc_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.getByLocation('loc_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a service person name and description', async () => {
      const input = {
        id: 'person_123',
        name: 'Jane Smith-Wilson',
        description: 'Lead Hair Stylist',
      };

      const mockResponse: ServicePerson = {
        id: 'person_123',
        name: 'Jane Smith-Wilson',
        description: 'Lead Hair Stylist',
        bookableOnline: true,
        bookableByStaff: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-persons', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.update(input);

      expect(result.name).toBe('Jane Smith-Wilson');
      expect(result.description).toBe('Lead Hair Stylist');
    });

    it('should update commission percentage and booking settings', async () => {
      const input = {
        id: 'person_456',
        commissionPercent: 45,
        bookableOnline: false,
      };

      const mockResponse: ServicePerson = {
        id: 'person_456',
        name: 'John Doe',
        commissionPercent: 45,
        bookableOnline: false,
        bookableByStaff: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-persons', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.update(input);

      expect(result.commissionPercent).toBe(45);
      expect(result.bookableOnline).toBe(false);
    });

    it('should deactivate a service person', async () => {
      const input = {
        id: 'person_789',
        isActive: false,
      };

      const mockResponse: ServicePerson = {
        id: 'person_789',
        name: 'Former Employee',
        bookableOnline: false,
        bookableByStaff: false,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-persons', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.update(input);

      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a service person', async () => {
      nock(BASE_URL)
        .delete('/service-persons/person_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.delete('person_123');
      expect(result).toBe(true);
    });

    it('should throw API error when person not found', async () => {
      nock(BASE_URL)
        .delete('/service-persons/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service person not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.servicePersons.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list service persons with pagination', async () => {
      const mockPersons: ServicePerson[] = [
        {
          id: 'person_1',
          name: 'Jane Smith',
          bookableOnline: true,
          bookableByStaff: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'person_2',
          name: 'John Doe',
          bookableOnline: true,
          bookableByStaff: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServicePerson> = {
        data: mockPersons,
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
        .get('/service-persons')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].name).toBe('Jane Smith');
      expect(result.data[1].name).toBe('John Doe');
    });

    it('should list persons with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ServicePerson> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 15,
          totalCount: 50,
          totalPages: 4,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/service-persons')
        .query({ page: '3', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.list({
        page: 3,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(15);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple service persons in batch', async () => {
      const input = [
        { name: 'Jane Smith', bookableOnline: true, bookableByStaff: true },
        { name: 'John Doe', bookableOnline: true, bookableByStaff: true },
      ];

      const mockPersons: ServicePerson[] = [
        {
          id: 'person_1',
          name: 'Jane Smith',
          bookableOnline: true,
          bookableByStaff: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'person_2',
          name: 'John Doe',
          bookableOnline: true,
          bookableByStaff: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServicePerson> = {
        data: mockPersons,
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
        .post('/service-persons/batch', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.servicePersons.createBatch(input);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Jane Smith');
      expect(result.data[1].name).toBe('John Doe');
    });

    it('should throw validation error when batch exceeds limit', async () => {
      const input = Array(51).fill({
        name: 'Test Person',
        bookableOnline: true,
        bookableByStaff: true,
      });

      await expect(
        client.servicePersons.createBatch(input)
      ).rejects.toThrow('Batch size exceeds maximum limit of 50');
    });
  });
});
