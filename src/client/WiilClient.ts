/**
 * @fileoverview Main WIIL SDK client class.
 * @module client/WiilClient
 */

import { WiilClientConfig } from './types';
import { HttpClient } from './HttpClient';
import { OrganizationsResource, ProjectsResource } from '../resources/account';
import {
  BusinessServicesResource,
  CustomersResource,
  MenuOrdersResource,
  MenusResource,
  ProductOrdersResource,
  ProductsResource,
  ReservationResourcesResource,
  ReservationsResource,
  ServiceAppointmentsResource,
} from '../resources/business-mgt';
import {
  AgentConfigurationsResource,
  DeploymentConfigurationsResource,
  DeploymentChannelsResource,
  InstructionConfigurationsResource,
  PhoneConfigurationsResource,
  ProvisioningConfigurationsResource,
  ConversationConfigurationsResource,
  TranslationSessionsResource,
  KnowledgeSourcesResource,
  SupportModelsResource,
  TelephonyProviderResource,
} from '../resources/service-mgt';
import { WiilConfigurationError } from '../errors/WiilError';

/**
 * Default configuration values for the WIIL SDK client.
 *
 * @internal
 */
const DEFAULT_CONFIG = {
  baseUrl: 'https://api.wiil.io/v1',
  timeout: 30000, // 30 seconds
} as const;

/**
 * Main client for interacting with the WIIL Platform API.
 *
 * @remarks
 * This is the primary entry point for the WIIL SDK. It provides access to all
 * API resources through resource-specific properties. The client handles
 * authentication, request/response validation, and error handling automatically.
 *
 * @example
 * ```typescript
 * import { WiilClient } from 'wiil-js';
 *
 * const client = new WiilClient({
 *   apiKey: 'your-api-key',
 * });
 *
 * // Get the organization that owns the API key
 * const org = await client.organizations.get();
 * console.log('Organization:', org.companyName);
 *
 * // Create a project
 * const project = await client.projects.create({
 *   name: 'Production Environment',
 *   isDefault: true
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Custom configuration
 * const client = new WiilClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.wiil.io/v1',
 *   timeout: 60000 // 60 seconds
 * });
 * ```
 */
export class WiilClient {
  /**
   * Organizations resource for reading organization information.
   *
   * @remarks
   * Provides read-only access to retrieve the organization that owns the API key.
   *
   * @example
   * ```typescript
   * const org = await client.organizations.get();
   * console.log('Organization:', org.companyName);
   * ```
   */
  public readonly organizations: OrganizationsResource;

  /**
   * Projects resource for managing project entities.
   *
   * @remarks
   * Provides full CRUD operations for projects including create, get, update,
   * delete, and list methods.
   *
   * @example
   * ```typescript
   * const project = await client.projects.create({
   *   name: 'Production',
   *   isDefault: true
   * });
   * ```
   */
  public readonly projects: ProjectsResource;

  /**
   * Business Services resource for managing business service offerings.
   */
  public readonly businessServices: BusinessServicesResource;

  /**
   * Customers resource for managing customer information.
   */
  public readonly customers: CustomersResource;

  /**
   * Menu Orders resource for managing menu-based orders.
   */
  public readonly menuOrders: MenuOrdersResource;

  /**
   * Menus resource for managing restaurant/service menus.
   */
  public readonly menus: MenusResource;

  /**
   * Product Orders resource for managing product-based orders.
   */
  public readonly productOrders: ProductOrdersResource;

  /**
   * Products resource for managing product catalog.
   */
  public readonly products: ProductsResource;

  /**
   * Reservation Resources resource for managing bookable resources.
   */
  public readonly reservationResources: ReservationResourcesResource;

  /**
   * Reservations resource for managing customer reservations.
   */
  public readonly reservations: ReservationsResource;

  /**
   * Service Appointments resource for managing service appointments.
   */
  public readonly serviceAppointments: ServiceAppointmentsResource;

  /**
   * Agent Configurations resource for managing AI agent configurations.
   */
  public readonly agentConfigs: AgentConfigurationsResource;

  /**
   * Deployment Configurations resource for managing deployment configurations.
   */
  public readonly deploymentConfigs: DeploymentConfigurationsResource;

  /**
   * Deployment Channels resource for managing deployment channels.
   */
  public readonly deploymentChannels: DeploymentChannelsResource;

  /**
   * Instruction Configurations resource for managing instruction configurations.
   */
  public readonly instructionConfigs: InstructionConfigurationsResource;

  /**
   * Phone Configurations resource for managing phone service configurations.
   */
  public readonly phoneConfigs: PhoneConfigurationsResource;

  /**
   * Provisioning Configurations resource for managing provisioning configurations.
   */
  public readonly provisioningConfigs: ProvisioningConfigurationsResource;

  /**
   * Conversation Configurations resource for managing conversation configurations.
   */
  public readonly conversationConfigs: ConversationConfigurationsResource;

