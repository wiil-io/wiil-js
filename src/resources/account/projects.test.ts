/**
 * @fileoverview Tests for Projects resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { Project, PaginatedResultType, ServiceStatus } from 'wiil-core-js';
import { WiilAPIError, WiilValidationError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProjectsResource', () => {
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
    it('should create a new project', async () => {
      const input = {
        name: 'Production Environment',
        description: 'Main production deployment',
        isDefault: true,
        serviceStatus: ServiceStatus.ACTIVE,
      };

      const mockResponse: Project = {
        id: 'proj_123',
        name: 'Production Environment',
        description: 'Main production deployment',
        isDefault: true,
        serviceStatus: ServiceStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/projects', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.projects.create(input);

      expect(result.id).toBe('proj_123');
      expect(result.name).toBe('Production Environment');
      expect(result.isDefault).toBe(true);
    });

    it('should throw validation error for invalid input', async () => {
      const input = {
        name: 'P', // Too short
        isDefault: true,
      };

      await expect(
        client.projects.create(input as any)
      ).rejects.toThrow(WiilValidationError);
    });
  });

  describe('get', () => {
    it('should retrieve a project by ID', async () => {
      const mockResponse: Project = {
        id: 'proj_123',
        name: 'Production Environment',
        isDefault: true,
        serviceStatus: ServiceStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/projects/proj_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.projects.get('proj_123');

      expect(result.id).toBe('proj_123');
      expect(result.name).toBe('Production Environment');
    });

    it('should throw API error when project not found', async () => {
      nock(BASE_URL)
        .get('/projects/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.projects.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const updateData = {
        id: 'proj_123',
        name: 'Production Environment v2',
        description: 'Updated production deployment',
      };

      const mockResponse: Project = {
        id: 'proj_123',
        name: 'Production Environment v2',
        description: 'Updated production deployment',
        isDefault: true,
        serviceStatus: ServiceStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/projects', {
          id: 'proj_123',
          name: 'Production Environment v2',
          description: 'Updated production deployment',
        })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.projects.update(updateData);

      expect(result.name).toBe('Production Environment v2');
      expect(result.description).toBe('Updated production deployment');
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      nock(BASE_URL)
        .delete('/projects/proj_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.projects.delete('proj_123');
      expect(result).toBe(true);
    });

    it('should throw API error when project not found', async () => {
      nock(BASE_URL)
        .delete('/projects/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.projects.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list projects with pagination', async () => {
      const mockProjects: Project[] = [
        {
          id: 'proj_1',
          name: 'Production',
          isDefault: true,
          serviceStatus: ServiceStatus.ACTIVE,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'proj_2',
          name: 'Development',
          isDefault: false,
          serviceStatus: ServiceStatus.ACTIVE,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<Project> = {
        data: mockProjects,
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
        .get('/projects')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.projects.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should list projects with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<Project> = {
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
        .get('/projects')
        .query({ page: '2', pageSize: '50', sortBy: 'name', sortDirection: 'desc' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.projects.list({
        page: 2,
        pageSize: 50,
        sortBy: 'name',
        sortDirection: 'desc',
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.pageSize).toBe(50);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
