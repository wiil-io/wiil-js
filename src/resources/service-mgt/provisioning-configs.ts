/**
 * @fileoverview Provisioning Configurations resource for managing provisioning configuration entities.
 * @module resources/service-mgt/provisioning-configs
 */

import {
  ProvisioningConfigChain,
  TranslationChainConfig,
  CreateProvisioningConfigSchema,
  CreateProvisioningConfig,
  CreateTranslationChainConfigSchema,
  CreateTranslationChainConfig,
  UpdateProvisioningConfigSchema,
  UpdateProvisioningConfig,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing provisioning configurations in the WIIL Platform.
 *
 * @remarks
 * Provides methods for creating, retrieving, updating, deleting, and listing
 * provisioning configurations. Provisioning configurations define processing
 * chains and translation configurations for AI deployments. All methods require
 * proper authentication via API key.
 *
 * @example
 * ```typescript
 * const client = new WiilClient({ apiKey: 'your-api-key' });
 *
 * // Create a new provisioning configuration
 * const config = await client.provisioningConfigs.create({
 *   chainName: 'customer-support-chain',
 *   processingSteps: [...]
 * });
 *
 * // Get provisioning configuration by chain name
 * const config = await client.provisioningConfigs.getByChainName('customer-support-chain');
 *
 * // List provisioning configuration chains
 * const chains = await client.provisioningConfigs.listProvisioningChains();
 *
 * // List translation configuration chains
 * const translationChains = await client.provisioningConfigs.listTranslationChains();
 * ```
 */
export class ProvisioningConfigurationsResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/provisioning-configurations';

  /**
   * Creates a new ProvisioningConfigurationsResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  /**
   * Creates a new provisioning configuration chain.
   *
   * @param data - Provisioning configuration chain data
   * @returns Promise resolving to the created provisioning configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async create(data: CreateProvisioningConfig): Promise<ProvisioningConfigChain> {
    return this.http.post<CreateProvisioningConfig, ProvisioningConfigChain>(
      this.resource_path,
      data,
      CreateProvisioningConfigSchema
    );
  }

  /**
   * Creates a new translation configuration chain.
   *
   * @param data - Translation configuration chain data
   * @returns Promise resolving to the created translation configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createTranslation(data: CreateTranslationChainConfig): Promise<TranslationChainConfig> {
    return this.http.post<CreateTranslationChainConfig, TranslationChainConfig>(
      this.resource_path,
      data,
      CreateTranslationChainConfigSchema
    );
  }

  /**
   * Retrieves a provisioning configuration by ID.
   *
   * @param id - Provisioning configuration ID
   * @returns Promise resolving to the provisioning configuration
   *
   * @throws {@link WiilAPIError} - When the provisioning configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async get(id: string): Promise<ProvisioningConfigChain | TranslationChainConfig> {
    return this.http.get<ProvisioningConfigChain | TranslationChainConfig>(`${this.resource_path}/${id}`);
  }

  /**
   * Retrieves a provisioning configuration by chain name.
   *
   * @param chainName - Chain name
   * @returns Promise resolving to the provisioning configuration
   *
   * @throws {@link WiilAPIError} - When the provisioning configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getByChainName(chainName: string): Promise<ProvisioningConfigChain | TranslationChainConfig> {
    return this.http.get<ProvisioningConfigChain | TranslationChainConfig>(`${this.resource_path}/by-chain-name/${chainName}`);
  }

  /**
   * Updates an existing provisioning configuration.
   *
   * @param data - Provisioning configuration update data (must include id)
   * @returns Promise resolving to the updated provisioning configuration
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the provisioning configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async update(data: UpdateProvisioningConfig): Promise<ProvisioningConfigChain> {
    return this.http.patch<UpdateProvisioningConfig, ProvisioningConfigChain>(
      this.resource_path,
      data,
      UpdateProvisioningConfigSchema
    );
  }

  /**
   * Deletes a provisioning configuration.
   *
   * @param id - Provisioning configuration ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the provisioning configuration is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  /**
   * Lists all provisioning configurations with optional pagination.
   *
   * @param params - Pagination parameters
   * @param includeDeleted - Include deleted configurations
   * @returns Promise resolving to paginated list of provisioning configurations
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async list(
    params?: Partial<PaginationRequest>,
    includeDeleted?: boolean
  ): Promise<PaginatedResultType<ProvisioningConfigChain | TranslationChainConfig>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (includeDeleted !== undefined) queryParams.append('includeDeleted', includeDeleted.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProvisioningConfigChain | TranslationChainConfig>>(path);
  }

  /**
   * Lists provisioning configuration chains with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of provisioning configuration chains
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listProvisioningChains(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProvisioningConfigChain>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/provisioning${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProvisioningConfigChain>>(path);
  }

  /**
   * Lists translation configuration chains with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of translation configuration chains
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listTranslationChains(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<TranslationChainConfig>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/translations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<TranslationChainConfig>>(path);
  }
}
