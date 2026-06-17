/**
 * @fileoverview Tests for Appointment Field Configs resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { AppointmentFieldConfig, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('AppointmentFieldConfigsResource', () => {
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
    it('should create an appointment field config with basic fields', async () => {
      const input = {
        fields: [
          { fieldKey: 'allergies', fieldType: 'text', label: 'Allergies' },
          { fieldKey: 'notes', fieldType: 'textarea', label: 'Special Notes' },
        ],
        reuseDetails: true,
        ensureEmail: true,
        ensurePhone: true,
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_123',
        fields: [
          { fieldKey: 'allergies', fieldType: 'text', label: 'Allergies' },
          { fieldKey: 'notes', fieldType: 'textarea', label: 'Special Notes' },
        ],
        groups: [],
        reuseDetails: true,
        ensureEmail: true,
        ensurePhone: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.create(input);

      expect(result.id).toBe('afc_123');
      expect(result.fields).toHaveLength(2);
      expect(result.reuseDetails).toBe(true);
      expect(result.ensureEmail).toBe(true);
      expect(result.ensurePhone).toBe(true);
    });

    it('should create a field config with groups', async () => {
      const input = {
        fields: [
          { fieldKey: 'medical_history', fieldType: 'textarea', label: 'Medical History', groupKey: 'medical' },
          { fieldKey: 'allergies', fieldType: 'text', label: 'Allergies', groupKey: 'medical' },
          { fieldKey: 'hair_length', fieldType: 'select', label: 'Hair Length', groupKey: 'preferences' },
        ],
        groups: [
          { groupKey: 'medical', label: 'Medical Information' },
          { groupKey: 'preferences', label: 'Style Preferences' },
        ],
        reuseDetails: false,
        ensureEmail: false,
        ensurePhone: false,
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_456',
        fields: [
          { fieldKey: 'medical_history', fieldType: 'textarea', label: 'Medical History', groupKey: 'medical' },
          { fieldKey: 'allergies', fieldType: 'text', label: 'Allergies', groupKey: 'medical' },
          { fieldKey: 'hair_length', fieldType: 'select', label: 'Hair Length', groupKey: 'preferences' },
        ],
        groups: [
          { groupKey: 'medical', label: 'Medical Information' },
          { groupKey: 'preferences', label: 'Style Preferences' },
        ],
        reuseDetails: false,
        ensureEmail: false,
        ensurePhone: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.create(input);

      expect(result.fields).toHaveLength(3);
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].label).toBe('Medical Information');
    });

    it('should create a field config with select field options', async () => {
      const input = {
        fields: [
          {
            fieldKey: 'hair_length',
            fieldType: 'select',
            label: 'Hair Length',
            options: [
              { value: 'short', label: 'Short' },
              { value: 'medium', label: 'Medium' },
              { value: 'long', label: 'Long' },
            ],
          },
        ],
        reuseDetails: true,
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_789',
        fields: [
          {
            fieldKey: 'hair_length',
            fieldType: 'select',
            label: 'Hair Length',
            options: [
              { value: 'short', label: 'Short' },
              { value: 'medium', label: 'Medium' },
              { value: 'long', label: 'Long' },
            ],
          },
        ],
        groups: [],
        reuseDetails: true,
        ensureEmail: false,
        ensurePhone: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.create(input);

      expect(result.fields[0].options).toHaveLength(3);
      expect(result.fields[0].fieldKey).toBe('hair_length');
    });

    it('should create a minimal field config', async () => {
      const input = {
        fields: [],
        reuseDetails: false,
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_minimal',
        fields: [],
        groups: [],
        reuseDetails: false,
        ensureEmail: false,
        ensurePhone: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.create(input);

      expect(result.fields).toHaveLength(0);
      expect(result.groups).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('should retrieve an appointment field config by ID', async () => {
      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_123',
        fields: [
          { fieldKey: 'allergies', fieldType: 'text', label: 'Allergies' },
        ],
        groups: [],
        reuseDetails: true,
        ensureEmail: true,
        ensurePhone: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/appointment-field-configs/afc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.get('afc_123');

      expect(result.id).toBe('afc_123');
      expect(result.reuseDetails).toBe(true);
      expect(result.fields).toHaveLength(1);
    });

    it('should throw API error when config not found', async () => {
      nock(BASE_URL)
        .get('/appointment-field-configs/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment field config not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.appointmentFieldConfigs.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getWithEmailRequired', () => {
    it('should retrieve configs with email requirement', async () => {
      const mockConfigs: AppointmentFieldConfig[] = [
        {
          id: 'afc_1',
          fields: [],
          groups: [],
          reuseDetails: false,
          ensureEmail: true,
          ensurePhone: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'afc_2',
          fields: [{ fieldKey: 'notes', fieldType: 'text', label: 'Notes' }],
          groups: [],
          reuseDetails: true,
          ensureEmail: true,
          ensurePhone: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
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
        .get('/appointment-field-configs/with-email-required')
        .query({ ensureEmail: 'true' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.getWithEmailRequired();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(c => c.ensureEmail === true)).toBe(true);
    });

    it('should get email required configs with pagination', async () => {
      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
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
        .get('/appointment-field-configs/with-email-required')
        .query({ ensureEmail: 'true', page: '2', pageSize: '10' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.getWithEmailRequired({
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('getWithPhoneRequired', () => {
    it('should retrieve configs with phone requirement', async () => {
      const mockConfigs: AppointmentFieldConfig[] = [
        {
          id: 'afc_1',
          fields: [],
          groups: [],
          reuseDetails: false,
          ensureEmail: false,
          ensurePhone: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
        data: mockConfigs,
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/appointment-field-configs/with-phone-required')
        .query({ ensurePhone: 'true' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.getWithPhoneRequired();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].ensurePhone).toBe(true);
    });

    it('should get phone required configs with pagination', async () => {
      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 15,
          totalCount: 30,
          totalPages: 2,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/appointment-field-configs/with-phone-required')
        .query({ ensurePhone: 'true', page: '1', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.getWithPhoneRequired({
        page: 1,
        pageSize: 15,
      });

      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('getWithReuseEnabled', () => {
    it('should retrieve configs with reuse details enabled', async () => {
      const mockConfigs: AppointmentFieldConfig[] = [
        {
          id: 'afc_1',
          fields: [{ fieldKey: 'allergies', fieldType: 'text', label: 'Allergies' }],
          groups: [],
          reuseDetails: true,
          ensureEmail: false,
          ensurePhone: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'afc_2',
          fields: [],
          groups: [],
          reuseDetails: true,
          ensureEmail: true,
          ensurePhone: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
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
        .get('/appointment-field-configs/with-reuse-enabled')
        .query({ reuseDetails: 'true' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.getWithReuseEnabled();

      expect(result.data).toHaveLength(2);
      expect(result.data.every(c => c.reuseDetails === true)).toBe(true);
    });

    it('should get reuse enabled configs with pagination', async () => {
      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 20,
          totalCount: 60,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/appointment-field-configs/with-reuse-enabled')
        .query({ reuseDetails: 'true', page: '3', pageSize: '20' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.getWithReuseEnabled({
        page: 3,
        pageSize: 20,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.hasNextPage).toBe(false);
    });
  });

  describe('update', () => {
    it('should update field config fields', async () => {
      const input = {
        id: 'afc_123',
        fields: [
          { fieldKey: 'allergies', fieldType: 'text', label: 'Known Allergies', required: true },
        ],
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_123',
        fields: [
          { fieldKey: 'allergies', fieldType: 'text', label: 'Known Allergies', required: true },
        ],
        groups: [],
        reuseDetails: true,
        ensureEmail: true,
        ensurePhone: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.update(input);

      expect(result.fields[0].label).toBe('Known Allergies');
      expect(result.fields[0].required).toBe(true);
    });

    it('should update ensure settings', async () => {
      const input = {
        id: 'afc_456',
        ensureEmail: false,
        ensurePhone: true,
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_456',
        fields: [],
        groups: [],
        reuseDetails: false,
        ensureEmail: false,
        ensurePhone: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.update(input);

      expect(result.ensureEmail).toBe(false);
      expect(result.ensurePhone).toBe(true);
    });

    it('should update reuse details setting', async () => {
      const input = {
        id: 'afc_789',
        reuseDetails: true,
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_789',
        fields: [{ fieldKey: 'notes', fieldType: 'text', label: 'Notes' }],
        groups: [],
        reuseDetails: true,
        ensureEmail: false,
        ensurePhone: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.update(input);

      expect(result.reuseDetails).toBe(true);
    });

    it('should update groups', async () => {
      const input = {
        id: 'afc_999',
        groups: [
          { groupKey: 'contact', label: 'Contact Information' },
          { groupKey: 'medical', label: 'Medical Details' },
        ],
      };

      const mockResponse: AppointmentFieldConfig = {
        id: 'afc_999',
        fields: [],
        groups: [
          { groupKey: 'contact', label: 'Contact Information' },
          { groupKey: 'medical', label: 'Medical Details' },
        ],
        reuseDetails: false,
        ensureEmail: false,
        ensurePhone: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/appointment-field-configs', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.update(input);

      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].groupKey).toBe('contact');
    });
  });

  describe('delete', () => {
    it('should delete an appointment field config', async () => {
      nock(BASE_URL)
        .delete('/appointment-field-configs/afc_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.delete('afc_123');
      expect(result).toBe(true);
    });

    it('should throw API error when config not found', async () => {
      nock(BASE_URL)
        .delete('/appointment-field-configs/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Appointment field config not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.appointmentFieldConfigs.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list appointment field configs with pagination', async () => {
      const mockConfigs: AppointmentFieldConfig[] = [
        {
          id: 'afc_1',
          fields: [{ fieldKey: 'allergies', fieldType: 'text', label: 'Allergies' }],
          groups: [],
          reuseDetails: true,
          ensureEmail: true,
          ensurePhone: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'afc_2',
          fields: [],
          groups: [],
          reuseDetails: false,
          ensureEmail: false,
          ensurePhone: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
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
        .get('/appointment-field-configs')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should list configs with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<AppointmentFieldConfig> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 15,
          totalCount: 45,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/appointment-field-configs')
        .query({ page: '2', pageSize: '15' })
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.appointmentFieldConfigs.list({
        page: 2,
        pageSize: 15,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(15);
      expect(result.meta.totalPages).toBe(3);
    });
  });
});
