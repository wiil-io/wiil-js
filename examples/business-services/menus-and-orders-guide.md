# Menu Management Guide

**Manage restaurant menus and food service orders using the WIIL Platform JS SDK**

**Setup Time**: ~15 minutes

---

## Overview

The Menu Management system provides comprehensive tools for managing restaurant menus, item variants, modifiers, and customer orders.

**Key Resources:**
- `client.menus` - Categories and menu items
- `client.menuItemVariants` - Size/price variations
- `client.modifiers` - Customization options (toppings, sides)
- `client.menuOrders` - Customer orders

---

## Prerequisites

1. Active WIIL Platform account
2. API key with business management permissions
3. Node.js project with wiil-js SDK installed

---

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';
import { MenuOrderType } from 'wiil-core-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

// 1. Create a menu category
const category = await client.menus.createCategory({
  name: 'Main Courses',
  description: 'Signature entrees and main dishes',
  displayOrder: 1,
});

// 2. Create a menu item with required variants
const menuItem = await client.menus.createItem({
  categoryId: category.id,
  name: 'Cheeseburger',
  description: 'Angus beef with aged cheddar',
  price: 12.99,
  isAvailable: true,
  isActive: true,
  preparationTime: 15,
  displayOrder: 1,
  variants: [
    {
      name: 'Default',
      price: 12.99,
      isDefault: true,
      isActive: true,
      isAvailable: true,
    },
  ],
});

// 3. Create an order (requires variantId)
const order = await client.menuOrders.create({
  customerId: 'cust_123',
  type: MenuOrderType.TAKEOUT,
  orderDate: Date.now(),
  items: [
    {
      menuItemId: menuItem.id,
      variantId: menuItem.variants[0].id,
      itemName: menuItem.name,
      quantity: 2,
      unitPrice: 12.99,
      totalPrice: 25.98,
    },
  ],
  pricing: {
    subtotal: 25.98,
    total: 25.98,
  },
});

console.log(`Order Created: ${order.id}`);
```

---

## Menu Categories

### Create Category

```typescript
const category = await client.menus.createCategory({
  name: 'Appetizers',
  description: 'Start your meal right',
  displayOrder: 1,
});

console.log(`Category Created: ${category.id}`);
```

### Get Category

```typescript
const category = await client.menus.getCategory('cat_123');

console.log(`Category: ${category.name}`);
```

### List Categories

```typescript
const result = await client.menus.listCategories();

console.log(`Categories: ${result.data.length}`);
result.data.forEach(cat => {
  console.log(`- ${cat.name}`);
});
```

### Update Category

```typescript
const updated = await client.menus.updateCategory({
  id: 'cat_123',
  name: 'Premium Appetizers',
  displayOrder: 2,
});

console.log(`Updated: ${updated.name}`);
```

### Delete Category

```typescript
await client.menus.deleteCategory('cat_123');
console.log('Category deleted');
```

### Batch Create Categories

```typescript
const result = await client.menus.createCategoryBatch([
  { name: 'Appetizers', description: 'Start your meal', displayOrder: 1 },
  { name: 'Main Courses', description: 'Signature entrees', displayOrder: 2 },
  { name: 'Desserts', description: 'Sweet treats', displayOrder: 3 },
]);

console.log(`Created ${result.data.length} categories`);
```

---

## Menu Items

Menu items **require at least one variant** for pricing.

### Create Item

```typescript
const item = await client.menus.createItem({
  categoryId: 'cat_123',
  name: 'Caesar Salad',
  description: 'Fresh romaine with house-made dressing',
  price: 9.99,
  isAvailable: true,
  isActive: true,
  preparationTime: 10,
  displayOrder: 1,
  variants: [
    {
      name: 'Default',
      price: 9.99,
      isDefault: true,
      isActive: true,
      isAvailable: true,
    },
  ],
});

console.log(`Item Created: ${item.id}`);
console.log(`Variant ID: ${item.variants[0].id}`);
```

### Create Item with Multiple Variants

```typescript
const pizza = await client.menus.createItem({
  categoryId: 'cat_main',
  name: 'Margherita Pizza',
  description: 'Classic tomato and mozzarella',
  price: 14.99,
  isAvailable: true,
  isActive: true,
  preparationTime: 20,
  displayOrder: 1,
  variants: [
    {
      name: 'Small (10")',
      price: 14.99,
      isDefault: true,
      isActive: true,
      isAvailable: true,
    },
    {
      name: 'Medium (12")',
      price: 18.99,
      isDefault: false,
      isActive: true,
      isAvailable: true,
    },
    {
      name: 'Large (14")',
      price: 22.99,
      isDefault: false,
      isActive: true,
      isAvailable: true,
    },
  ],
});

