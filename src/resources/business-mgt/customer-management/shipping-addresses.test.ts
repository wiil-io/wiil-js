/**
 * @fileoverview Tests for Shipping Addresses resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ShippingAddress, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ShippingAddressesResource', () => {
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
    it('should create a new shipping address', async () => {
      const input = {
        customerId: 'cust_123',
        street: '123 Main St',
        street2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        recipientName: 'John Doe',
        phoneNumber: '+12125551234',
        instructions: 'Leave at front door',
        isPrimary: true,
      };

      const mockResponse: ShippingAddress = {
        id: 'addr_123',
        customerId: 'cust_123',
        street: '123 Main St',
        street2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        recipientName: 'John Doe',
        phoneNumber: '+12125551234',
        instructions: 'Leave at front door',
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/shipping-addresses', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.create(input);

      expect(result.id).toBe('addr_123');
      expect(result.street).toBe('123 Main St');
      expect(result.city).toBe('New York');
      expect(result.isPrimary).toBe(true);
    });

    it('should create a shipping address with minimal fields', async () => {
      const input = {
        customerId: 'cust_456',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
        isPrimary: false,
      };

      const mockResponse: ShippingAddress = {
        id: 'addr_456',
        customerId: 'cust_456',
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'US',
        isPrimary: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/shipping-addresses', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.create(input);

      expect(result.id).toBe('addr_456');
      expect(result.isPrimary).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve a shipping address by ID', async () => {
      const mockResponse: ShippingAddress = {
        id: 'addr_123',
        customerId: 'cust_123',
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'US',
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/shipping-addresses/addr_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.get('addr_123');

      expect(result.id).toBe('addr_123');
      expect(result.street).toBe('789 Pine St');
      expect(result.city).toBe('Chicago');
    });

    it('should throw API error when shipping address not found', async () => {
      nock(BASE_URL)
        .get('/shipping-addresses/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Shipping address not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.shippingAddresses.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve shipping addresses by customer ID', async () => {
      const mockAddresses: ShippingAddress[] = [
        {
          id: 'addr_1',
          customerId: 'cust_123',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
          isPrimary: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'addr_2',
          customerId: 'cust_123',
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
          isPrimary: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ShippingAddress> = {
        data: mockAddresses,
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
        .get('/shipping-addresses/by-customer/cust_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.getByCustomer('cust_123');

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].isPrimary).toBe(true);
      expect(result.data[1].isPrimary).toBe(false);
    });

    it('should retrieve shipping addresses with pagination', async () => {
      const mockResponse: PaginatedResultType<ShippingAddress> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 5,
          totalCount: 12,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/shipping-addresses/by-customer/cust_123')
        .query({ page: '2', pageSize: '5' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.getByCustomer('cust_123', {
        page: 2,
        pageSize: 5,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(5);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getPrimary', () => {
    it('should retrieve the primary shipping address for a customer', async () => {
      const mockResponse: ShippingAddress = {
        id: 'addr_primary',
        customerId: 'cust_123',
        street: '100 Primary St',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'US',
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/shipping-addresses/primary/cust_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.getPrimary('cust_123');

      expect(result?.isPrimary).toBe(true);
      expect(result?.street).toBe('100 Primary St');
    });

    it('should return null when no primary address exists', async () => {
      nock(BASE_URL)
        .get('/shipping-addresses/primary/cust_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.getPrimary('cust_456');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a shipping address', async () => {
      const updateData = {
        id: 'addr_123',
        street: '999 New Ave',
        instructions: 'Ring doorbell twice',
      };

      const mockResponse: ShippingAddress = {
        id: 'addr_123',
        customerId: 'cust_123',
        street: '999 New Ave',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        instructions: 'Ring doorbell twice',
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/shipping-addresses/addr_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.update('addr_123', updateData);

      expect(result.street).toBe('999 New Ave');
      expect(result.instructions).toBe('Ring doorbell twice');
    });

    it('should update isPrimary status', async () => {
      const updateData = {
        id: 'addr_123',
        isPrimary: false,
      };

      const mockResponse: ShippingAddress = {
        id: 'addr_123',
        customerId: 'cust_123',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        isPrimary: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/shipping-addresses/addr_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.update('addr_123', updateData);

      expect(result.isPrimary).toBe(false);
    });
  });

  describe('setPrimary', () => {
    it('should set a shipping address as primary', async () => {
      const mockResponse: ShippingAddress = {
        id: 'addr_123',
        customerId: 'cust_123',
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        isPrimary: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/shipping-addresses/addr_123/set-primary', {})
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.setPrimary('addr_123');

      expect(result.isPrimary).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a shipping address', async () => {
      nock(BASE_URL)
        .delete('/shipping-addresses/addr_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.delete('addr_123');
      expect(result).toBe(true);
    });

    it('should throw API error when shipping address not found', async () => {
      nock(BASE_URL)
        .delete('/shipping-addresses/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Shipping address not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.shippingAddresses.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list shipping addresses with pagination', async () => {
      const mockAddresses: ShippingAddress[] = [
        {
          id: 'addr_1',
          customerId: 'cust_1',
          street: '100 First St',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'US',
          isPrimary: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'addr_2',
          customerId: 'cust_2',
          street: '200 Second Ave',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'US',
          isPrimary: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ShippingAddress> = {
        data: mockAddresses,
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
        .get('/shipping-addresses')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].city).toBe('Seattle');
      expect(result.data[1].city).toBe('Portland');
    });

    it('should list shipping addresses with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ShippingAddress> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 25,
          totalCount: 100,
          totalPages: 4,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/shipping-addresses')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.totalPages).toBe(4);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple shipping addresses in batch', async () => {
      const inputData = [
        {
          customerId: 'cust_123',
          street: '111 First St',
          city: 'Denver',
          state: 'CO',
          postalCode: '80201',
          country: 'US',
          isPrimary: true,
        },
        {
          customerId: 'cust_123',
          street: '222 Second Ave',
          city: 'Phoenix',
          state: 'AZ',
          postalCode: '85001',
          country: 'US',
          isPrimary: false,
        },
      ];

      const mockAddresses: ShippingAddress[] = [
        {
          id: 'addr_1',
          customerId: 'cust_123',
          street: '111 First St',
          city: 'Denver',
          state: 'CO',
          postalCode: '80201',
          country: 'US',
          isPrimary: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'addr_2',
          customerId: 'cust_123',
          street: '222 Second Ave',
          city: 'Phoenix',
          state: 'AZ',
          postalCode: '85001',
          country: 'US',
          isPrimary: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ShippingAddress> = {
        data: mockAddresses,
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
        .post('/shipping-addresses/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.shippingAddresses.createBatch(inputData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].city).toBe('Denver');
      expect(result.data[1].city).toBe('Phoenix');
    });
  });
});
