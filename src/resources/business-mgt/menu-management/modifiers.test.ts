/**
 * @fileoverview Tests for Modifiers resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../../client/WiilClient';
import { ModifierGroup, ModifierOption, ItemModifierBinding, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ModifiersResource', () => {
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

  // =============== Modifier Group Tests ===============

  describe('createGroup', () => {
    it('should create a new modifier group', async () => {
      const input = {
        name: 'Size',
        description: 'Choose your drink size',
        selectionType: 'single' as const,
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
      };

      const mockResponse: ModifierGroup = {
        id: 'group_123',
        name: 'Size',
        description: 'Choose your drink size',
        selectionType: 'single',
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/modifiers/groups', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.createGroup(input);

      expect(result.id).toBe('group_123');
      expect(result.name).toBe('Size');
      expect(result.selectionType).toBe('single');
      expect(result.isRequired).toBe(true);
    });
  });

  describe('getGroup', () => {
    it('should retrieve a modifier group by ID', async () => {
      const mockResponse: ModifierGroup = {
        id: 'group_123',
        name: 'Toppings',
        description: 'Choose your toppings',
        selectionType: 'multiple',
        isRequired: false,
        minSelections: 0,
        maxSelections: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/modifiers/groups/group_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.getGroup('group_123');

      expect(result.id).toBe('group_123');
      expect(result.name).toBe('Toppings');
      expect(result.selectionType).toBe('multiple');
    });

    it('should throw API error when modifier group not found', async () => {
      nock(BASE_URL)
        .get('/modifiers/groups/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Modifier group not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.modifiers.getGroup('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('listGroups', () => {
    it('should list modifier groups with pagination', async () => {
      const mockGroups: ModifierGroup[] = [
        {
          id: 'group_1',
          name: 'Size',
          selectionType: 'single',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'group_2',
          name: 'Extras',
          selectionType: 'multiple',
          isRequired: false,
          minSelections: 0,
          maxSelections: 10,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ModifierGroup> = {
        data: mockGroups,
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
        .get('/modifiers/groups')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.listGroups();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Size');
      expect(result.data[1].name).toBe('Extras');
    });
  });

  describe('updateGroup', () => {
    it('should update a modifier group', async () => {
      const updateData = {
        id: 'group_123',
        name: 'Drink Size',
        maxSelections: 1,
      };

      const mockResponse: ModifierGroup = {
        id: 'group_123',
        name: 'Drink Size',
        selectionType: 'single',
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/modifiers/groups/group_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.updateGroup('group_123', updateData);

      expect(result.name).toBe('Drink Size');
    });
  });

  describe('deleteGroup', () => {
    it('should delete a modifier group', async () => {
      nock(BASE_URL)
        .delete('/modifiers/groups/group_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.deleteGroup('group_123');
      expect(result).toBe(true);
    });
  });

  describe('createGroupBatch', () => {
    it('should create multiple modifier groups in batch', async () => {
      const inputData = [
        { name: 'Size', selectionType: 'single' as const, isRequired: true, minSelections: 1, maxSelections: 1 },
        { name: 'Extras', selectionType: 'multiple' as const, isRequired: false, minSelections: 0, maxSelections: 5 },
      ];

      const mockGroups: ModifierGroup[] = [
        {
          id: 'group_1',
          name: 'Size',
          selectionType: 'single',
          isRequired: true,
          minSelections: 1,
          maxSelections: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'group_2',
          name: 'Extras',
          selectionType: 'multiple',
          isRequired: false,
          minSelections: 0,
          maxSelections: 5,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ModifierGroup> = {
        data: mockGroups,
        meta: {
          page: 1,
          pageSize: 2,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/modifiers/groups/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.createGroupBatch(inputData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Size');
      expect(result.data[1].name).toBe('Extras');
    });
  });

  // =============== Modifier Option Tests ===============

  describe('createOption', () => {
    it('should create a new modifier option', async () => {
      const input = {
        modifierGroupId: 'group_123',
        name: 'Large',
        priceAdjustment: 1.50,
        sortOrder: 3,
        isDefault: false,
      };

      const mockResponse: ModifierOption = {
        id: 'option_123',
        modifierGroupId: 'group_123',
        name: 'Large',
        priceAdjustment: 1.50,
        sortOrder: 3,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/modifiers/options', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.createOption(input);

      expect(result.id).toBe('option_123');
      expect(result.name).toBe('Large');
      expect(result.priceAdjustment).toBe(1.50);
    });
  });

  describe('getOption', () => {
    it('should retrieve a modifier option by ID', async () => {
      const mockResponse: ModifierOption = {
        id: 'option_123',
        modifierGroupId: 'group_123',
        name: 'Medium',
        priceAdjustment: 0.75,
        sortOrder: 2,
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/modifiers/options/option_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.getOption('option_123');

      expect(result.id).toBe('option_123');
      expect(result.name).toBe('Medium');
      expect(result.isDefault).toBe(true);
    });
  });

  describe('getOptionsByGroup', () => {
    it('should retrieve options by modifier group ID', async () => {
      const mockOptions: ModifierOption[] = [
        {
          id: 'option_1',
          modifierGroupId: 'group_123',
          name: 'Small',
          priceAdjustment: 0,
          sortOrder: 1,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'option_2',
          modifierGroupId: 'group_123',
          name: 'Medium',
          priceAdjustment: 0.50,
          sortOrder: 2,
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ModifierOption> = {
        data: mockOptions,
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
        .get('/modifiers/options/by-group/group_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.getOptionsByGroup('group_123');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Small');
      expect(result.data[1].name).toBe('Medium');
    });
  });

  describe('listOptions', () => {
    it('should list modifier options with pagination', async () => {
      const mockResponse: PaginatedResultType<ModifierOption> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/modifiers/options')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.listOptions();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('updateOption', () => {
    it('should update a modifier option', async () => {
      const updateData = {
        id: 'option_123',
        name: 'Extra Large',
        priceAdjustment: 2.00,
      };

      const mockResponse: ModifierOption = {
        id: 'option_123',
        modifierGroupId: 'group_123',
        name: 'Extra Large',
        priceAdjustment: 2.00,
        sortOrder: 4,
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/modifiers/options/option_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.updateOption('option_123', updateData);

      expect(result.name).toBe('Extra Large');
      expect(result.priceAdjustment).toBe(2.00);
    });
  });

  describe('deleteOption', () => {
    it('should delete a modifier option', async () => {
      nock(BASE_URL)
        .delete('/modifiers/options/option_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.deleteOption('option_123');
      expect(result).toBe(true);
    });
  });

  describe('createOptionBatch', () => {
    it('should create multiple modifier options in batch', async () => {
      const inputData = [
        { modifierGroupId: 'group_1', name: 'Small', priceAdjustment: 0, sortOrder: 1, isDefault: false },
        { modifierGroupId: 'group_1', name: 'Large', priceAdjustment: 1.00, sortOrder: 2, isDefault: false },
      ];

      const mockOptions: ModifierOption[] = [
        {
          id: 'option_1',
          modifierGroupId: 'group_1',
          name: 'Small',
          priceAdjustment: 0,
          sortOrder: 1,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'option_2',
          modifierGroupId: 'group_1',
          name: 'Large',
          priceAdjustment: 1.00,
          sortOrder: 2,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ModifierOption> = {
        data: mockOptions,
        meta: {
          page: 1,
          pageSize: 2,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/modifiers/options/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.createOptionBatch(inputData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Small');
      expect(result.data[1].name).toBe('Large');
    });
  });

  // =============== Item Modifier Binding Tests ===============

  describe('createBinding', () => {
    it('should create a new item modifier binding', async () => {
      const input = {
        menuItemId: 'item_123',
        modifierGroupId: 'group_123',
        menuSetId: 'set_456',
        sortOrder: 1,
      };

      const mockResponse: ItemModifierBinding = {
        id: 'binding_123',
        menuItemId: 'item_123',
        modifierGroupId: 'group_123',
        menuSetId: 'set_456',
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/modifiers/bindings', input)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.createBinding(input);

      expect(result.id).toBe('binding_123');
      expect(result.menuItemId).toBe('item_123');
      expect(result.modifierGroupId).toBe('group_123');
    });
  });

  describe('getBinding', () => {
    it('should retrieve a binding by ID', async () => {
      const mockResponse: ItemModifierBinding = {
        id: 'binding_123',
        menuItemId: 'item_123',
        modifierGroupId: 'group_123',
        menuSetId: 'set_456',
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/modifiers/bindings/binding_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.getBinding('binding_123');

      expect(result.id).toBe('binding_123');
      expect(result.menuItemId).toBe('item_123');
    });
  });

  describe('getBindingsByMenuItem', () => {
    it('should retrieve bindings by menu item ID', async () => {
      const mockBindings: ItemModifierBinding[] = [
        {
          id: 'binding_1',
          menuItemId: 'item_123',
          modifierGroupId: 'group_1',
          sortOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_2',
          menuItemId: 'item_123',
          modifierGroupId: 'group_2',
          sortOrder: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ItemModifierBinding> = {
        data: mockBindings,
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
        .get('/modifiers/bindings/by-menu-item/item_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.getBindingsByMenuItem('item_123');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].modifierGroupId).toBe('group_1');
      expect(result.data[1].modifierGroupId).toBe('group_2');
    });
  });

  describe('getBindingsByMenuSet', () => {
    it('should retrieve bindings by menu set ID', async () => {
      const mockBindings: ItemModifierBinding[] = [
        {
          id: 'binding_1',
          menuItemId: 'item_1',
          modifierGroupId: 'group_1',
          menuSetId: 'set_456',
          sortOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ItemModifierBinding> = {
        data: mockBindings,
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
        .get('/modifiers/bindings/by-menu-set/set_456')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.getBindingsByMenuSet('set_456');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].menuSetId).toBe('set_456');
    });
  });

  describe('listBindings', () => {
    it('should list bindings with pagination', async () => {
      const mockResponse: PaginatedResultType<ItemModifierBinding> = {
        data: [],
        meta: {
          page: 1,
          pageSize: 20,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .get('/modifiers/bindings')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.listBindings();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('updateBinding', () => {
    it('should update a binding', async () => {
      const updateData = {
        id: 'binding_123',
        sortOrder: 5,
      };

      const mockResponse: ItemModifierBinding = {
        id: 'binding_123',
        menuItemId: 'item_123',
        modifierGroupId: 'group_123',
        sortOrder: 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/modifiers/bindings/binding_123', updateData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.updateBinding('binding_123', updateData);

      expect(result.sortOrder).toBe(5);
    });
  });

  describe('deleteBinding', () => {
    it('should delete a binding', async () => {
      nock(BASE_URL)
        .delete('/modifiers/bindings/binding_123')
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.deleteBinding('binding_123');
      expect(result).toBe(true);
    });
  });

  describe('createBindingBatch', () => {
    it('should create multiple bindings in batch', async () => {
      const inputData = [
        { menuItemId: 'item_1', modifierGroupId: 'group_1', sortOrder: 1 },
        { menuItemId: 'item_1', modifierGroupId: 'group_2', sortOrder: 2 },
      ];

      const mockBindings: ItemModifierBinding[] = [
        {
          id: 'binding_1',
          menuItemId: 'item_1',
          modifierGroupId: 'group_1',
          sortOrder: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'binding_2',
          menuItemId: 'item_1',
          modifierGroupId: 'group_2',
          sortOrder: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ItemModifierBinding> = {
        data: mockBindings,
        meta: {
          page: 1,
          pageSize: 2,
          totalCount: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      nock(BASE_URL)
        .post('/modifiers/bindings/batch', inputData)
        .matchHeader('X-Wiil-Api-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.modifiers.createBindingBatch(inputData);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].modifierGroupId).toBe('group_1');
      expect(result.data[1].modifierGroupId).toBe('group_2');
    });
  });
});
