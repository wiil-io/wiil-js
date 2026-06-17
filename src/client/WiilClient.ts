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
  CustomerGroupsResource,
  ShippingAddressesResource,
  MenuOrdersResource,
  MenusResource,
  MenuItemVariantsResource,
  ModifiersResource,
  MenuSetsResource,
  MenuPricingRulesResource,
  TaxRulesResource,
  DiscountRulesResource,
  ProductOrdersResource,
  ProductsResource,
  ProductVariantsResource,
  ProductVariantAxesResource,
  ProductAxisBindingsResource,
  ProductSetsResource,
  ProductPricingRulesResource,
  ReservationResourcesResource,
  ResourceCategoriesResource,
  ResourceInstancesResource,
  TableReservationsResource,
  RoomReservationsResource,
  RentalReservationsResource,
  ReservationSettingsResource,
  FloorPlansResource,
  FloorPlanSectionsResource,
  MaintenanceBlocksResource,
  TableAssignmentsResource,
  RoomAssignmentsResource,
  RentalAssignmentsResource,
  ServiceAppointmentsResource,
  ServiceCategoriesResource,
  ServicePersonsResource,
  ServiceProvidersResource,
  ServicePricingRulesResource,
  ServiceTimeOffsResource,
  AppointmentAdditionalInfoResource,
  AppointmentFieldConfigsResource,
  PropertyConfigResource,
  PropertyInquiryResource,
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
  DynamicPhoneAgentResource,
  DynamicWebAgentResource,
  DynamicAgentStatusResource,
} from '../resources/service-mgt';
import {
  OutboundCallsResource,
  OutboundEmailsResource,
  OutboundSmsResource,
  OutboundTemplatesResource,
  TranslationServicesResource,
} from '../resources/conversation';
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
   * Customer Groups resource for managing customer segmentation.
   */
  public readonly customerGroups: CustomerGroupsResource;

  /**
   * Shipping Addresses resource for managing customer delivery addresses.
   */
  public readonly shippingAddresses: ShippingAddressesResource;

  /**
   * Menu Orders resource for managing menu-based orders.
   */
  public readonly menuOrders: MenuOrdersResource;

  /**
   * Menus resource for managing restaurant/service menus.
   */
  public readonly menus: MenusResource;

  /**
   * Menu Item Variants resource for managing menu item size/option variants.
   */
  public readonly menuItemVariants: MenuItemVariantsResource;

  /**
   * Modifiers resource for managing modifier groups, options, and bindings.
   */
  public readonly modifiers: ModifiersResource;

  /**
   * Menu Sets resource for managing menu collections and time-based menus.
   */
  public readonly menuSets: MenuSetsResource;

  /**
   * Menu Pricing Rules resource for managing menu-specific discounts.
   */
  public readonly menuPricingRules: MenuPricingRulesResource;

  /**
   * Tax Rules resource for managing order tax configurations.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and listing tax rules.
   * Tax rules define tax configurations including percentage and fixed taxes,
   * compound taxes, and inclusive/exclusive calculations.
   *
   * @example
   * ```typescript
   * const taxRule = await client.taxRules.create({
   *   name: 'State Sales Tax',
   *   scope: 'ORDER',
   *   rateType: 'PERCENTAGE',
   *   rateValue: 8.25,
   *   isInclusive: false
   * });
   * ```
   */
  public readonly taxRules: TaxRulesResource;

  /**
   * Discount Rules resource for managing order discount configurations.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and listing discount rules.
   * Discount rules define discount configurations including percentage and fixed
   * discounts, promo codes, customer segments, and usage limits.
   *
   * @example
   * ```typescript
   * const discount = await client.discountRules.create({
   *   name: 'Summer Sale',
   *   code: 'SUMMER20',
   *   scope: 'ORDER',
   *   type: 'PERCENTAGE',
   *   value: 20,
   *   isActive: true
   * });
   * ```
   */
  public readonly discountRules: DiscountRulesResource;

  /**
   * Product Orders resource for managing product-based orders.
   */
  public readonly productOrders: ProductOrdersResource;

  /**
   * Products resource for managing product catalog.
   */
  public readonly products: ProductsResource;

  /**
   * Product Variants resource for managing SKU-level product variants.
   */
  public readonly productVariants: ProductVariantsResource;

  /**
   * Product Variant Axes resource for managing variant dimensions (Size, Color, etc.).
   */
  public readonly productVariantAxes: ProductVariantAxesResource;

  /**
   * Product Axis Bindings resource for linking products to variant axes.
   */
  public readonly productAxisBindings: ProductAxisBindingsResource;

  /**
   * Product Sets resource for managing product bundles.
   */
  public readonly productSets: ProductSetsResource;

  /**
   * Product Pricing Rules resource for managing product promotions and discounts.
   */
  public readonly productPricingRules: ProductPricingRulesResource;

  /**
   * Reservation Resources resource for managing bookable resources.
   */
  public readonly reservationResources: ReservationResourcesResource;

  /**
   * Resource Categories resource for managing reservation resource groupings.
   */
  public readonly resourceCategories: ResourceCategoriesResource;

  /**
   * Resource Instances resource for managing physical reservation units.
   */
  public readonly resourceInstances: ResourceInstancesResource;

  /**
   * Table Reservations resource for managing restaurant table bookings.
   */
  public readonly tableReservations: TableReservationsResource;

  /**
   * Room Reservations resource for managing lodging bookings.
   */
  public readonly roomReservations: RoomReservationsResource;

  /**
   * Rental Reservations resource for managing equipment rental bookings.
   */
  public readonly rentalReservations: RentalReservationsResource;

  /**
   * Reservation Settings resource for managing location-level reservation configurations.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and listing reservation
   * settings. Settings define configurations for table, room, and rental reservations
   * including durations, booking windows, and policies.
   *
   * @example
   * ```typescript
   * const settings = await client.reservationSettings.create({
   *   locationId: 'loc_123',
   *   supportTableReservations: true,
   *   table: { defaultDurationMinutes: 90 }
   * });
   * ```
   */
  public readonly reservationSettings: ReservationSettingsResource;

  /**
   * Floor Plans resource for managing table layout canvases.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and listing floor plans.
   * Floor plans define the coordinate space for section and table placement.
   *
   * @example
   * ```typescript
   * const floorPlan = await client.floorPlans.create({
   *   locationId: 'loc_123',
   *   name: 'Main Dining Room',
   *   capacity: 80
   * });
   * ```
   */
  public readonly floorPlans: FloorPlansResource;

  /**
   * Floor Plan Sections resource for managing seating sections within floor plans.
   *
   * @remarks
   * Provides methods for managing sections and table placements within floor plans,
   * including position and rotation management.
   *
   * @example
   * ```typescript
   * const section = await client.floorPlanSections.create({
   *   floorPlanId: 'fp_123',
   *   name: 'Patio Section',
   *   capacity: 20
   * });
   * ```
   */
  public readonly floorPlanSections: FloorPlanSectionsResource;

  /**
   * Maintenance Blocks resource for managing resource unavailability periods.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and listing maintenance
   * blocks that mark resources as unavailable for specific time periods.
   *
   * @example
   * ```typescript
   * const block = await client.maintenanceBlocks.create({
   *   resourceInstanceId: 'ri_123',
   *   startTime: Date.now(),
   *   endTime: Date.now() + 86400000,
   *   reason: 'Scheduled maintenance'
   * });
   * ```
   */
  public readonly maintenanceBlocks: MaintenanceBlocksResource;

  /**
   * Table Assignments resource for managing table-to-reservation assignments.
   *
   * @remarks
   * Provides methods for assigning, releasing, and tracking table assignments
   * for restaurant reservations with support for soft and hard locks.
   *
   * @example
   * ```typescript
   * const assignment = await client.tableAssignments.create({
   *   reservationId: 'res_123',
   *   tableInstanceId: 'ti_456',
   *   assignmentType: 'hard'
   * });
   * ```
   */
  public readonly tableAssignments: TableAssignmentsResource;

  /**
   * Room Assignments resource for managing room-to-reservation assignments.
   *
   * @remarks
   * Provides methods for assigning, releasing, and tracking room assignments
   * for lodging reservations with housekeeping notes support.
   *
   * @example
   * ```typescript
   * const assignment = await client.roomAssignments.create({
   *   reservationId: 'res_123',
   *   roomInstanceId: 'ri_456',
   *   assignmentType: 'hard'
   * });
   * ```
   */
  public readonly roomAssignments: RoomAssignmentsResource;

  /**
   * Rental Assignments resource for managing rental-to-reservation assignments.
   *
   * @remarks
   * Provides methods for assigning, releasing, and tracking rental assignments
   * with condition tracking at pickup and return.
   *
   * @example
   * ```typescript
   * const assignment = await client.rentalAssignments.create({
   *   reservationId: 'res_123',
   *   rentalInstanceId: 'ri_456',
   *   assignmentType: 'hard'
   * });
   * ```
   */
  public readonly rentalAssignments: RentalAssignmentsResource;

  /**
   * Service Appointments resource for managing service appointments.
   */
  public readonly serviceAppointments: ServiceAppointmentsResource;

  /**
   * Service Categories resource for managing service category groupings.
   */
  public readonly serviceCategories: ServiceCategoriesResource;

  /**
   * Service Persons resource for managing service providers/staff.
   */
  public readonly servicePersons: ServicePersonsResource;

  /**
   * Service Providers resource for managing service-to-provider assignments.
   */
  public readonly serviceProviders: ServiceProvidersResource;

  /**
   * Service Pricing Rules resource for managing service pricing adjustments.
   */
  public readonly servicePricingRules: ServicePricingRulesResource;

  /**
   * Service Time Offs resource for managing provider unavailability periods.
   */
  public readonly serviceTimeOffs: ServiceTimeOffsResource;

  /**
   * Appointment Additional Info resource for managing dynamic field values.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and listing appointment
   * additional info records. These store custom field values captured during
   * appointment booking.
   *
   * @example
   * ```typescript
   * const info = await client.appointmentAdditionalInfo.create({
   *   appointmentId: 'apt_123',
   *   customerId: 'cust_456',
   *   data: { allergies: 'None', notes: 'First visit' }
   * });
   * ```
   */
  public readonly appointmentAdditionalInfo: AppointmentAdditionalInfoResource;

  /**
   * Appointment Field Configs resource for managing organization-level field configurations.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and listing appointment
   * field configurations. These define reusable field libraries for appointment
   * booking forms.
   *
   * @example
   * ```typescript
   * const config = await client.appointmentFieldConfigs.create({
   *   fields: [{ fieldKey: 'allergies', fieldType: 'text', label: 'Allergies' }],
   *   reuseDetails: true,
   *   ensureEmail: true
   * });
   * ```
   */
  public readonly appointmentFieldConfigs: AppointmentFieldConfigsResource;

  /**
   * Property Configuration resource for managing property listings, categories, and addresses.
   */
  public readonly propertyConfig: PropertyConfigResource;

  /**
   * Property Inquiries resource for managing property leads and inquiries.
   */
  public readonly propertyInquiries: PropertyInquiryResource;

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

  /**
   * Dynamic Phone Agent resource for provisioning phone-based AI agents.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and deleting dynamic
   * phone agents with configurable STT/TTS capabilities.
   *
   * @example
   * ```typescript
   * // Create a phone agent
   * const result = await client.dynamicPhoneAgent.create({
   *   assistantName: 'Customer Service',
   *   language: 'en-US',
   *   phoneConfigurationId: 'phone_config_123'
   * });
   * console.log('Phone number:', result.phoneNumber);
   * ```
   */
  public readonly dynamicPhoneAgent: DynamicPhoneAgentResource;

  /**
   * Dynamic Web Agent resource for provisioning web-based AI agents.
   *
   * @remarks
   * Provides methods for creating, retrieving, updating, and deleting dynamic
   * web agents with configurable communication types and integration snippets.
   *
   * @example
   * ```typescript
   * import { OttCommunicationType } from 'wiil-core-js';
   *
   * // Create a web agent
   * const result = await client.dynamicWebAgent.create({
   *   assistantName: 'Website Support',
   *   websiteUrl: 'https://example.com',
   *   communicationType: OttCommunicationType.TEXT
   * });
   * console.log('Integration snippets:', result.integrationSnippets);
   * ```
   */
  public readonly dynamicWebAgent: DynamicWebAgentResource;

  /**
   * Dynamic Agent Status resource for polling agent setup progress.
   *
   * @remarks
   * Provides methods for checking and polling the status of dynamic agent setup
   * operations. Supports both phone and web agent configurations.
   *
   * @example
   * ```typescript
   * // Create a dynamic agent
   * const result = await client.dynamicPhoneAgent.create({
   *   assistantName: 'Support Agent',
   *   capabilities: [BusinessSupportServices.APPOINTMENT_MANAGEMENT],
   * });
   *
   * // Poll until setup completes
   * const final = await client.dynamicAgentStatus.poll(result.id, {
   *   interval: 2000,
   *   timeout: 60000,
   *   onProgress: (state) => {
   *     console.log(`${state.progressPercentage}% - ${state.message}`);
   *   }
   * });
   *
   * if (final.success) {
   *   console.log('Agent ready:', final.agentConfigurationId);
   * }
   * ```
   */
  public readonly dynamicAgentStatus: DynamicAgentStatusResource;

  /**
   * Outbound Calls resource for managing AI-powered voice call requests.
   *
   * @remarks
   * Provides methods for creating, scheduling, and managing outbound calls
   * with retry logic and calling hours compliance.
   *
   * @example
   * ```typescript
   * const call = await client.outboundCalls.create({
   *   to: '+14155551234',
   *   from: '+14155555678',
   *   agentConfigurationId: 'agent_123',
   *   scheduleType: 'IMMEDIATE'
   * });
   * ```
   */
  public readonly outboundCalls: OutboundCallsResource;

  /**
   * Outbound Emails resource for managing email requests.
   *
   * @remarks
   * Provides methods for creating, scheduling, and tracking email delivery
   * with template support and retry logic.
   *
   * @example
   * ```typescript
   * const email = await client.outboundEmails.create({
   *   to: [{ email: 'customer@example.com' }],
   *   subject: 'Order Confirmation',
   *   bodyHtml: '<h1>Thank you!</h1>'
   * });
   * ```
   */
  public readonly outboundEmails: OutboundEmailsResource;

  /**
   * Outbound SMS resource for managing SMS requests.
   *
   * @remarks
   * Provides methods for creating, scheduling, and tracking SMS delivery
   * with template support and retry logic.
   *
   * @example
   * ```typescript
   * const sms = await client.outboundSms.create({
   *   to: '+14155551234',
   *   body: 'Your appointment is confirmed.'
   * });
   * ```
   */
  public readonly outboundSms: OutboundSmsResource;

  /**
   * Outbound Templates resource for managing message templates.
   *
   * @remarks
   * Provides methods for creating and managing email, SMS, and WhatsApp
   * templates with variable substitution support.
   *
   * @example
   * ```typescript
   * const template = await client.outboundTemplates.createEmailTemplate({
   *   name: 'Welcome',
   *   code: 'welcome',
   *   channel: 'EMAIL',
   *   subjectTemplate: 'Welcome, {{name}}!',
   *   bodyHtmlTemplate: '<h1>Hello {{name}}</h1>'
   * });
   * ```
   */
  public readonly outboundTemplates: OutboundTemplatesResource;

  /**
   * Translation Services resource for managing real-time translation sessions.
   *
   * @remarks
   * Provides methods for initiating, managing, and tracking translation
   * sessions for cross-language communication.
   *
   * @example
   * ```typescript
   * const config = await client.translationServices.initiate({
   *   initiator_id: 'user_123',
   *   initiator_language_code: 'en',
   *   participant_language_code: 'es'
   * });
   * ```
   */
  public readonly translationServices: TranslationServicesResource;

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
    this.customerGroups = new CustomerGroupsResource(this.http);
    this.shippingAddresses = new ShippingAddressesResource(this.http);
    this.menuOrders = new MenuOrdersResource(this.http);
    this.menus = new MenusResource(this.http);
    this.menuItemVariants = new MenuItemVariantsResource(this.http);
    this.modifiers = new ModifiersResource(this.http);
    this.menuSets = new MenuSetsResource(this.http);
    this.menuPricingRules = new MenuPricingRulesResource(this.http);
    this.taxRules = new TaxRulesResource(this.http);
    this.discountRules = new DiscountRulesResource(this.http);
    this.productOrders = new ProductOrdersResource(this.http);
    this.products = new ProductsResource(this.http);
    this.productVariants = new ProductVariantsResource(this.http);
    this.productVariantAxes = new ProductVariantAxesResource(this.http);
    this.productAxisBindings = new ProductAxisBindingsResource(this.http);
    this.productSets = new ProductSetsResource(this.http);
    this.productPricingRules = new ProductPricingRulesResource(this.http);
    this.reservationResources = new ReservationResourcesResource(this.http);
    this.resourceCategories = new ResourceCategoriesResource(this.http);
    this.resourceInstances = new ResourceInstancesResource(this.http);
    this.tableReservations = new TableReservationsResource(this.http);
    this.roomReservations = new RoomReservationsResource(this.http);
    this.rentalReservations = new RentalReservationsResource(this.http);
    this.reservationSettings = new ReservationSettingsResource(this.http);
    this.floorPlans = new FloorPlansResource(this.http);
    this.floorPlanSections = new FloorPlanSectionsResource(this.http);
    this.maintenanceBlocks = new MaintenanceBlocksResource(this.http);
    this.tableAssignments = new TableAssignmentsResource(this.http);
    this.roomAssignments = new RoomAssignmentsResource(this.http);
    this.rentalAssignments = new RentalAssignmentsResource(this.http);
    this.serviceAppointments = new ServiceAppointmentsResource(this.http);
    this.serviceCategories = new ServiceCategoriesResource(this.http);
    this.servicePersons = new ServicePersonsResource(this.http);
    this.serviceProviders = new ServiceProvidersResource(this.http);
    this.servicePricingRules = new ServicePricingRulesResource(this.http);
    this.serviceTimeOffs = new ServiceTimeOffsResource(this.http);
    this.appointmentAdditionalInfo = new AppointmentAdditionalInfoResource(this.http);
    this.appointmentFieldConfigs = new AppointmentFieldConfigsResource(this.http);
    this.propertyConfig = new PropertyConfigResource(this.http);
    this.propertyInquiries = new PropertyInquiryResource(this.http);

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
    this.dynamicPhoneAgent = new DynamicPhoneAgentResource(this.http);
    this.dynamicWebAgent = new DynamicWebAgentResource(this.http);
    this.dynamicAgentStatus = new DynamicAgentStatusResource(this.http);

    // Conversation resources
    this.outboundCalls = new OutboundCallsResource(this.http);
    this.outboundEmails = new OutboundEmailsResource(this.http);
    this.outboundSms = new OutboundSmsResource(this.http);
    this.outboundTemplates = new OutboundTemplatesResource(this.http);
    this.translationServices = new TranslationServicesResource(this.http);
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