console.log(`Created pizza with ${pizza.variants.length} sizes`);
```

### Get Item

```typescript
const item = await client.menus.getItem('item_123');

console.log(`Item: ${item.name}`);
console.log(`Price: $${item.price}`);
console.log(`Variants: ${item.variants?.length}`);
```

### List Items

```typescript
const result = await client.menus.listItems();

console.log(`Items: ${result.data.length}`);
```

### Update Item

```typescript
const updated = await client.menus.updateItem({
  id: 'item_123',
  description: 'Updated: Fresh romaine with premium Caesar dressing',
  isAvailable: true,
  isActive: true,
});

console.log(`Updated: ${updated.description}`);
```

### Delete Item

```typescript
await client.menus.deleteItem('item_123');
console.log('Item deleted');
```

### Batch Create Items

```typescript
const result = await client.menus.createItemBatch([
  {
    categoryId: 'cat_appetizers',
    name: 'Buffalo Wings',
    description: 'Crispy wings with hot sauce',
    price: 11.99,
    isAvailable: true,
    isActive: true,
    variants: [{ name: 'Default', price: 11.99, isDefault: true, isActive: true, isAvailable: true }],
  },
  {
    categoryId: 'cat_appetizers',
    name: 'Mozzarella Sticks',
    description: 'Breaded and fried with marinara',
    price: 8.99,
    isAvailable: true,
    isActive: true,
    variants: [{ name: 'Default', price: 8.99, isDefault: true, isActive: true, isAvailable: true }],
  },
]);

console.log(`Created ${result.data.length} items`);
```

---

## Menu Item Variants

Manage size/price variations for menu items separately.

### Create Variant

```typescript
const variant = await client.menuItemVariants.create({
  menuItemId: 'item_123',
  name: 'Extra Large',
  sku: 'PIZZA-XL-001',
  price: 26.99,
  isDefault: false,
  displayOrder: 4,
});

console.log(`Variant Created: ${variant.id}`);
```

### Get Variant

```typescript
const variant = await client.menuItemVariants.get('variant_123');

console.log(`Variant: ${variant.name} - $${variant.price}`);
```

### Get Default Variant

```typescript
const defaultVariant = await client.menuItemVariants.getDefault('item_123');

if (defaultVariant) {
  console.log(`Default: ${defaultVariant.name} - $${defaultVariant.price}`);
}
```

### Update Variant

```typescript
const updated = await client.menuItemVariants.update('variant_123', {
  id: 'variant_123',
  price: 27.99,
  isAvailable: true,
});

console.log(`Updated price: $${updated.price}`);
```

### Delete Variant

```typescript
await client.menuItemVariants.delete('variant_123');
console.log('Variant deleted');
```

### Batch Create Variants

```typescript
const result = await client.menuItemVariants.createBatch([
  {
    menuItemId: 'item_123',
    name: 'Medium',
    price: 18.99,
    isDefault: false,
    isActive: true,
    isAvailable: true,
  },
  {
    menuItemId: 'item_123',
    name: 'Large',
    price: 22.99,
    isDefault: false,
    isActive: true,
    isAvailable: true,
  },
]);

console.log(`Created ${result.data.length} variants`);
```

---

## Modifiers

Modifiers allow customers to customize menu items (toppings, sides, cooking preferences).

### Modifier Groups

Groups organize related modifier options.

```typescript
// Create modifier group with options
const toppingsGroup = await client.modifiers.createGroup({
  name: 'Toppings',
  description: 'Add extra toppings',
  isRequired: false,
  minSelection: 0,
  maxSelection: 3,
  displayOrder: 1,
  isActive: true,
  options: [
    {
      name: 'Extra Cheese',
      priceDelta: 1.50,
      displayOrder: 1,
      isDefault: false,
      isActive: true,
    },
    {
      name: 'Bacon',
      priceDelta: 2.00,
      displayOrder: 2,
      isDefault: false,
      isActive: true,
    },
    {
      name: 'Avocado',
      priceDelta: 2.50,
      displayOrder: 3,
      isDefault: false,
      isActive: true,
    },
  ],
});

