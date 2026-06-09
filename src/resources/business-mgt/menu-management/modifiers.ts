/**
 * @fileoverview Modifiers resource for managing modifier groups, options, and bindings.
 * @module resources/modifiers
 */

import {
  ModifierGroup,
  CreateModifierGroup,
  CreateModifierGroupSchema,
  UpdateModifierGroup,
  UpdateModifierGroupSchema,
  ModifierOption,
  CreateModifierOption,
  CreateModifierOptionSchema,
  UpdateModifierOption,
  UpdateModifierOptionSchema,
  ItemModifierBinding,
  CreateItemModifierBinding,
  CreateItemModifierBindingSchema,
  UpdateItemModifierBinding,
  UpdateItemModifierBindingSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../../client/HttpClient';
import { WiilValidationError } from '../../../errors/WiilError';

const GROUP_BATCH_LIMIT = 50;
const OPTION_BATCH_LIMIT = 100;
const BINDING_BATCH_LIMIT = 100;

/**
 * Resource class for managing modifiers in the WIIL Platform.
 *
 * @remarks
 * Provides comprehensive methods for managing modifier groups, modifier options,
 * and item modifier bindings. Modifiers enable menu item customization such as
 * sizes, add-ons, and toppings. All methods require proper authentication via API key.
 */
export class ModifiersResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/modifiers';

  /**
   * Creates a new ModifiersResource instance.
   *
   * @param http - HTTP client for API communication
   *
   * @internal
   */
  constructor(http: HttpClient) {
    this.http = http;
  }

  // =============== Modifier Group Methods ===============

  /**
   * Creates a new modifier group.
   *
   * @param data - Modifier group data
   * @returns Promise resolving to the created modifier group
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createGroup(data: CreateModifierGroup): Promise<ModifierGroup> {
    return this.http.post<CreateModifierGroup, ModifierGroup>(
      `${this.resource_path}/groups`,
      data,
      CreateModifierGroupSchema
    );
  }

  /**
   * Retrieves a modifier group by ID.
   *
   * @param id - Modifier group ID
   * @returns Promise resolving to the modifier group
   *
   * @throws {@link WiilAPIError} - When the group is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getGroup(id: string): Promise<ModifierGroup> {
    return this.http.get<ModifierGroup>(`${this.resource_path}/groups/${id}`);
  }

  /**
   * Lists modifier groups with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of modifier groups
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listGroups(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ModifierGroup>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/groups${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ModifierGroup>>(path);
  }

  /**
   * Updates a modifier group.
   *
   * @param id - Modifier group ID
   * @param data - Modifier group update data
   * @returns Promise resolving to the updated modifier group
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the group is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateGroup(id: string, data: UpdateModifierGroup): Promise<ModifierGroup> {
    return this.http.patch<UpdateModifierGroup, ModifierGroup>(
      `${this.resource_path}/groups/${id}`,
      data,
      UpdateModifierGroupSchema
    );
  }

  /**
   * Deletes a modifier group.
   *
   * @param id - Modifier group ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the group is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async deleteGroup(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/groups/${id}`);
  }

  /**
   * Creates multiple modifier groups in a single batch request.
   *
   * @param data - Array of modifier group data (maximum 50 items)
   * @returns Promise resolving to paginated result of created modifier groups
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createGroupBatch(
    data: CreateModifierGroup[]
  ): Promise<PaginatedResultType<ModifierGroup>> {
    if (data.length > GROUP_BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${GROUP_BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${GROUP_BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateModifierGroupSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateModifierGroup[], PaginatedResultType<ModifierGroup>>(
      `${this.resource_path}/groups/batch`,
      data
    );
  }

  // =============== Modifier Option Methods ===============

  /**
   * Creates a new modifier option.
   *
   * @param data - Modifier option data
   * @returns Promise resolving to the created modifier option
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createOption(data: CreateModifierOption): Promise<ModifierOption> {
    return this.http.post<CreateModifierOption, ModifierOption>(
      `${this.resource_path}/options`,
      data,
      CreateModifierOptionSchema
    );
  }

  /**
   * Retrieves a modifier option by ID.
   *
   * @param id - Modifier option ID
   * @returns Promise resolving to the modifier option
   *
   * @throws {@link WiilAPIError} - When the option is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getOption(id: string): Promise<ModifierOption> {
    return this.http.get<ModifierOption>(`${this.resource_path}/options/${id}`);
  }

  /**
   * Retrieves modifier options by parent modifier group ID.
   *
   * @param modifierGroupId - Parent modifier group ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of modifier options
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getOptionsByGroup(
    modifierGroupId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ModifierOption>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/options/by-group/${modifierGroupId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ModifierOption>>(path);
  }

  /**
   * Lists modifier options with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of modifier options
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listOptions(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ModifierOption>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/options${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ModifierOption>>(path);
  }

  /**
   * Updates a modifier option.
   *
   * @param id - Modifier option ID
   * @param data - Modifier option update data
   * @returns Promise resolving to the updated modifier option
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the option is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateOption(id: string, data: UpdateModifierOption): Promise<ModifierOption> {
    return this.http.patch<UpdateModifierOption, ModifierOption>(
      `${this.resource_path}/options/${id}`,
      data,
      UpdateModifierOptionSchema
    );
  }

  /**
   * Deletes a modifier option.
   *
   * @param id - Modifier option ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the option is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async deleteOption(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/options/${id}`);
  }

  /**
   * Creates multiple modifier options in a single batch request.
   *
   * @param data - Array of modifier option data (maximum 100 items)
   * @returns Promise resolving to paginated result of created modifier options
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createOptionBatch(
    data: CreateModifierOption[]
  ): Promise<PaginatedResultType<ModifierOption>> {
    if (data.length > OPTION_BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${OPTION_BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${OPTION_BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateModifierOptionSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateModifierOption[], PaginatedResultType<ModifierOption>>(
      `${this.resource_path}/options/batch`,
      data
    );
  }

  // =============== Item Modifier Binding Methods ===============

  /**
   * Creates a new item modifier binding.
   *
   * @param data - Item modifier binding data
   * @returns Promise resolving to the created binding
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBinding(data: CreateItemModifierBinding): Promise<ItemModifierBinding> {
    return this.http.post<CreateItemModifierBinding, ItemModifierBinding>(
      `${this.resource_path}/bindings`,
      data,
      CreateItemModifierBindingSchema
    );
  }

  /**
   * Retrieves an item modifier binding by ID.
   *
   * @param id - Item modifier binding ID
   * @returns Promise resolving to the binding
   *
   * @throws {@link WiilAPIError} - When the binding is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getBinding(id: string): Promise<ItemModifierBinding> {
    return this.http.get<ItemModifierBinding>(`${this.resource_path}/bindings/${id}`);
  }

  /**
   * Retrieves item modifier bindings by menu item ID.
   *
   * @param menuItemId - Menu item ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of bindings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getBindingsByMenuItem(
    menuItemId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ItemModifierBinding>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/bindings/by-menu-item/${menuItemId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ItemModifierBinding>>(path);
  }

  /**
   * Retrieves item modifier bindings by menu set ID.
   *
   * @param menuSetId - Menu set ID
   * @param params - Optional pagination parameters
   * @returns Promise resolving to paginated list of bindings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async getBindingsByMenuSet(
    menuSetId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ItemModifierBinding>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/bindings/by-menu-set/${menuSetId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ItemModifierBinding>>(path);
  }

  /**
   * Lists item modifier bindings with optional pagination.
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated list of bindings
   *
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async listBindings(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ItemModifierBinding>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/bindings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ItemModifierBinding>>(path);
  }

  /**
   * Updates an item modifier binding.
   *
   * @param id - Item modifier binding ID
   * @param data - Binding update data
   * @returns Promise resolving to the updated binding
   *
   * @throws {@link WiilValidationError} - When input validation fails
   * @throws {@link WiilAPIError} - When the binding is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async updateBinding(id: string, data: UpdateItemModifierBinding): Promise<ItemModifierBinding> {
    return this.http.patch<UpdateItemModifierBinding, ItemModifierBinding>(
      `${this.resource_path}/bindings/${id}`,
      data,
      UpdateItemModifierBindingSchema
    );
  }

  /**
   * Deletes an item modifier binding.
   *
   * @param id - Item modifier binding ID
   * @returns Promise resolving to boolean indicating deletion success
   *
   * @throws {@link WiilAPIError} - When the binding is not found or API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async deleteBinding(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/bindings/${id}`);
  }

  /**
   * Creates multiple item modifier bindings in a single batch request.
   *
   * @param data - Array of binding data (maximum 100 items)
   * @returns Promise resolving to paginated result of created bindings
   *
   * @throws {@link WiilValidationError} - When input validation fails or batch limit exceeded
   * @throws {@link WiilAPIError} - When the API returns an error
   * @throws {@link WiilNetworkError} - When network communication fails
   */
  public async createBindingBatch(
    data: CreateItemModifierBinding[]
  ): Promise<PaginatedResultType<ItemModifierBinding>> {
    if (data.length > BINDING_BATCH_LIMIT) {
      throw new WiilValidationError(
        `Batch size exceeds maximum limit of ${BINDING_BATCH_LIMIT}`,
        [{ path: ['data'], message: `Array length ${data.length} exceeds maximum of ${BINDING_BATCH_LIMIT}` }]
      );
    }

    for (let i = 0; i < data.length; i++) {
      const validation = CreateItemModifierBindingSchema.safeParse(data[i]);
      if (!validation.success) {
        throw new WiilValidationError(
          `Validation failed for item at index ${i}`,
          validation.error.issues
        );
      }
    }

    return this.http.post<CreateItemModifierBinding[], PaginatedResultType<ItemModifierBinding>>(
      `${this.resource_path}/bindings/batch`,
      data
    );
  }
}