  /**
   * Translation Sessions resource for managing translation sessions.
   */
  public readonly translationSessions: TranslationSessionsResource;

  /**
   * Knowledge Sources resource for managing knowledge sources.
   */
  public readonly knowledgeSources: KnowledgeSourcesResource;

  /**
   * Support Models resource for accessing LLM model configurations.
   *
   * @remarks
   * Provides read-only access to the Wiil Support Model Registry, including
   * default models for various capabilities and lookup methods.
   *
   * @example
   * ```typescript
   * // Get default multi-mode model
   * const model = await client.supportModels.getDefaultMultiMode();
   * console.log('Default model:', model.name);
   *
   * // List all models
   * const models = await client.supportModels.list();
   * ```
   */
  public readonly supportModels: SupportModelsResource;

  /**
   * Telephony Provider resource for managing phone numbers and telephony services.
   *
   * @remarks
   * Provides methods for retrieving available regions, searching for phone numbers,
   * and getting pricing information from various telephony providers.
   *
   * @example
   * ```typescript
   * // Get available regions
   * const regions = await client.telephonyProvider.getRegions('SIGNALWIRE');
   *
   * // Search for phone numbers
   * const numbers = await client.telephonyProvider.getPhoneNumbers('SIGNALWIRE', 'US', {
   *   areaCode: '206'
   * });
   *
   * // Get pricing
   * const pricing = await client.telephonyProvider.getPricing('SIGNALWIRE', 'US');
   * ```
   */
  public readonly telephonyProvider: TelephonyProviderResource;

  private readonly http: HttpClient;

  /**
   * Creates a new WiilClient instance.
   *
   * @param config - Client configuration
   *
   * @throws {@link WiilConfigurationError} - When configuration is invalid
   *
   * @example
   * ```typescript
   * const client = new WiilClient({
   *   apiKey: 'your-api-key'
   * });
   * ```
   *
   * @example
   * ```typescript
   * // With custom configuration
   * const client = new WiilClient({
   *   apiKey: 'your-api-key',
   *   baseUrl: 'https://api.wiil.io/v1',
   *   timeout: 60000
   * });
   * ```
   */
  constructor(config: WiilClientConfig) {
    this.validateConfig(config);

    const fullConfig: Required<WiilClientConfig> = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl ?? DEFAULT_CONFIG.baseUrl,
      timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
    };

    this.http = new HttpClient(fullConfig);

    // Account resources
    this.organizations = new OrganizationsResource(this.http);
    this.projects = new ProjectsResource(this.http);

    // Business Management resources
    this.businessServices = new BusinessServicesResource(this.http);
    this.customers = new CustomersResource(this.http);
    this.menuOrders = new MenuOrdersResource(this.http);
    this.menus = new MenusResource(this.http);
    this.productOrders = new ProductOrdersResource(this.http);
    this.products = new ProductsResource(this.http);
    this.reservationResources = new ReservationResourcesResource(this.http);
    this.reservations = new ReservationsResource(this.http);
    this.serviceAppointments = new ServiceAppointmentsResource(this.http);

    // Service Management resources
    this.agentConfigs = new AgentConfigurationsResource(this.http);
    this.deploymentConfigs = new DeploymentConfigurationsResource(this.http);
    this.deploymentChannels = new DeploymentChannelsResource(this.http);
    this.instructionConfigs = new InstructionConfigurationsResource(this.http);
    this.phoneConfigs = new PhoneConfigurationsResource(this.http);
    this.provisioningConfigs = new ProvisioningConfigurationsResource(this.http);
    this.conversationConfigs = new ConversationConfigurationsResource(this.http);
    this.translationSessions = new TranslationSessionsResource(this.http);
    this.knowledgeSources = new KnowledgeSourcesResource(this.http);
    this.supportModels = new SupportModelsResource(this.http);
    this.telephonyProvider = new TelephonyProviderResource(this.http);
  }

  /**
   * Validates the client configuration.
   *
   * @param config - Configuration to validate
   * @throws {@link WiilConfigurationError} - When configuration is invalid
   *
   * @private
   */
  private validateConfig(config: WiilClientConfig): void {
    if (!config.apiKey) {
      throw new WiilConfigurationError(
        'API key is required. Please provide a valid API key in the configuration.'
      );
    }

    if (config.apiKey.trim().length === 0) {
      throw new WiilConfigurationError(
        'API key cannot be empty. Please provide a valid API key.'
      );
    }

    if (config.baseUrl !== undefined) {
      try {
        new URL(config.baseUrl);
      } catch {
        throw new WiilConfigurationError(
          `Invalid base URL: ${config.baseUrl}. Please provide a valid URL.`
        );
      }
    }

    if (config.timeout !== undefined) {
      if (config.timeout <= 0) {
        throw new WiilConfigurationError(
          'Timeout must be a positive number in milliseconds.'
        );
      }
    }
  }
}