console.log(`Group Created: ${toppingsGroup.id}`);
```

### Get Modifier Group

```typescript
const group = await client.modifiers.getGroup('group_123');

console.log(`Group: ${group.name}`);
console.log(`Required: ${group.isRequired}`);
console.log(`Max Selection: ${group.maxSelection}`);
```

### List Modifier Groups

```typescript
const result = await client.modifiers.listGroups();

console.log(`Groups: ${result.data.length}`);
```

### Update Modifier Group

```typescript
const updated = await client.modifiers.updateGroup('group_123', {
  id: 'group_123',
  description: 'Updated: Premium toppings',
});

console.log(`Updated: ${updated.description}`);
```

### Delete Modifier Group

```typescript
await client.modifiers.deleteGroup('group_123');
console.log('Group deleted');
```

### Modifier Options

Add individual options to a group.

```typescript
// Create option
const option = await client.modifiers.createOption({
  modifierGroupId: 'group_123',
  name: 'Jalapenos',
  description: 'Spicy sliced jalapenos',
  priceDelta: 0.75,
  displayOrder: 4,
  isDefault: false,
  isActive: true,
});

console.log(`Option Created: ${option.id}`);

// Get options by group
const options = await client.modifiers.getOptionsByGroup('group_123');
console.log(`Options: ${options.data.length}`);

// Update option
const updated = await client.modifiers.updateOption('option_123', {
  id: 'option_123',
  priceDelta: 1.00,
});

// Delete option
await client.modifiers.deleteOption('option_123');
```

### Item Modifier Bindings

Link modifier groups to menu items.

```typescript
// Create binding
const binding = await client.modifiers.createBinding({
  menuItemId: 'item_burger',
  modifierGroupId: 'group_toppings',
  displayOrder: 1,
  isRequired: false,
});

console.log(`Binding Created: ${binding.id}`);

// Get bindings for menu item
const bindings = await client.modifiers.getBindingsByMenuItem('item_burger');
console.log(`Item has ${bindings.data.length} modifier groups`);

// Update binding
const updated = await client.modifiers.updateBinding('binding_123', {
  id: 'binding_123',
  displayOrder: 2,
  isActive: true,
});

// Delete binding
await client.modifiers.deleteBinding('binding_123');
```

---

## Menu Orders

### Create Order

```typescript
import { MenuOrderType } from 'wiil-core-js';

const order = await client.menuOrders.create({
  customerId: 'cust_456',
  type: MenuOrderType.DINE_IN,
  orderDate: Date.now(),
  items: [
    {
      menuItemId: 'item_123',
      variantId: 'variant_456',
      itemName: 'Cheeseburger',
      quantity: 2,
      unitPrice: 12.99,
      totalPrice: 25.98,
    },
  ],
  pricing: {
    subtotal: 25.98,
    total: 25.98,
  },
});

console.log(`Order Created: ${order.id}`);
```

### Create Delivery Order

```typescript
const order = await client.menuOrders.create({
  customerId: 'cust_789',
  type: MenuOrderType.DELIVERY,
  orderDate: Date.now(),
  items: [
    {
      menuItemId: 'item_pizza',
      variantId: 'variant_large',
      itemName: 'Margherita Pizza (Large)',
      quantity: 1,
      unitPrice: 22.99,
      totalPrice: 22.99,
    },
  ],
  pricing: {
    subtotal: 22.99,
    total: 22.99,
  },
});

console.log(`Delivery Order: ${order.id}`);
```

### Get Order

```typescript
const order = await client.menuOrders.get('order_123');

console.log(`Order: ${order.id}`);
console.log(`Status: ${order.status}`);
console.log(`Total: $${order.pricing.total}`);
```

### List Orders

```typescript
const result = await client.menuOrders.list();

console.log(`Orders: ${result.data.length}`);
result.data.forEach(order => {
  console.log(`- ${order.id}: ${order.status} ($${order.pricing.total})`);
});
```

### Update Order

```typescript
const updated = await client.menuOrders.update({
  id: 'order_123',
  pricing: {
    subtotal: 35.00,
    total: 35.00,
  },
});

console.log(`Updated total: $${updated.pricing.total}`);
```

### Update Order Status

```typescript
import { OrderStatus } from 'wiil-core-js';

