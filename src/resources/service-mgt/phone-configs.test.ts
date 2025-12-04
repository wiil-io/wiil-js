/**
 * @fileoverview Tests for Phone Configurations resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { PhoneConfiguration, PhoneNumberPurchase, PaginatedResultType, PhoneStatus, PhoneNumberType, PhonePurchaseStatus, ProviderType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('PhoneConfigurationsResource', () => {
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

  describe('purchase', () => {
    it('should purchase a new phone number', async () => {
      const input = {
        friendlyName: 'Customer Support Line',
        phoneNumber: '+12125551234',
        requestTime: Date.now(),
        providerType: ProviderType.TWILIO,
        amount: 1.00,
        currency: 'USD',
        status: PhonePurchaseStatus.PENDING,
        numberType: PhoneNumberType.LOCAL,
      };

      const mockResponse: PhoneNumberPurchase = {
        id: 'purchase_123',
        friendlyName: 'Customer Support Line',
        phoneNumber: '+12125551234',
        providerType: ProviderType.TWILIO,
        amount: 1.00,
        currency: 'USD',
        status: PhonePurchaseStatus.COMPLETED,
        numberType: PhoneNumberType.LOCAL,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/phone-configurations/purchase', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.phoneConfigs.purchase(input);

      expect(result.id).toBe('purchase_123');
      expect(result.phoneNumber).toBe('+12125551234');
      expect(result.status).toBe(PhonePurchaseStatus.COMPLETED);
    });
  });

  describe('get', () => {
    it('should retrieve a phone configuration by ID', async () => {
      const mockResponse: PhoneConfiguration = {
        id: 'phone_123',
        phoneNumber: '+12125551234',
        providerPhoneNumberId: 'provider_123',
        phoneRequestId: 'request_456',
        friendlyName: 'Customer Support Line',
        providerType: ProviderType.TWILIO,
        status: PhoneStatus.ACTIVE,
        isImported: false,
        isPorted: false,
        markedForRelease: false,
        isUSSMSPermitted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/phone-configurations/phone_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.phoneConfigs.get('phone_123');

      expect(result.id).toBe('phone_123');
      expect(result.phoneNumber).toBe('+12125551234');
      expect(result.status).toBe(PhoneStatus.ACTIVE);
    });

    it('should throw API error when phone configuration not found', async () => {
      nock(BASE_URL)
        .get('/phone-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Phone configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.phoneConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByPhoneNumber', () => {
    it('should retrieve a phone configuration by phone number', async () => {
      const mockResponse: PhoneConfiguration = {
        id: 'phone_123',
        phoneNumber: '+12125551234',
        providerPhoneNumberId: 'provider_123',
        phoneRequestId: 'request_456',
        friendlyName: 'Customer Support Line',
        providerType: ProviderType.TWILIO,
        status: PhoneStatus.ACTIVE,
        isImported: false,
        isPorted: false,
        markedForRelease: false,
        isUSSMSPermitted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/phone-configurations/by-phone-number/%2B12125551234')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.phoneConfigs.getByPhoneNumber('+12125551234');

      expect(result.phoneNumber).toBe('+12125551234');
    });
  });

  describe('getByRequestId', () => {
    it('should retrieve a phone configuration by request ID', async () => {
      const mockResponse: PhoneConfiguration = {
        id: 'phone_123',
        phoneNumber: '+12125551234',
        providerPhoneNumberId: 'provider_123',
        phoneRequestId: 'request_456',
        friendlyName: 'Customer Support Line',
        providerType: ProviderType.TWILIO,
        status: PhoneStatus.ACTIVE,
        isImported: false,
        isPorted: false,
        markedForRelease: false,
        isUSSMSPermitted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/phone-configurations/by-request/request_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.phoneConfigs.getByRequestId('request_123');

      expect(result.id).toBe('phone_123');
    });
  });

  describe('update', () => {
    it('should update a phone configuration', async () => {
      const updateData = {
        id: 'phone_123',
        friendlyName: 'Updated Support Line',
      };

      const mockResponse: PhoneConfiguration = {
        id: 'phone_123',
        phoneNumber: '+12125551234',
        providerPhoneNumberId: 'provider_123',
        phoneRequestId: 'request_456',
        friendlyName: 'Updated Support Line',
        providerType: ProviderType.TWILIO,
        status: PhoneStatus.SMS_ACTIVE,
        isImported: false,
        isPorted: false,
        markedForRelease: false,
        isUSSMSPermitted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/phone-configurations', {
          id: 'phone_123',
          friendlyName: 'Updated Support Line',
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.phoneConfigs.update(updateData);

      expect(result.friendlyName).toBe('Updated Support Line');
    });
  });

  describe('delete', () => {
    it('should delete a phone configuration', async () => {
      nock(BASE_URL)
        .delete('/phone-configurations/phone_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.phoneConfigs.delete('phone_123');
      expect(result).toBe(true);
    });

    it('should throw API error when phone configuration not found', async () => {
      nock(BASE_URL)
        .delete('/phone-configurations/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Phone configuration not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.phoneConfigs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list phone configurations with pagination', async () => {
      const mockConfigs: PhoneConfiguration[] = [
        {
          id: 'phone_1',
          phoneNumber: '+12125551111',
          providerPhoneNumberId: 'provider_111',
          phoneRequestId: 'request_111',
          friendlyName: 'Support Line 1',
          providerType: ProviderType.TWILIO,
          status: PhoneStatus.ACTIVE,
          isImported: false,
          isPorted: false,
          markedForRelease: false,
          isUSSMSPermitted: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'phone_2',
          phoneNumber: '+18885552222',
          providerPhoneNumberId: 'provider_222',
          phoneRequestId: 'request_222',
          friendlyName: 'Toll-Free Line',
          providerType: ProviderType.SIGNALWIRE,
          status: PhoneStatus.CALL_ACTIVE,
          isImported: false,
          isPorted: false,
          markedForRelease: false,
          isUSSMSPermitted: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<PhoneConfiguration> = {
        data: mockConfigs,
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
        .get('/phone-configurations')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.phoneConfigs.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });
});
