/**
 * @fileoverview Tests for Customers resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { Customer, PaginatedResultType, PreferredContactMethod, BestTimeToCall } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('CustomersResource', () => {
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
    it('should create a new customer', async () => {
      const input = {
        customerId: 'ext_cust_001',
        phone_number: '+12125551234',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        preferred_language: 'en',
        preferred_contact_method: PreferredContactMethod.EMAIL,
        best_time_to_call: BestTimeToCall.AFTERNOON,
        timezone: 'America/New_York',
        company: 'Tech Corp',
        notes: 'VIP customer',
        tags: ['vip', 'tech-industry'],
        custom_fields: {
          loyaltyTier: 'gold',
          referralSource: 'website',
        },
        channelId: 'channel_123',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        isValidatedNames: true,
      };

      const mockResponse: Customer = {
        id: 'cust_123',
        customerId: 'ext_cust_001',
        phone_number: '+12125551234',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        preferred_language: 'en',
        preferred_contact_method: PreferredContactMethod.EMAIL,
        best_time_to_call: BestTimeToCall.AFTERNOON,
        timezone: 'America/New_York',
        company: 'Tech Corp',
        notes: 'VIP customer',
        tags: ['vip', 'tech-industry'],
        custom_fields: {
          loyaltyTier: 'gold',
          referralSource: 'website',
        },
        channelId: 'channel_123',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
        isValidatedNames: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/customers', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.create(input);

      expect(result.id).toBe('cust_123');
      expect(result.firstname).toBe('John');
      expect(result.lastname).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.phone_number).toBe('+12125551234');
    });
  });

  describe('get', () => {
    it('should retrieve a customer by ID', async () => {
      const mockResponse: Customer = {
        id: 'cust_123',
        customerId: 'ext_cust_001',
        phone_number: '+12125551234',
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        preferred_language: 'en',
        preferred_contact_method: PreferredContactMethod.PHONE,
        timezone: 'America/Los_Angeles',
        isValidatedNames: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/customers/cust_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.get('cust_123');

      expect(result.id).toBe('cust_123');
      expect(result.firstname).toBe('Jane');
      expect(result.lastname).toBe('Smith');
    });

    it('should throw API error when customer not found', async () => {
      nock(BASE_URL)
        .get('/customers/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Customer not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.customers.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByPhone', () => {
    it('should retrieve a customer by phone number', async () => {
      const mockResponse: Customer = {
        id: 'cust_123',
        phone_number: '+12125551234',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        preferred_language: 'en',
        preferred_contact_method: PreferredContactMethod.EMAIL,
        isValidatedNames: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/customers/phone/%2B12125551234')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.getByPhone('+12125551234');

      expect(result?.phone_number).toBe('+12125551234');
      expect(result?.firstname).toBe('John');
    });

    it('should return null when customer not found by phone', async () => {
      nock(BASE_URL)
        .get('/customers/phone/%2B19999999999')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.getByPhone('+19999999999');
      expect(result).toBeNull();
    });
  });

  describe('getByEmail', () => {
    it('should retrieve a customer by email address', async () => {
      const mockResponse: Customer = {
        id: 'cust_456',
        phone_number: '+18885551234',
        firstname: 'Alice',
        lastname: 'Johnson',
        email: 'alice.johnson@example.com',
        preferred_language: 'en',
        preferred_contact_method: PreferredContactMethod.SMS,
        isValidatedNames: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/customers/email/alice.johnson%40example.com')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.getByEmail('alice.johnson@example.com');

      expect(result?.email).toBe('alice.johnson@example.com');
      expect(result?.firstname).toBe('Alice');
    });

    it('should return null when customer not found by email', async () => {
      nock(BASE_URL)
        .get('/customers/email/notfound%40example.com')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.getByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('search', () => {
    it('should search customers by query', async () => {
      const mockCustomers: Customer[] = [
        {
          id: 'cust_1',
          phone_number: '+12125551111',
          firstname: 'John',
          lastname: 'Smith',
          email: 'john.smith@example.com',
          preferred_language: 'en',
          preferred_contact_method: PreferredContactMethod.EMAIL,
          isValidatedNames: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'cust_2',
          phone_number: '+12125552222',
          firstname: 'Johnny',
          lastname: 'Doe',
          email: 'johnny.doe@example.com',
          preferred_language: 'en',
          preferred_contact_method: PreferredContactMethod.EMAIL,
          isValidatedNames: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Customer> = {
        data: mockCustomers,
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
        .get('/customers/search')
        .query({ query: 'john' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.search('john');

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].firstname).toBe('John');
      expect(result.data[1].firstname).toBe('Johnny');
    });

    it('should search customers with pagination parameters', async () => {
      const mockResponse: PaginatedResultType<Customer> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 50,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/customers/search')
        .query({ query: 'smith', page: '2', pageSize: '10' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.search('smith', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateData = {
        id: 'cust_123',
        email: 'newemail@example.com',
        preferred_contact_method: PreferredContactMethod.SMS,
        tags: ['vip', 'updated'],
      };

      const mockResponse: Customer = {
        id: 'cust_123',
        phone_number: '+12125551234',
        firstname: 'John',
        lastname: 'Doe',
        email: 'newemail@example.com',
        preferred_language: 'en',
        preferred_contact_method: PreferredContactMethod.SMS,
        tags: ['vip', 'updated'],
        isValidatedNames: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/customers/cust_123', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.update('cust_123', updateData);

      expect(result.email).toBe('newemail@example.com');
      expect(result.preferred_contact_method).toBe(PreferredContactMethod.SMS);
      expect(result.tags).toEqual(['vip', 'updated']);
    });
  });

  describe('delete', () => {
    it('should delete a customer', async () => {
      nock(BASE_URL)
        .delete('/customers/cust_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.delete('cust_123');
      expect(result).toBe(true);
    });

    it('should throw API error when customer not found', async () => {
      nock(BASE_URL)
        .delete('/customers/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Customer not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.customers.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list customers with pagination', async () => {
      const mockCustomers: Customer[] = [
        {
          id: 'cust_1',
          phone_number: '+12125551111',
          firstname: 'Alice',
          lastname: 'Anderson',
          email: 'alice@example.com',
          preferred_language: 'en',
          preferred_contact_method: PreferredContactMethod.EMAIL,
          isValidatedNames: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'cust_2',
          phone_number: '+12125552222',
          firstname: 'Bob',
          lastname: 'Brown',
          email: 'bob@example.com',
          preferred_language: 'es',
          preferred_contact_method: PreferredContactMethod.PHONE,
          isValidatedNames: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Customer> = {
        data: mockCustomers,
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
        .get('/customers')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].firstname).toBe('Alice');
      expect(result.data[1].firstname).toBe('Bob');
    });

    it('should list customers with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<Customer> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 25,
          totalCount: 150,
          totalPages: 6,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/customers')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customers.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.totalPages).toBe(6);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
