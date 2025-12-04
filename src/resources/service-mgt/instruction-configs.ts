/**
 * @fileoverview Instruction Configurations resource for managing instruction configuration entities.
 * @module resources/service-mgt/instruction-configs
 */

import {
  InstructionConfiguration,
  CreateInstructionConfigurationSchema,
  CreateInstructionConfiguration,
  UpdateInstructionConfigurationSchema,
  UpdateInstructionConfiguration,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing instruction configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * instruction configurations. Instruction configurations define the prompts,
 * knowledge sources, and behavior instructions for AI agents. All methods require
 * proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new instruction configuration
 * const instruction = await client.instructions.create({
 *   name: 'Customer Support Instructions',
 *   systemPrompt: 'You are a helpful customer support agent...',
 *   knowledgeSourceIds: ['ks_123', 'ks_456']
 * });
 *
 * // Get an instruction configuration by ID
 * const inst = await client.instructions.get('inst_123');
 *
 * // Update an instruction configuration
 * const updated = await client.instructions.update({
 *   id: 'inst_123',
 *   systemPrompt: 'Updated prompt...'
 * });
 *
 * // List all instruction configurations
 * const instructions = await client.instructions.list({
 *   page: 1,
 *   pageSize: 20
 * });
 *
 * // Delete an instruction configuration
 * await client.instructions.delete('inst_123');
 * ```
 */
export class InstructionConfigurationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/instruction-configurations';

  /**
   * Creates a new InstructionConfigurationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new instruction configuration.
   *
   * @param data - Instruction configuration data
   * @returns Promise resolving to the created instruction configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateInstructionConfiguration): Promise<InstructionConfiguration> {
    return this.http.post<CreateInstructionConfiguration, InstructionConfiguration>(
      this.resource_path,
      data,
      CreateInstructionConfigurationSchema
    );
  }

  /**
   * Retrieves an instruction configuration by ID.
   *
   * @param id - Instruction configuration ID
   * @returns Promise resolving to the instruction configuration
   *
   * @throws {@link WiilAPIError} - When the instruction configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<InstructionConfiguration> {
    return this.http.get<InstructionConfiguration>(`${this.resource_path}/${id}`);
  }

  /**
   * Updates an existing instruction configuration.
   *
   * @param data - Instruction configuration update data (must include id)
   * @returns Promise resolving to the updated instruction configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the instruction configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdateInstructionConfiguration): Promise<InstructionConfiguration> {
    return this.http.patch<UpdateInstructionConfiguration, InstructionConfiguration>(
      this.resource_path,
      data,
      UpdateInstructionConfigurationSchema
    );
  }

  /**
   * Deletes an instruction configuration.
   *
   * @param id - Instruction configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the instruction configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists instruction configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of instruction configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<InstructionConfiguration>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<InstructionConfiguration>>(path);
  }

  /**
   * Retrieves the list of supported instruction templates.
   *
   * @returns Promise resolving to array of supported instruction template configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   *
   * @example
   * ```typescript
   * const templates = await client.instructionConfigs.getSupportedTemplates();
   * console.log(`Found ${templates.length} supported templates`);
   * templates.forEach(template => {
   *   console.log(`- ${template.name} (${template.id})`);
   * });
   * ```
   */
  public async getSupportedTemplates(): Promise<InstructionConfiguration[]> {
    return this.http.get<InstructionConfiguration[]>(`${this.resource_path}/supported-templates`);
  }
}
