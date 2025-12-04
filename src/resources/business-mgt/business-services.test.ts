/**
 * @fileoverview Tests for Business Services resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { BusinessService, ServiceQRCode, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('BusinessServicesResource', () => {
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
    it('should create a new business service', async () => {
      const input = {
        name: 'Professional Haircut',
        description: 'Premium haircut service with styling',
        duration: 45,
        bufferTime: 15,
        isBookable: true,
        price: 50.00,
        isActive: true,
      };

      const mockResponse: BusinessService = {
        id: 'service_123',
        name: 'Professional Haircut',
        description: 'Premium haircut service with styling',
        duration: 45,
        bufferTime: 15,
        isBookable: true,
        price: 50.00,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/business-services', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.create(input);

      expect(result.id).toBe('service_123');
      expect(result.name).toBe('Professional Haircut');
      expect(result.duration).toBe(45);
      expect(result.price).toBe(50.00);
    });
  });

  describe('get', () => {
    it('should retrieve a business service by ID', async () => {
      const mockResponse: BusinessService = {
        id: 'service_123',
        name: 'Massage Therapy',
        description: '60-minute therapeutic massage',
        duration: 60,
        bufferTime: 10,
        isBookable: true,
        price: 80.00,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/business-services/service_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.get('service_123');

      expect(result.id).toBe('service_123');
      expect(result.name).toBe('Massage Therapy');
      expect(result.duration).toBe(60);
    });

    it('should throw API error when business service not found', async () => {
      nock(BASE_URL)
        .get('/business-services/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Business service not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.businessServices.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('update', () => {
    it('should update a business service', async () => {
      const updateData = {
        id: 'service_123',
        name: 'Premium Massage Therapy',
        price: 90.00,
      };

      const mockResponse: BusinessService = {
        id: 'service_123',
        name: 'Premium Massage Therapy',
        description: '60-minute therapeutic massage',
        duration: 60,
        bufferTime: 10,
        isBookable: true,
        price: 90.00,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/business-services', {
          id: 'service_123',
          name: 'Premium Massage Therapy',
          price: 90.00,
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.update(updateData);

      expect(result.name).toBe('Premium Massage Therapy');
      expect(result.price).toBe(90.00);
    });
  });

  describe('delete', () => {
    it('should delete a business service', async () => {
      nock(BASE_URL)
        .delete('/business-services/service_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.delete('service_123');
      expect(result).toBe(true);
    });

    it('should throw API error when business service not found', async () => {
      nock(BASE_URL)
        .delete('/business-services/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Business service not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.businessServices.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list business services with pagination', async () => {
      const mockServices: BusinessService[] = [
        {
          id: 'service_1',
          name: 'Haircut',
          description: 'Standard haircut',
          duration: 30,
          bufferTime: 10,
          isBookable: true,
          price: 40.00,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'service_2',
          name: 'Consultation',
          description: 'Initial consultation',
          duration: 15,
          bufferTime: 5,
          isBookable: true,
          price: 0,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<BusinessService> = {
        data: mockServices,
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
        .get('/business-services')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].name).toBe('Haircut');
      expect(result.data[1].name).toBe('Consultation');
    });

    it('should list business services with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<BusinessService> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 50,
          totalCount: 100,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/business-services')
        .query({ page: '2', pageSize: '50' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.list({
        page: 2,
        pageSize: 50,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code for specific service', async () => {
      const mockResponse: ServiceQRCode = {
        id: 'qr_123',
        appointmentUrl: 'https://booking.example.com/service/service_123',
        qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
        serviceId: 'service_123',
      };

      nock(BASE_URL)
        .get('/business-services/qr-code/generate')
        .query({ serviceId: 'service_123' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.generateQRCode('service_123');

      expect(result.id).toBe('qr_123');
      expect(result.serviceId).toBe('service_123');
      expect(result.appointmentUrl).toContain('service_123');
      expect(result.qrCodeImage).toBeDefined();
    });

    it('should generate general service QR code without serviceId', async () => {
      const mockResponse: ServiceQRCode = {
        id: 'qr_456',
        appointmentUrl: 'https://booking.example.com/services',
        qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
      };

      nock(BASE_URL)
        .get('/business-services/qr-code/generate')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.businessServices.generateQRCode();

      expect(result.id).toBe('qr_456');
      expect(result.serviceId).toBeUndefined();
      expect(result.appointmentUrl).toBe('https://booking.example.com/services');
    });
  });
});
