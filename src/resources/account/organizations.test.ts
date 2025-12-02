/**
 * @fileoverview Tests for Organizations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { Organization, ServiceStatus } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('OrganizationsResource', () => {
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
    it('should retrieve the organization that owns the API key', async () => {
      const mockResponse: Organization = {
        id: 'org_123',
        companyName: 'Acme Corporation',
        businessVerticalId: 'technology',
        platformEmail: 'admin@acme.com',
        serviceStatus: ServiceStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/organizations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: {
            timestamp: Date.now(),
            version: 'v1',
          },
        });

      const result = await client.organizations.get();

      expect(result).toEqual(mockResponse);
      expect(result.id).toBe('org_123');
      expect(result.companyName).toBe('Acme Corporation');
      expect(result.businessVerticalId).toBe('technology');
      expect(result.platformEmail).toBe('admin@acme.com');
    });

    it('should throw API error when request fails', async () => {
      nock(BASE_URL)
        .get('/organizations')
        .reply(401, {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid API key',
          },
          metadata: {
            timestamp: Date.now(),
            version: 'v1',
          },
        });

      await expect(
        client.organizations.get()
      ).rejects.toThrow(WiilAPIError);
    });

    it('should throw API error on server error', async () => {
      nock(BASE_URL)
        .get('/organizations')
        .reply(500, {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
          metadata: {
            timestamp: Date.now(),
            version: 'v1',
          },
        });

      await expect(
        client.organizations.get()
      ).rejects.toThrow(WiilAPIError);
    });
  });
});
