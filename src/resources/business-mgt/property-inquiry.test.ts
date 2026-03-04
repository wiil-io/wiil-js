/**
 * @fileoverview Tests for Property Inquiry resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import {
  PropertyInquiry,
  PaginatedResultType,
  PropertyInquiryType,
  PropertyInquiryStatus,
  CreatePropertyInquiry,
  UpdatePropertyInquiry,
  UpdatePropertyInquiryStatus,
} from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('PropertyInquiryResource', () => {
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
    it('should create a new property inquiry', async () => {
      const input = {
        organizationId: 'org_123',
        propertyId: 'property_123',
        customerId: 'cust_456',
        customer: {
          id: 'cust_456',
          firstname: 'John',
          lastname: 'Doe',
          phone_number: '+12125551234',
          email: 'john@example.com',
        },
        inquiryType: PropertyInquiryType.OFFER,
        message: 'I would like to schedule a viewing for this property.',
        source: 'website',
        status: PropertyInquiryStatus.NEW,
        preferredViewingDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        preferredViewingTime: '2:00 PM',
        viewingCompleted: false,
        convertedToTransaction: false,
        interestedInBuying: true,
        interestedInRenting: false,
        budgetMin: 400000,
        budgetMax: 500000,
      } as CreatePropertyInquiry;

      const mockResponse = {
        id: 'inquiry_123',
        organizationId: 'org_123',
        propertyId: 'property_123',
        customerId: 'cust_456',
        customer: {
          id: 'cust_456',
          firstname: 'John',
          lastname: 'Doe',
          phone_number: '+12125551234',
          email: 'john@example.com',
        },
        inquiryType: PropertyInquiryType.OFFER,
        message: 'I would like to schedule a viewing for this property.',
        source: 'website',
        status: PropertyInquiryStatus.NEW,
        preferredViewingDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        preferredViewingTime: '2:00 PM',
        viewingCompleted: false,
        convertedToTransaction: false,
        interestedInBuying: true,
        interestedInRenting: false,
        budgetMin: 400000,
        budgetMax: 500000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PropertyInquiry;

      nock(BASE_URL)
        .post('/property-inquiries')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.create(input);

      expect(result.id).toBe('inquiry_123');
      expect(result.propertyId).toBe('property_123');
      expect(result.inquiryType).toBe(PropertyInquiryType.OFFER);
      expect(result.status).toBe(PropertyInquiryStatus.NEW);
      expect(result.interestedInBuying).toBe(true);
    });

    it('should create an inquiry with rental interest', async () => {
      const input = {
        organizationId: 'org_123',
        propertyId: 'property_456',
        customerId: 'cust_789',
        customer: {
          id: 'cust_789',
          firstname: 'Jane',
          lastname: 'Smith',
          phone_number: '+13105559876',
          email: 'jane@example.com',
        },
        inquiryType: PropertyInquiryType.GENERAL,
        message: 'Is this property available for a 12-month lease?',
        source: 'referral',
        status: PropertyInquiryStatus.NEW,
        viewingCompleted: false,
        convertedToTransaction: false,
        interestedInBuying: false,
        interestedInRenting: true,
        budgetMin: 2000,
        budgetMax: 3000,
      } as CreatePropertyInquiry;

      const mockResponse = {
        id: 'inquiry_456',
        organizationId: 'org_123',
        propertyId: 'property_456',
        customerId: 'cust_789',
        customer: {
          id: 'cust_789',
          firstname: 'Jane',
          lastname: 'Smith',
          phone_number: '+13105559876',
          email: 'jane@example.com',
        },
        inquiryType: PropertyInquiryType.GENERAL,
        message: 'Is this property available for a 12-month lease?',
        source: 'referral',
        status: PropertyInquiryStatus.NEW,
        viewingCompleted: false,
        convertedToTransaction: false,
        interestedInBuying: false,
        interestedInRenting: true,
        budgetMin: 2000,
        budgetMax: 3000,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PropertyInquiry;

      nock(BASE_URL)
        .post('/property-inquiries')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.create(input);

      expect(result.interestedInRenting).toBe(true);
      expect(result.interestedInBuying).toBe(false);
      expect(result.source).toBe('referral');
    });
  });

  describe('get', () => {
    it('should retrieve a property inquiry by ID', async () => {
      const mockResponse = {
        id: 'inquiry_123',
        organizationId: 'org_123',
        propertyId: 'property_123',
        customerId: 'cust_456',
        customer: {
          id: 'cust_456',
          firstname: 'John',
          lastname: 'Doe',
          phone_number: '+12125551234',
          email: 'john@example.com',
        },
        inquiryType: PropertyInquiryType.OFFER,
        source: 'website',
        status: PropertyInquiryStatus.CONTACTED,
        scheduledViewingDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
        viewingCompleted: false,
        assignedAgentId: 'agent_789',
        convertedToTransaction: false,
        interestedInBuying: true,
        interestedInRenting: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PropertyInquiry;

      nock(BASE_URL)
        .get('/property-inquiries/inquiry_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.get('inquiry_123');

      expect(result.id).toBe('inquiry_123');
      expect(result.status).toBe(PropertyInquiryStatus.CONTACTED);
      expect(result.assignedAgentId).toBe('agent_789');
    });

    it('should throw API error when inquiry not found', async () => {
      nock(BASE_URL)
        .get('/property-inquiries/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Property inquiry not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.propertyInquiries.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByProperty', () => {
    it('should retrieve inquiries by property ID', async () => {
      const mockInquiries = [
        {
          id: 'inquiry_1',
          organizationId: 'org_123',
          propertyId: 'property_123',
          customerId: 'cust_001',
          customer: { id: 'cust_001', firstname: 'User', lastname: 'A', phone_number: '+11111111111' },
          inquiryType: PropertyInquiryType.OFFER,
          source: 'website',
          status: PropertyInquiryStatus.NEW,
          viewingCompleted: false,
          convertedToTransaction: false,
          interestedInBuying: true,
          interestedInRenting: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'inquiry_2',
          organizationId: 'org_123',
          propertyId: 'property_123',
          customerId: 'cust_002',
          customer: { id: 'cust_002', firstname: 'User', lastname: 'B', phone_number: '+12222222222' },
          inquiryType: PropertyInquiryType.GENERAL,
          source: 'agent',
          status: PropertyInquiryStatus.CONTACTED,
          viewingCompleted: false,
          convertedToTransaction: false,
          interestedInBuying: false,
          interestedInRenting: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ] as PropertyInquiry[];

      const mockResponse: PaginatedResultType<PropertyInquiry> = {
        data: mockInquiries,
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
        .get('/property-inquiries/by-property/property_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.getByProperty('property_123');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(i => i.propertyId === 'property_123')).toBe(true);
    });

    it('should get property inquiries with pagination', async () => {
      const mockResponse: PaginatedResultType<PropertyInquiry> = {
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
        .get('/property-inquiries/by-property/property_456')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.getByProperty('property_456', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve inquiries by customer ID', async () => {
      const mockInquiries = [
        {
          id: 'inquiry_1',
          organizationId: 'org_123',
          propertyId: 'property_111',
          customerId: 'cust_456',
          customer: { id: 'cust_456', firstname: 'John', lastname: 'Doe', phone_number: '+12125551234' },
          inquiryType: PropertyInquiryType.OFFER,
          source: 'website',
          status: PropertyInquiryStatus.VIEWING_SCHEDULED,
          viewingCompleted: false,
          convertedToTransaction: false,
          interestedInBuying: true,
          interestedInRenting: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'inquiry_2',
          organizationId: 'org_123',
          propertyId: 'property_222',
          customerId: 'cust_456',
          customer: { id: 'cust_456', firstname: 'John', lastname: 'Doe', phone_number: '+12125551234' },
          inquiryType: PropertyInquiryType.OFFER,
          source: 'website',
          status: PropertyInquiryStatus.CONTACTED,
          viewingCompleted: false,
          convertedToTransaction: false,
          interestedInBuying: true,
          interestedInRenting: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ] as PropertyInquiry[];

      const mockResponse: PaginatedResultType<PropertyInquiry> = {
        data: mockInquiries,
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
        .get('/property-inquiries/by-customer/cust_456')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.getByCustomer('cust_456');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(i => i.customerId === 'cust_456')).toBe(true);
    });

    it('should get customer inquiries with pagination', async () => {
      const mockResponse: PaginatedResultType<PropertyInquiry> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 5,
          totalCount: 12,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/property-inquiries/by-customer/cust_789')
        .query({ page: '1', pageSize: '5' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.getByCustomer('cust_789', {
        page: 1,
        pageSize: 5,
      });

      expect(result.meta.pageSize).toBe(5);
      expect(result.meta.totalCount).toBe(12);
    });
  });

  describe('update', () => {
    it('should update a property inquiry', async () => {
      const updateData = {
        id: 'inquiry_123',
        assignedAgentId: 'agent_999',
        followUpDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
        followUpNotes: 'Follow up on viewing availability',
        notes: 'Client prefers morning viewings',
      } as UpdatePropertyInquiry;

      const mockResponse = {
        id: 'inquiry_123',
        organizationId: 'org_123',
        propertyId: 'property_123',
        customerId: 'cust_456',
        customer: { id: 'cust_456', firstname: 'John', lastname: 'Doe', phone_number: '+12125551234' },
        inquiryType: PropertyInquiryType.OFFER,
        source: 'website',
        status: PropertyInquiryStatus.CONTACTED,
        assignedAgentId: 'agent_999',
        followUpDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
        followUpNotes: 'Follow up on viewing availability',
        notes: 'Client prefers morning viewings',
        viewingCompleted: false,
        convertedToTransaction: false,
        interestedInBuying: true,
        interestedInRenting: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PropertyInquiry;

      nock(BASE_URL)
        .patch('/property-inquiries')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.update(updateData);

      expect(result.assignedAgentId).toBe('agent_999');
      expect(result.followUpNotes).toBe('Follow up on viewing availability');
      expect(result.notes).toBe('Client prefers morning viewings');
    });
  });

  describe('updateStatus', () => {
    it('should update inquiry status with viewing details', async () => {
      const statusUpdate = {
        id: 'inquiry_123',
        status: PropertyInquiryStatus.VIEWING_SCHEDULED,
        scheduledViewingDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
      } as UpdatePropertyInquiryStatus;

      const mockResponse = {
        id: 'inquiry_123',
        organizationId: 'org_123',
        propertyId: 'property_123',
        customerId: 'cust_456',
        customer: { id: 'cust_456', firstname: 'John', lastname: 'Doe', phone_number: '+12125551234' },
        inquiryType: PropertyInquiryType.OFFER,
        source: 'website',
        status: PropertyInquiryStatus.VIEWING_SCHEDULED,
        scheduledViewingDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
        viewingCompleted: false,
        convertedToTransaction: false,
        interestedInBuying: true,
        interestedInRenting: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PropertyInquiry;

      nock(BASE_URL)
        .patch('/property-inquiries/inquiry_123/status')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.updateStatus('inquiry_123', statusUpdate);

      expect(result.status).toBe(PropertyInquiryStatus.VIEWING_SCHEDULED);
      expect(result.scheduledViewingDate).toBeDefined();
    });

    it('should mark viewing as completed with notes', async () => {
      const statusUpdate = {
        id: 'inquiry_456',
        status: PropertyInquiryStatus.FOLLOW_UP,
        viewingCompleted: true,
        viewingNotes: 'Client loved the kitchen but concerned about parking',
        followUpDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
        followUpNotes: 'Discuss pricing options',
      } as UpdatePropertyInquiryStatus;

      const mockResponse = {
        id: 'inquiry_456',
        organizationId: 'org_123',
        propertyId: 'property_456',
        customerId: 'cust_789',
        customer: { id: 'cust_789', firstname: 'Jane', lastname: 'Smith', phone_number: '+13105559876' },
        inquiryType: PropertyInquiryType.OFFER,
        source: 'referral',
        status: PropertyInquiryStatus.FOLLOW_UP,
        viewingCompleted: true,
        viewingNotes: 'Client loved the kitchen but concerned about parking',
        followUpDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
        followUpNotes: 'Discuss pricing options',
        convertedToTransaction: false,
        interestedInBuying: true,
        interestedInRenting: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PropertyInquiry;

      nock(BASE_URL)
        .patch('/property-inquiries/inquiry_456/status')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.updateStatus('inquiry_456', statusUpdate);

      expect(result.status).toBe(PropertyInquiryStatus.FOLLOW_UP);
      expect(result.viewingCompleted).toBe(true);
      expect(result.viewingNotes).toBe('Client loved the kitchen but concerned about parking');
    });

    it('should update status to closed-converted', async () => {
      const statusUpdate = {
        id: 'inquiry_789',
        status: PropertyInquiryStatus.CONVERTED,
      } as UpdatePropertyInquiryStatus;

      const mockResponse = {
        id: 'inquiry_789',
        organizationId: 'org_123',
        propertyId: 'property_789',
        customerId: 'cust_111',
        customer: { id: 'cust_111', firstname: 'Bob', lastname: 'Wilson', phone_number: '+14155551111' },
        inquiryType: PropertyInquiryType.OFFER,
        source: 'website',
        status: PropertyInquiryStatus.CONVERTED,
        viewingCompleted: true,
        convertedToTransaction: true,
        transactionId: 'txn_001',
        transactionType: 'purchase',
        interestedInBuying: true,
        interestedInRenting: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as PropertyInquiry;

      nock(BASE_URL)
        .patch('/property-inquiries/inquiry_789/status')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.updateStatus('inquiry_789', statusUpdate);

      expect(result.status).toBe(PropertyInquiryStatus.CONVERTED);
      expect(result.convertedToTransaction).toBe(true);
      expect(result.transactionId).toBe('txn_001');
    });
  });

  describe('delete', () => {
    it('should delete a property inquiry', async () => {
      nock(BASE_URL)
        .delete('/property-inquiries/inquiry_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.delete('inquiry_123');
      expect(result).toBe(true);
    });

    it('should throw API error when inquiry not found', async () => {
      nock(BASE_URL)
        .delete('/property-inquiries/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Property inquiry not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.propertyInquiries.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list property inquiries with pagination', async () => {
      const mockInquiries = [
        {
          id: 'inquiry_1',
          organizationId: 'org_123',
          propertyId: 'property_111',
          customerId: 'cust_001',
          customer: { id: 'cust_001', firstname: 'User', lastname: 'A', phone_number: '+11111111111' },
          inquiryType: PropertyInquiryType.OFFER,
          source: 'website',
          status: PropertyInquiryStatus.NEW,
          viewingCompleted: false,
          convertedToTransaction: false,
          interestedInBuying: true,
          interestedInRenting: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'inquiry_2',
          organizationId: 'org_123',
          propertyId: 'property_222',
          customerId: 'cust_002',
          customer: { id: 'cust_002', firstname: 'User', lastname: 'B', phone_number: '+12222222222' },
          inquiryType: PropertyInquiryType.GENERAL,
          source: 'agent',
          status: PropertyInquiryStatus.CONTACTED,
          viewingCompleted: false,
          convertedToTransaction: false,
          interestedInBuying: false,
          interestedInRenting: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ] as PropertyInquiry[];

      const mockResponse: PaginatedResultType<PropertyInquiry> = {
        data: mockInquiries,
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
        .get('/property-inquiries')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].status).toBe(PropertyInquiryStatus.NEW);
    });

    it('should list inquiries with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<PropertyInquiry> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 25,
          totalCount: 75,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/property-inquiries')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.propertyInquiries.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
