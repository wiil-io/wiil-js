/**
 * @fileoverview Projects resource for managing project entities.
 * @module resources/projects
 */

import {
  Project,
  CreateProjectSchema,
  CreateProject,
  UpdateProjectSchema,
  UpdateProject,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing projects in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * projects. Projects are organizational units within an organization that group
 * resources, deployments, and configurations. Supports retrieving the default
 * project for an organization. All methods require proper authentication via
 * API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new project
 * const project = await client.projects.create({
 *   name: 'Production Environment',
 *   description: 'Main production deployment',
 *   compliance: ['SOC2', 'HIPAA']
 * });
 *
 * // Get a project by ID
 * const proj = await client.projects.get('proj_123');
 *
 * // Get the default project
 * const defaultProj = await client.projects.getDefault();
 *
 * // Update a project
 * const updated = await client.projects.update({
 *   id: 'proj_123',
 *   description: 'Updated production deployment',
 *   regionId: 'us-west-2'
 * });
 *
 * // List all projects
 * const projects = await client.projects.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete a project
 * await client.projects.delete('proj_123');
 * ```
 */
export class ProjectsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/projects';

  /**
   * Creates a new ProjectsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new project.
   *
   * @param data - Project data
   * @returns Promise resolving to the created project
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const project = await client.projects.create({
   *   name: 'Development Environment',
   *   description: 'Development and testing project',
   *   compliance: ['SOC2'],
   *   metadata: {
   *     environment: 'development',
   *     team: 'engineering'
   *   }
   * });
   * console.log('Created project:', project.id);
   * ```
   */
  public async create(data: CreateProject): Promise<Project> {
    return this.http.post<CreateProject, Project>(
      this.resource_path,
      data,
      CreateProjectSchema
    );
  }

  /**
   * Retrieves a project by ID.
   *
   * @param id - Project ID
   * @returns Promise resolving to the project
   *
   * @throws {@link WiilAPIError} - When the project is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const project = await client.projects.get('proj_123');
   * console.log('Project:', project.name);
   * console.log('Is Default:', project.isDefault);
   * ```
   */
  public async get(id: string): Promise<Project> {
    return this.http.get<Project>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves the default project for the current organization.
   *
   * @returns Promise resolving to the default project
   *
   * @throws {@link WiilAPIError} - When the default project is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * Every organization should have a default project. This method retrieves
   * the project marked as default for the authenticated organization.
   *
   * @example
   * ```typescript
   * const defaultProject = await client.projects.getDefault();
   * console.log('Default Project:', defaultProject.name);
   * console.log('Project ID:', defaultProject.id);
   * ```
   */
  public async getDefault(): Promise<Project> {
    return this.http.get<Project>(`${this.resource_path}/default`);
  }

  /**
   * Updates an existing project.
   *
   * @param data - Project update data (must include id)
   * @returns Promise resolving to the updated project
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the project is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const updated = await client.projects.update({
   *   id: 'proj_123',
   *   name: 'Production Environment v2',
   *   description: 'Updated production deployment',
   *   metadata: {
   *     updatedBy: 'admin-user',
   *     version: '2.0'
   *   }
   * });
   * console.log('Updated project:', updated.name);
   * ```
   */
  public async update(data: UpdateProject): Promise<Project> {
    return this.http.patch<UpdateProject, Project>(
      this.resource_path,
      data,
      UpdateProjectSchema
    );
  }

  /**
   * Deletes a project.
   *
   * @param id - Project ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the project is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @remarks
   * This operation is irreversible. Ensure you have proper authorization
   * before deleting a project. All resources associated with the project
   * may also be affected.
   *
   * @example
   * ```typescript
   * const deleted = await client.projects.delete('proj_123');
   * if (deleted) {
   *   console.log('Project deleted successfully');
   * }
   * ```
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists projects with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of projects
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * // List first page with default page size
   * const result = await client.projects.list();
   *
   * // List with custom pagination
   * const page2 = await client.projects.list({
   *   page: 2,
   *   pageSize: 50,
   *   sortBy: 'name',
   *   sortDirection: 'desc'
   * });
   *
   * console.log(`Found ${page2.meta.totalCount} projects`);
   * console.log(`Page ${page2.meta.page} of ${page2.meta.totalPages}`);
   * page2.data.forEach(project => {
   *   console.log(`- ${project.name} (${project.id})`);
   * });
   * ```
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Project>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Project>>(path);
  }
}