const updated = await client.menuOrders.updateStatus('order_123', {
  id: 'order_123',
  status: OrderStatus.CONFIRMED,
  estimatedReadyTime: null,
  actualReadyTime: null,
});

console.log(`Status: ${updated.status}`);
```

### Cancel Order

```typescript
const cancelled = await client.menuOrders.cancel('order_123', {
  cancelReason: 'Customer requested cancellation',
});

console.log(`Status: ${cancelled.status}`);
```

### Delete Order

```typescript
await client.menuOrders.delete('order_123');
console.log('Order deleted');
```

---

## Status Enums

### Order Status

```typescript
import { OrderStatus } from 'wiil-core-js';

// OrderStatus.PENDING        - 'pending'
// OrderStatus.CONFIRMED      - 'confirmed'
// OrderStatus.PREPARING      - 'preparing'
// OrderStatus.READY          - 'ready'
// OrderStatus.OUT_FOR_DELIVERY - 'out_for_delivery'
// OrderStatus.COMPLETED      - 'completed'
// OrderStatus.CANCELLED      - 'cancelled'
// OrderStatus.RETURNED       - 'returned'
```

### Order Type

```typescript
import { MenuOrderType } from 'wiil-core-js';

// MenuOrderType.DINE_IN   - 'dine_in'
// MenuOrderType.TAKEOUT   - 'takeout'
// MenuOrderType.DELIVERY  - 'delivery'
```

---

## Complete Example: Restaurant Setup

```typescript
import { WiilClient } from 'wiil-js';
import { MenuOrderType, OrderStatus, PreferredContactMethod } from 'wiil-core-js';

async function setupRestaurant() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Create customer
  console.log('Creating customer...');
  const customer = await client.customers.create({
    phone_number: '+15551234567',
    firstname: 'John',
    lastname: 'Doe',
    preferred_language: 'en',
    preferred_contact_method: PreferredContactMethod.SMS,
    isValidatedNames: false,
  });
  console.log(`Customer: ${customer.id}`);

  // 2. Create menu categories
  console.log('\nCreating categories...');
  const appetizers = await client.menus.createCategory({
    name: 'Appetizers',
    description: 'Start your meal',
    displayOrder: 1,
  });

  const entrees = await client.menus.createCategory({
    name: 'Entrees',
    description: 'Main courses',
    displayOrder: 2,
  });
  console.log('Categories created');

  // 3. Create menu items with variants
  console.log('\nCreating menu items...');
  const wings = await client.menus.createItem({
    categoryId: appetizers.id,
    name: 'Buffalo Wings',
    description: 'Crispy wings with hot sauce',
    price: 11.99,
    isAvailable: true,
    isActive: true,
    preparationTime: 15,
    displayOrder: 1,
    variants: [
      { name: '6 pieces', price: 11.99, isDefault: true, isActive: true, isAvailable: true },
      { name: '12 pieces', price: 19.99, isDefault: false, isActive: true, isAvailable: true },
    ],
  });

  const burger = await client.menus.createItem({
    categoryId: entrees.id,
    name: 'Classic Burger',
    description: 'Angus beef with all the fixings',
    price: 14.99,
    isAvailable: true,
    isActive: true,
    preparationTime: 12,
    displayOrder: 1,
    variants: [
      { name: 'Default', price: 14.99, isDefault: true, isActive: true, isAvailable: true },
    ],
  });
  console.log('Menu items created');

  // 4. Create modifier group for burger
  console.log('\nCreating modifiers...');
  const toppings = await client.modifiers.createGroup({
    name: 'Extra Toppings',
    description: 'Customize your burger',
    isRequired: false,
    minSelection: 0,
    maxSelection: 3,
    displayOrder: 1,
    isActive: true,
    options: [
      { name: 'Bacon', priceDelta: 2.00, displayOrder: 1, isDefault: false, isActive: true },
      { name: 'Extra Cheese', priceDelta: 1.50, displayOrder: 2, isDefault: false, isActive: true },
      { name: 'Avocado', priceDelta: 2.50, displayOrder: 3, isDefault: false, isActive: true },
    ],
  });

  // Link modifiers to burger
  await client.modifiers.createBinding({
    menuItemId: burger.id,
    modifierGroupId: toppings.id,
    displayOrder: 1,
    isRequired: false,
  });
  console.log('Modifiers linked to burger');

  // 5. Create an order
  console.log('\nCreating order...');
  const order = await client.menuOrders.create({
    customerId: customer.id,
    type: MenuOrderType.DINE_IN,
    orderDate: Date.now(),
    items: [
      {
        menuItemId: wings.id,
        variantId: wings.variants[1].id, // 12 pieces
        itemName: 'Buffalo Wings (12 pieces)',
        quantity: 1,
        unitPrice: 19.99,
        totalPrice: 19.99,
      },
      {
        menuItemId: burger.id,
        variantId: burger.variants[0].id,
        itemName: 'Classic Burger',
        quantity: 2,
        unitPrice: 14.99,
        totalPrice: 29.98,
      },
    ],
    pricing: {
      subtotal: 49.97,
      total: 49.97,
    },
  });
  console.log(`Order Created: ${order.id}`);

  // 6. Update order status through lifecycle
  console.log('\nProcessing order...');
  
  await client.menuOrders.updateStatus(order.id, {
    id: order.id,
    status: OrderStatus.CONFIRMED,
    estimatedReadyTime: null,
    actualReadyTime: null,
  });
  console.log('Order confirmed');

  // API expects Unix timestamps (seconds)
  const nowSec = Math.floor(Date.now() / 1000);
  
  await client.menuOrders.updateStatus(order.id, {
    id: order.id,
    status: OrderStatus.PREPARING,
    estimatedReadyTime: nowSec + (15 * 60), // 15 minutes from now
    actualReadyTime: null,
  });
  console.log('Order preparing');

  await client.menuOrders.updateStatus(order.id, {
    id: order.id,
    status: OrderStatus.READY,
    estimatedReadyTime: null,
    actualReadyTime: Math.floor(Date.now() / 1000),
  });
  console.log('Order ready');

  await client.menuOrders.updateStatus(order.id, {
    id: order.id,
    status: OrderStatus.COMPLETED,
    estimatedReadyTime: null,
    actualReadyTime: null,
  });
  console.log('Order completed');

  return { customer, categories: [appetizers, entrees], items: [wings, burger], order };
}

