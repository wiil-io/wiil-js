/**
 * @fileoverview Tests for Service Appointments resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { ServiceAppointment, PaginatedResultType, AppointmentStatus, CalendarProvider } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ServiceAppointmentsResource', () => {
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
    it('should create a service appointment with basic details', async () => {
      const input = {
        businessServiceId: 'service_123',
        customerId: 'cust_456',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startTime: Date.now(),
        endTime: Date.now() + 60 * 60 * 1000,
        duration: 60,
        totalPrice: 79.99,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
      };

      const mockResponse: ServiceAppointment = {
        id: 'appointment_123',
        businessServiceId: 'service_123',
        customerId: 'cust_456',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startTime: Date.now(),
        endTime: Date.now() + 60 * 60 * 1000,
        duration: 60,
        totalPrice: 79.99,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.create(input);

      expect(result.id).toBe('appointment_123');
      expect(result.businessServiceId).toBe('service_123');
      expect(result.customerId).toBe('cust_456');
      expect(result.duration).toBe(60);
      expect(result.totalPrice).toBe(79.99);
    });

    it('should create an appointment with deposit and assigned service person', async () => {
      const input = {
        businessServiceId: 'service_456',
        customerId: 'cust_789',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        startTime: Date.now(),
        endTime: Date.now() + 45 * 60 * 1000,
        duration: 45,
        totalPrice: 120.00,
        depositPaid: 40.00,
        status: AppointmentStatus.CONFIRMED,
        assignedUserAccountId: 'user_123',
      };

      const mockResponse: ServiceAppointment = {
        id: 'appointment_456',
        businessServiceId: 'service_456',
        customerId: 'cust_789',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        startTime: Date.now(),
        endTime: Date.now() + 45 * 60 * 1000,
        duration: 45,
        totalPrice: 120.00,
        depositPaid: 40.00,
        status: AppointmentStatus.CONFIRMED,
        assignedUserAccountId: 'user_123',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.create(input);

      expect(result.id).toBe('appointment_456');
      expect(result.depositPaid).toBe(40.00);
      expect(result.assignedUserAccountId).toBe('user_123');
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should create an appointment with calendar integration', async () => {
      const input = {
        businessServiceId: 'service_789',
        customerId: 'cust_999',
        customerName: 'Bob Johnson',
        customerEmail: 'bob@example.com',
        startTime: Date.now(),
        endTime: Date.now() + 30 * 60 * 1000,
        duration: 30,
        totalPrice: 50.00,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        calendarId: 'google-cal-123',
        calendarEventId: 'event_456',
        calendarProvider: CalendarProvider.GOOGLE,
      };

      const mockResponse: ServiceAppointment = {
        id: 'appointment_789',
        businessServiceId: 'service_789',
        customerId: 'cust_999',
        customerName: 'Bob Johnson',
        customerEmail: 'bob@example.com',
        startTime: Date.now(),
        endTime: Date.now() + 30 * 60 * 1000,
        duration: 30,
        totalPrice: 50.00,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        calendarId: 'google-cal-123',
        calendarEventId: 'event_456',
        calendarProvider: CalendarProvider.GOOGLE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.create(input);

      expect(result.calendarId).toBe('google-cal-123');
      expect(result.calendarEventId).toBe('event_456');
      expect(result.calendarProvider).toBe(CalendarProvider.GOOGLE);
    });

    it('should create a complimentary appointment', async () => {
      const input = {
        businessServiceId: 'service_free',
        customerId: 'cust_111',
        customerName: 'Alice Brown',
        customerEmail: 'alice@example.com',
        startTime: Date.now(),
        duration: 15,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
      };

      const mockResponse: ServiceAppointment = {
        id: 'appointment_free',
        businessServiceId: 'service_free',
        customerId: 'cust_111',
        customerName: 'Alice Brown',
        customerEmail: 'alice@example.com',
        startTime: Date.now(),
        duration: 15,
        totalPrice: 0,
        depositPaid: 0,
        status: AppointmentStatus.PENDING,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.create(input);

      expect(result.totalPrice).toBe(0);
      expect(result.depositPaid).toBe(0);
    });
  });

  describe('get', () => {
    it('should retrieve a service appointment by ID', async () => {
      const mockResponse: ServiceAppointment = {
        id: 'appointment_123',
        businessServiceId: 'service_123',
        customerId: 'cust_456',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startTime: Date.now(),
        endTime: Date.now() + 60 * 60 * 1000,
        duration: 60,
        totalPrice: 79.99,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/service-appointments/appointment_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.get('appointment_123');

      expect(result.id).toBe('appointment_123');
      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
      expect(result.customerName).toBe('John Doe');
    });

    it('should throw API error when appointment not found', async () => {
      nock(BASE_URL)
        .get('/service-appointments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service appointment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceAppointments.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve appointments by customer ID', async () => {
      const mockAppointments: ServiceAppointment[] = [
        {
          id: 'appointment_1',
          businessServiceId: 'service_1',
          customerId: 'cust_123',
          customerName: 'John Doe',
          startTime: Date.now(),
          duration: 60,
          totalPrice: 79.99,
          depositPaid: 0,
          status: AppointmentStatus.COMPLETED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'appointment_2',
          businessServiceId: 'service_2',
          customerId: 'cust_123',
          customerName: 'John Doe',
          startTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
          duration: 45,
          totalPrice: 120.00,
          depositPaid: 40.00,
          status: AppointmentStatus.CONFIRMED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceAppointment> = {
        data: mockAppointments,
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
        .get('/service-appointments/by-customer/cust_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.getByCustomer('cust_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.customerId === 'cust_123')).toBe(true);
      expect(result.data[0].status).toBe(AppointmentStatus.COMPLETED);
      expect(result.data[1].status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should get customer appointments with pagination', async () => {
      const mockResponse: PaginatedResultType<ServiceAppointment> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 30,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/service-appointments/by-customer/cust_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.getByCustomer('cust_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByService', () => {
    it('should retrieve appointments by service ID', async () => {
      const mockAppointments: ServiceAppointment[] = [
        {
          id: 'appointment_1',
          businessServiceId: 'service_123',
          customerId: 'cust_1',
          startTime: Date.now(),
          duration: 60,
          totalPrice: 79.99,
          depositPaid: 0,
          status: AppointmentStatus.CONFIRMED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'appointment_2',
          businessServiceId: 'service_123',
          customerId: 'cust_2',
          startTime: Date.now() + 2 * 60 * 60 * 1000,
          duration: 60,
          totalPrice: 79.99,
          depositPaid: 0,
          status: AppointmentStatus.PENDING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceAppointment> = {
        data: mockAppointments,
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
        .get('/service-appointments/by-service/service_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.getByService('service_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(a => a.businessServiceId === 'service_123')).toBe(true);
    });

    it('should get service appointments with pagination', async () => {
      const mockResponse: PaginatedResultType<ServiceAppointment> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 15,
          totalCount: 50,
          totalPages: 4,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/service-appointments/by-service/service_456')
        .query({ page: '1', pageSize: '15' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.getByService('service_456', {
        page: 1,
        pageSize: 15,
      });

      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status to CONFIRMED', async () => {
      const mockResponse: ServiceAppointment = {
        id: 'appointment_123',
        businessServiceId: 'service_123',
        customerId: 'cust_456',
        startTime: Date.now(),
        duration: 60,
        totalPrice: 79.99,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-appointments/appointment_123/status', { status: AppointmentStatus.CONFIRMED })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.updateStatus('appointment_123', { status: AppointmentStatus.CONFIRMED });

      expect(result.status).toBe(AppointmentStatus.CONFIRMED);
    });

    it('should update appointment status to NO_SHOW', async () => {
      const mockResponse: ServiceAppointment = {
        id: 'appointment_456',
        businessServiceId: 'service_456',
        customerId: 'cust_789',
        startTime: Date.now(),
        duration: 45,
        totalPrice: 120.00,
        depositPaid: 40.00,
        status: AppointmentStatus.NO_SHOW,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-appointments/appointment_456/status', { status: AppointmentStatus.NO_SHOW })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.updateStatus('appointment_456', { status: AppointmentStatus.NO_SHOW });

      expect(result.status).toBe(AppointmentStatus.NO_SHOW);
    });

    it('should update appointment status to COMPLETED', async () => {
      const mockResponse: ServiceAppointment = {
        id: 'appointment_789',
        businessServiceId: 'service_789',
        customerId: 'cust_999',
        startTime: Date.now(),
        duration: 30,
        totalPrice: 50.00,
        depositPaid: 0,
        status: AppointmentStatus.COMPLETED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/service-appointments/appointment_789/status', { status: AppointmentStatus.COMPLETED })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.updateStatus('appointment_789', { status: AppointmentStatus.COMPLETED });

      expect(result.status).toBe(AppointmentStatus.COMPLETED);
    });
  });

  describe('cancel', () => {
    it('should cancel an appointment with reason', async () => {
      const mockResponse: ServiceAppointment = {
        id: 'appointment_123',
        businessServiceId: 'service_123',
        customerId: 'cust_456',
        startTime: Date.now(),
        duration: 60,
        totalPrice: 79.99,
        depositPaid: 0,
        status: AppointmentStatus.CANCELLED,
        cancelReason: 'Customer requested cancellation',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments/appointment_123/cancel', { reason: 'Customer requested cancellation' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.cancel('appointment_123', { reason: 'Customer requested cancellation' });

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
      expect(result.cancelReason).toBe('Customer requested cancellation');
    });

    it('should cancel an appointment without reason', async () => {
      const mockResponse: ServiceAppointment = {
        id: 'appointment_456',
        businessServiceId: 'service_456',
        customerId: 'cust_789',
        startTime: Date.now(),
        duration: 45,
        totalPrice: 120.00,
        depositPaid: 40.00,
        status: AppointmentStatus.CANCELLED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments/appointment_456/cancel', {})
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.cancel('appointment_456', {});

      expect(result.status).toBe(AppointmentStatus.CANCELLED);
    });
  });

  describe('reschedule', () => {
    it('should reschedule an appointment with new time', async () => {
      const newStartTime = Date.now() + 24 * 60 * 60 * 1000;
      const newEndTime = newStartTime + 60 * 60 * 1000;

      const mockResponse: ServiceAppointment = {
        id: 'appointment_123',
        businessServiceId: 'service_123',
        customerId: 'cust_456',
        startTime: newStartTime,
        endTime: newEndTime,
        duration: 60,
        totalPrice: 79.99,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments/appointment_123/reschedule', {
          startTime: newStartTime.toString(),
          endTime: newEndTime.toString(),
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.reschedule('appointment_123', {
        startTime: newStartTime.toString(),
        endTime: newEndTime.toString(),
      });

      expect(result.startTime).toBe(newStartTime);
      expect(result.endTime).toBe(newEndTime);
    });

    it('should reschedule with different service', async () => {
      const newStartTime = Date.now() + 24 * 60 * 60 * 1000;
      const newEndTime = newStartTime + 45 * 60 * 1000;

      const mockResponse: ServiceAppointment = {
        id: 'appointment_123',
        businessServiceId: 'service_456',
        customerId: 'cust_456',
        startTime: newStartTime,
        endTime: newEndTime,
        duration: 45,
        totalPrice: 120.00,
        depositPaid: 0,
        status: AppointmentStatus.CONFIRMED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/service-appointments/appointment_123/reschedule', {
          startTime: newStartTime.toString(),
          endTime: newEndTime.toString(),
          serviceId: 'service_456',
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.reschedule('appointment_123', {
        startTime: newStartTime.toString(),
        endTime: newEndTime.toString(),
        serviceId: 'service_456',
      });

      expect(result.businessServiceId).toBe('service_456');
      expect(result.duration).toBe(45);
    });
  });

  describe('delete', () => {
    it('should delete a service appointment', async () => {
      nock(BASE_URL)
        .delete('/service-appointments/appointment_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.delete('appointment_123');
      expect(result).toBe(true);
    });

    it('should throw API error when appointment not found', async () => {
      nock(BASE_URL)
        .delete('/service-appointments/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Service appointment not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.serviceAppointments.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list service appointments with pagination', async () => {
      const mockAppointments: ServiceAppointment[] = [
        {
          id: 'appointment_1',
          businessServiceId: 'service_1',
          customerId: 'cust_1',
          startTime: Date.now(),
          duration: 60,
          totalPrice: 79.99,
          depositPaid: 0,
          status: AppointmentStatus.CONFIRMED,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'appointment_2',
          businessServiceId: 'service_2',
          customerId: 'cust_2',
          startTime: Date.now() + 24 * 60 * 60 * 1000,
          duration: 45,
          totalPrice: 120.00,
          depositPaid: 40.00,
          status: AppointmentStatus.PENDING,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ServiceAppointment> = {
        data: mockAppointments,
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
        .get('/service-appointments')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].status).toBe(AppointmentStatus.CONFIRMED);
      expect(result.data[1].status).toBe(AppointmentStatus.PENDING);
    });

    it('should list appointments with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ServiceAppointment> = {
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
        .get('/service-appointments')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.serviceAppointments.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
