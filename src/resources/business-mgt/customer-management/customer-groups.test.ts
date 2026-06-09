/**
 * @fileoverview Tests for Customer Groups resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { CustomerGroup, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('CustomerGroupsResource', () => {
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
    it('should create a new customer group', async () => {
      const input = {
        name: 'VIP Customers',
        description: 'High-value customers with premium benefits',
        code: 'VIP',
        isDefault: false,
      };

      const mockResponse: CustomerGroup = {
        id: 'group_123',
        name: 'VIP Customers',
        description: 'High-value customers with premium benefits',
        code: 'VIP',
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/customer-groups', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.create(input);

      expect(result.id).toBe('group_123');
      expect(result.name).toBe('VIP Customers');
      expect(result.code).toBe('VIP');
      expect(result.isDefault).toBe(false);
    });

    it('should create a default customer group', async () => {
      const input = {
        name: 'Retail',
        description: 'Standard retail customers',
        code: 'RTL',
        isDefault: true,
      };

      const mockResponse: CustomerGroup = {
        id: 'group_456',
        name: 'Retail',
        description: 'Standard retail customers',
        code: 'RTL',
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/customer-groups', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.create(input);

      expect(result.id).toBe('group_456');
      expect(result.isDefault).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve a customer group by ID', async () => {
      const mockResponse: CustomerGroup = {
        id: 'group_123',
        name: 'Wholesale',
        description: 'Wholesale customers with bulk pricing',
        code: 'WS',
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/customer-groups/group_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.get('group_123');

      expect(result.id).toBe('group_123');
      expect(result.name).toBe('Wholesale');
      expect(result.code).toBe('WS');
    });

    it('should throw API error when customer group not found', async () => {
      nock(BASE_URL)
        .get('/customer-groups/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Customer group not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.customerGroups.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCode', () => {
    it('should retrieve a customer group by code', async () => {
      const mockResponse: CustomerGroup = {
        id: 'group_123',
        name: 'VIP',
        description: 'VIP customers',
        code: 'VIP',
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/customer-groups/code/VIP')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.getByCode('VIP');

      expect(result?.code).toBe('VIP');
      expect(result?.name).toBe('VIP');
    });

    it('should return null when customer group not found by code', async () => {
      nock(BASE_URL)
        .get('/customer-groups/code/UNKNOWN')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.getByCode('UNKNOWN');
      expect(result).toBeNull();
    });
  });

  describe('getDefault', () => {
    it('should retrieve the default customer group', async () => {
      const mockResponse: CustomerGroup = {
        id: 'group_default',
        name: 'Retail',
        description: 'Default retail group',
        code: 'RTL',
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/customer-groups/default')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.getDefault();

      expect(result?.isDefault).toBe(true);
      expect(result?.name).toBe('Retail');
    });

    it('should return null when no default group exists', async () => {
      nock(BASE_URL)
        .get('/customer-groups/default')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: null,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.getDefault();
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a customer group', async () => {
      const updateData = {
        id: 'group_123',
        name: 'Premium VIP',
        description: 'Updated premium tier',
      };

      const mockResponse: CustomerGroup = {
        id: 'group_123',
        name: 'Premium VIP',
        description: 'Updated premium tier',
        code: 'VIP',
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/customer-groups/group_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.update('group_123', updateData);

      expect(result.name).toBe('Premium VIP');
      expect(result.description).toBe('Updated premium tier');
    });

    it('should update isDefault status', async () => {
      const updateData = {
        id: 'group_123',
        isDefault: true,
      };

      const mockResponse: CustomerGroup = {
        id: 'group_123',
        name: 'VIP',
        code: 'VIP',
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/customer-groups/group_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.update('group_123', updateData);

      expect(result.isDefault).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a customer group', async () => {
      nock(BASE_URL)
        .delete('/customer-groups/group_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.delete('group_123');
      expect(result).toBe(true);
    });

    it('should throw API error when customer group not found', async () => {
      nock(BASE_URL)
        .delete('/customer-groups/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Customer group not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.customerGroups.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list customer groups with pagination', async () => {
      const mockGroups: CustomerGroup[] = [
        {
          id: 'group_1',
          name: 'Retail',
          code: 'RTL',
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'group_2',
          name: 'Wholesale',
          code: 'WS',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'group_3',
          name: 'VIP',
          code: 'VIP',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<CustomerGroup> = {
        data: mockGroups,
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
        .get('/customer-groups')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.list();

      expect(result.data).toHaveLength(3);
      expect(result.meta.totalCount).toBe(3);
      expect(result.data[0].name).toBe('Retail');
      expect(result.data[1].name).toBe('Wholesale');
      expect(result.data[2].name).toBe('VIP');
    });

    it('should list customer groups with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<CustomerGroup> = {
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
        .get('/customer-groups')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.list({
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(10);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('createBatch', () => {
    it('should create multiple customer groups in batch', async () => {
      const inputData = [
        { name: 'Gold', code: 'GOLD', isDefault: false },
        { name: 'Silver', code: 'SILVER', isDefault: false },
        { name: 'Bronze', code: 'BRONZE', isDefault: false },
      ];

      const mockGroups: CustomerGroup[] = [
        {
          id: 'group_1',
          name: 'Gold',
          code: 'GOLD',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'group_2',
          name: 'Silver',
          code: 'SILVER',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'group_3',
          name: 'Bronze',
          code: 'BRONZE',
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<CustomerGroup> = {
        data: mockGroups,
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
        .post('/customer-groups/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.customerGroups.createBatch(inputData);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('Gold');
      expect(result.data[1].name).toBe('Silver');
      expect(result.data[2].name).toBe('Bronze');
    });
  });
});