setupRestaurant().catch(console.error);
```

---

## Best Practices

### 1. Always Include Variants

```typescript
// Every menu item needs at least one variant
const item = await client.menus.createItem({
  categoryId: 'cat_123',
  name: 'Caesar Salad',
  price: 9.99,
  isAvailable: true,
  isActive: true,
  variants: [
    { name: 'Default', price: 9.99, isDefault: true, isActive: true, isAvailable: true },
  ],
});
```

### 2. Use variantId in Orders

```typescript
// Order items require variantId
const order = await client.menuOrders.create({
  customerId: customer.id,
  type: MenuOrderType.DINE_IN,
  orderDate: Date.now(),
  items: [
    {
      menuItemId: item.id,
      variantId: item.variants[0].id,  // Required
      itemName: item.name,
      quantity: 1,
      unitPrice: item.price,
      totalPrice: item.price,
    },
  ],
  pricing: { subtotal: item.price, total: item.price },
});
```

### 3. Status Progression

```typescript
// Follow the standard order lifecycle
// pending → confirmed → preparing → ready → completed
```

### 4. Pricing Accuracy

```typescript
const items = [
  { price: 12.99, quantity: 2 },
  { price: 8.99, quantity: 1 },
];

const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

const pricing = {
  subtotal: Number(subtotal.toFixed(2)),
  total: Number(subtotal.toFixed(2)),
};
```

---

## Troubleshooting

### Missing variants

**Problem**: "Menu item must have at least one variant"

**Solution**: Include the `variants` array when creating items:
```typescript
const item = await client.menus.createItem({
  // ... other fields
  variants: [
    { name: 'Default', price: 9.99, isDefault: true, isActive: true, isAvailable: true },
  ],
});
```

### Missing variantId in order

**Problem**: "variantId is required for order items"

**Solution**: Include variantId for each order item:
```typescript
const order = await client.menuOrders.create({
  items: [
    {
      menuItemId: item.id,
      variantId: item.variants[0].id,  // Required
      // ... other fields
    },
  ],
  // ...
});
```

### Invalid order status update

**Problem**: Status update fails

**Solution**: Include all required fields:
```typescript
await client.menuOrders.updateStatus(orderId, {
  id: orderId,
  status: OrderStatus.CONFIRMED,
  estimatedReadyTime: null,
  actualReadyTime: null,
});
```

---

[Back to Examples](../README.md)
