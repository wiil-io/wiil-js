/**
 * @fileoverview Tests for Appointment Additional Info resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { AppointmentAdditionalInfo, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('AppointmentAdditionalInfoResource', () => {
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
    it('should create appointment additional info with basic data', async () => {
      const input = {
        businessServiceId: 'svc_123',
        appointmentId: 'apt_456',
        customerId: 'cust_789',
        data: {
          allergies: 'None',
          preferredStylist: 'Jane',
          notes: 'First time customer',
        },
      };

      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_123',
        businessServiceId: 'svc_123',
        appointmentId: 'apt_456',
        customerId: 'cust_789',
        data: {
          allergies: 'None',
          preferredStylist: 'Jane',
          notes: 'First time customer',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-additional-info', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.create(input);

      expect(result.id).toBe('aai_123');
      expect(result.businessServiceId).toBe('svc_123');
      expect(result.appointmentId).toBe('apt_456');
      expect(result.customerId).toBe('cust_789');
      expect(result.data.allergies).toBe('None');
      expect(result.data.preferredStylist).toBe('Jane');
    });

    it('should create additional info with medical history fields', async () => {
      const input = {
        businessServiceId: 'svc_456',
        appointmentId: 'apt_789',
        customerId: 'cust_111',
        data: {
          medicalHistory: 'No known conditions',
          emergencyContact: '+1-555-0100',
          medications: 'None',
          bloodType: 'O+',
        },
      };

      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_456',
        businessServiceId: 'svc_456',
        appointmentId: 'apt_789',
        customerId: 'cust_111',
        data: {
          medicalHistory: 'No known conditions',
          emergencyContact: '+1-555-0100',
          medications: 'None',
          bloodType: 'O+',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-additional-info', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.create(input);

      expect(result.data.medicalHistory).toBe('No known conditions');
      expect(result.data.emergencyContact).toBe('+1-555-0100');
    });

    it('should create additional info with empty data object', async () => {
      const input = {
        businessServiceId: 'svc_789',
        appointmentId: 'apt_222',
        customerId: 'cust_333',
        data: {},
      };

      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_789',
        businessServiceId: 'svc_789',
        appointmentId: 'apt_222',
        customerId: 'cust_333',
        data: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-additional-info', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.create(input);

      expect(result.data).toEqual({});
    });

    it('should create additional info with various field types', async () => {
      const input = {
        businessServiceId: 'svc_999',
        appointmentId: 'apt_444',
        customerId: 'cust_555',
        data: {
          stringField: 'text value',
          numberField: 42,
          booleanField: true,
          arrayField: ['option1', 'option2'],
          dateField: '2024-01-15',
        },
      };

      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_999',
        businessServiceId: 'svc_999',
        appointmentId: 'apt_444',
        customerId: 'cust_555',
        data: {
          stringField: 'text value',
          numberField: 42,
          booleanField: true,
          arrayField: ['option1', 'option2'],
          dateField: '2024-01-15',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-additional-info', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.create(input);

      expect(result.data.stringField).toBe('text value');
      expect(result.data.numberField).toBe(42);
      expect(result.data.booleanField).toBe(true);
      expect(result.data.arrayField).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should retrieve appointment additional info by ID', async () => {
      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_123',
        businessServiceId: 'svc_123',
        appointmentId: 'apt_456',
        customerId: 'cust_789',
        data: {
          allergies: 'Penicillin',
          notes: 'Returning customer',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/appointment-additional-info/aai_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.get('aai_123');

      expect(result.id).toBe('aai_123');
      expect(result.data.allergies).toBe('Penicillin');
    });

    it('should throw API error when info not found', async () => {
      nock(BASE_URL)
        .get('/appointment-additional-info/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment additional info not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.appointmentAdditionalInfo.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByAppointment', () => {
    it('should retrieve additional info by appointment ID', async () => {
      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_123',
        businessServiceId: 'svc_123',
        appointmentId: 'apt_456',
        customerId: 'cust_789',
        data: {
          hairLength: 'Medium',
          colorPreference: 'Natural',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/appointment-additional-info/by-appointment/apt_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.getByAppointment('apt_456');

      expect(result.appointmentId).toBe('apt_456');
      expect(result.data.hairLength).toBe('Medium');
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve additional info records by customer ID', async () => {
      const mockInfos: AppointmentAdditionalInfo[] = [
        {
          id: 'aai_1',
          businessServiceId: 'svc_1',
          appointmentId: 'apt_1',
          customerId: 'cust_123',
          data: { notes: 'Visit 1' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'aai_2',
          businessServiceId: 'svc_2',
          appointmentId: 'apt_2',
          customerId: 'cust_123',
          data: { notes: 'Visit 2' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AppointmentAdditionalInfo> = {
        data: mockInfos,
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
        .get('/appointment-additional-info/by-customer/cust_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.getByCustomer('cust_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(info => info.customerId === 'cust_123')).toBe(true);
    });

    it('should get customer info with pagination', async () => {
      const mockResponse: PaginatedResultType<AppointmentAdditionalInfo> = {
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
        .get('/appointment-additional-info/by-customer/cust_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.getByCustomer('cust_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByBusinessService', () => {
    it('should retrieve additional info records by business service ID', async () => {
      const mockInfos: AppointmentAdditionalInfo[] = [
        {
          id: 'aai_1',
          businessServiceId: 'svc_123',
          appointmentId: 'apt_1',
          customerId: 'cust_1',
          data: { preference: 'Short' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'aai_2',
          businessServiceId: 'svc_123',
          appointmentId: 'apt_2',
          customerId: 'cust_2',
          data: { preference: 'Long' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AppointmentAdditionalInfo> = {
        data: mockInfos,
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
        .get('/appointment-additional-info/by-business-service/svc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.getByBusinessService('svc_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(info => info.businessServiceId === 'svc_123')).toBe(true);
    });

    it('should get service info with pagination', async () => {
      const mockResponse: PaginatedResultType<AppointmentAdditionalInfo> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 15,
          totalCount: 45,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/appointment-additional-info/by-business-service/svc_456')
        .query({ page: '1', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.getByBusinessService('svc_456', {
        page: 1,
        pageSize: 15,
      });

      expect(result.meta.totalPages).toBe(3);
    });
  });

  describe('update', () => {
    it('should update additional info data fields', async () => {
      const input = {
        id: 'aai_123',
        data: {
          allergies: 'Penicillin',
          notes: 'Updated notes',
        },
      };

      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_123',
        businessServiceId: 'svc_123',
        appointmentId: 'apt_456',
        customerId: 'cust_789',
        data: {
          allergies: 'Penicillin',
          notes: 'Updated notes',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/appointment-additional-info', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.update(input);

      expect(result.data.allergies).toBe('Penicillin');
      expect(result.data.notes).toBe('Updated notes');
    });

    it('should update with new data fields', async () => {
      const input = {
        id: 'aai_456',
        data: {
          newField: 'new value',
          anotherField: 123,
        },
      };

      const mockResponse: AppointmentAdditionalInfo = {
        id: 'aai_456',
        businessServiceId: 'svc_456',
        appointmentId: 'apt_789',
        customerId: 'cust_111',
        data: {
          newField: 'new value',
          anotherField: 123,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/appointment-additional-info', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.update(input);

      expect(result.data.newField).toBe('new value');
      expect(result.data.anotherField).toBe(123);
    });
  });

  describe('delete', () => {
    it('should delete appointment additional info', async () => {
      nock(BASE_URL)
        .delete('/appointment-additional-info/aai_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.delete('aai_123');
      expect(result).toBe(true);
    });

    it('should throw API error when info not found', async () => {
      nock(BASE_URL)
        .delete('/appointment-additional-info/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment additional info not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.appointmentAdditionalInfo.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list appointment additional info with pagination', async () => {
      const mockInfos: AppointmentAdditionalInfo[] = [
        {
          id: 'aai_1',
          businessServiceId: 'svc_1',
          appointmentId: 'apt_1',
          customerId: 'cust_1',
          data: { field1: 'value1' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'aai_2',
          businessServiceId: 'svc_2',
          appointmentId: 'apt_2',
          customerId: 'cust_2',
          data: { field2: 'value2' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AppointmentAdditionalInfo> = {
        data: mockInfos,
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
        .get('/appointment-additional-info')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list info with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<AppointmentAdditionalInfo> = {
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
        .get('/appointment-additional-info')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentAdditionalInfo.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
    });
  });
});
