# Menu Management Guide

This guide covers managing restaurant menus and food service orders using the WIIL Platform JS SDK.

## Quick Start

```typescript
import { WiilClient, MenuOrderType, OrderStatus, PaymentStatus } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Create a menu category
const category = await client.menus.createCategory({
  name: 'Main Courses',
  description: 'Signature entrees and main dishes',
  displayOrder: 1,
});

// Create a menu item
const menuItem = await client.menus.createItem({
  name: 'Cheeseburger',
  description: 'Angus beef with aged cheddar',
  price: 12.99,
  categoryId: category.id,
  ingredients: ['beef', 'cheese', 'lettuce', 'tomato', 'bun'],
  allergens: ['gluten', 'dairy'],
  nutritionalInfo: {
    calories: 650,
    protein: 35,
    carbs: 48,
    fat: 32,
  },
  isAvailable: true,
  preparationTime: 15,
  isActive: true,
  displayOrder: 1,
});

// Create an order
const order = await client.menuOrders.create({
  type: MenuOrderType.TAKEOUT,
  items: [
    {
      menuItemId: menuItem.id,
      itemName: menuItem.name,
      quantity: 2,
      unitPrice: menuItem.price,
      totalPrice: menuItem.price * 2,
    },
  ],
  customerId: 'cust_123',
  pricing: {
    subtotal: 25.98,
    tax: 2.60,
    tip: 5.00,
    total: 33.58,
  },
  orderDate: Date.now(),
  source: 'web',
});
```

## Menu Categories

### Category Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| description | string | No | Category description |
| displayOrder | number | No | Display order for sorting |

### Create Category

```typescript
const category = await client.menus.createCategory({
  name: 'Appetizers',
  description: 'Start your meal right',
  displayOrder: 1,
});

console.log('Category created:', category.id);
```

### Get Category

```typescript
const category = await client.menus.getCategory('cat_123');

console.log('Category:', category.name);
```

### List Categories

```typescript
const result = await client.menus.listCategories({
  page: 1,
  pageSize: 20,
});

console.log('Categories:', result.data.length);
console.log('Total:', result.meta.totalCount);
```

### Update Category

```typescript
const updated = await client.menus.updateCategory({
  id: 'cat_123',
  name: 'Premium Appetizers',
  displayOrder: 2,
});

console.log('Category updated:', updated.name);
```

### Delete Category

```typescript
const deleted = await client.menus.deleteCategory('cat_123');

console.log('Deleted:', deleted);
```

## Menu Items

### Item Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Item name |
| description | string | No | Item description |
| price | number | Yes | Item price |
| categoryId | string | No | Category ID (nullable) |
| ingredients | string[] | No | List of ingredients |
| allergens | string[] | No | Allergen information |
| nutritionalInfo | object | No | Nutritional data (calories, protein, carbs, fat) |
| isAvailable | boolean | No | Available for ordering (default: true) |
| preparationTime | number | No | Preparation time in minutes |
| isActive | boolean | No | Item is active (default: true) |
| displayOrder | number | No | Display order for sorting |

### Create Item

```typescript
const item = await client.menus.createItem({
  name: 'Caesar Salad',
  description: 'Fresh romaine with house-made dressing',
  price: 9.99,
  categoryId: 'cat_123',
  ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing'],
  allergens: ['dairy', 'gluten', 'eggs'],
  nutritionalInfo: {
    calories: 320,
    protein: 8,
    carbs: 22,
    fat: 18,
  },
  isAvailable: true,
  preparationTime: 10,
  isActive: true,
  displayOrder: 1,
});

console.log('Item created:', item.id);
```

### Get Item

```typescript
const item = await client.menus.getItem('item_123');

console.log('Item:', item.name);
console.log('Price:', item.price);
```

### List All Items

```typescript
const result = await client.menus.listItems({
  page: 1,
  pageSize: 50,
  includeDeleted: false,
});

console.log('Items:', result.data.length);
```

### Get Items by Category

```typescript
const result = await client.menus.getItemsByCategory('cat_123', {
  page: 1,
  pageSize: 20,
  includeUnavailable: false,
});

console.log('Items in category:', result.data.length);
```

### Get Popular Items

```typescript
const result = await client.menus.getPopularItems({
  page: 1,
  pageSize: 10,
});

console.log('Top items:', result.data.map(item => item.name));
```

### Update Item

```typescript
const updated = await client.menus.updateItem({
  id: 'item_123',
  price: 10.99,
  isAvailable: true,
});

console.log('Item updated:', updated.name);
```

### Delete Item

```typescript
const deleted = await client.menus.deleteItem('item_123');

console.log('Deleted:', deleted);
```

## Menu Orders

### Order Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Order type: 'dine_in', 'takeout', 'delivery' |
| items | array | Yes | Order items (see Item Schema below) |
| customerId | string | Yes | Customer ID |
| customer | object | No | Customer information (name, phone, email, address) |
| pricing | object | Yes | Pricing breakdown (subtotal, tax, tip, shippingAmount, discount, total, currency) |
| orderDate | number | Yes | Order date (Unix timestamp) |
| paymentStatus | string | No | Payment status (default: 'pending') |
| paymentMethod | string | No | Payment method |
| paymentReference | string | No | Payment reference number |
| requestedTime | number | No | Requested pickup/delivery time |
| estimatedReadyTime | number | No | Estimated ready time |
| specialInstructions | string | No | Special instructions |
| allergies | string[] | No | Customer allergies |
| tableNumber | string | No | Table number (for dine-in) |
| externalOrderId | string | No | External order ID |
| source | string | No | Order source (default: 'direct') |
| deliveryAddress | object | No | Delivery address (street, city, postalCode) |

### Order Item Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| menuItemId | string | Yes | Menu item ID |
| itemName | string | Yes | Item name |
| quantity | number | Yes | Quantity ordered |
| unitPrice | number | Yes | Price per unit |
| totalPrice | number | Yes | Total price for this item |
| specialInstructions | string | No | Special preparation instructions |
| customizations | array | No | Customizations (name, value, additionalCost) |
| preparationTime | number | No | Preparation time in minutes |
| notes | string | No | Additional notes |

Note: Status defaults to 'pending' and should not be included in create requests.

### Create Order

```typescript
const order = await client.menuOrders.create({
  type: MenuOrderType.TAKEOUT,
  items: [
    {
      menuItemId: 'item_123',
      itemName: 'Cheeseburger',
      quantity: 2,
      unitPrice: 12.99,
      totalPrice: 25.98,
      specialInstructions: 'No onions',
      customizations: [
        {
          name: 'Extra Cheese',
          value: 'Yes',
          additionalCost: 1.50,
        },
      ],
      preparationTime: 15,
    },
  ],
  customerId: 'cust_456',
  customer: {
    name: 'John Doe',
    phone: '+12125551234',
    email: 'john@example.com',
  },
  pricing: {
    subtotal: 25.98,
    tax: 2.60,
    tip: 5.00,
    total: 33.58,
    currency: 'USD',
  },
  orderDate: Date.now(),
  requestedTime: Date.now() + 3600000,
  specialInstructions: 'Call upon arrival',
  source: 'web',
});

console.log('Order created:', order.id);
console.log('Order number:', order.orderNumber);
```

### Create Delivery Order

```typescript
const order = await client.menuOrders.create({
  type: MenuOrderType.DELIVERY,
  items: [
    {
      menuItemId: 'item_456',
      itemName: 'Pizza',
      quantity: 1,
      unitPrice: 18.99,
      totalPrice: 18.99,
    },
  ],
  customerId: 'cust_789',
  pricing: {
    subtotal: 18.99,
    tax: 1.90,
    shippingAmount: 5.00,
    total: 25.89,
  },
  orderDate: Date.now(),
  source: 'direct',
  deliveryAddress: {
    street: '123 Main St',
    city: 'New York',
    postalCode: '10001',
  },
});

console.log('Delivery order created:', order.id);
```

### Get Order

```typescript
const order = await client.menuOrders.get('order_123');

console.log('Order:', order.orderNumber);
console.log('Status:', order.status);
console.log('Items:', order.items.length);
```

### Get Orders by Customer

```typescript
const result = await client.menuOrders.getByCustomer('cust_123', {
  page: 1,
  pageSize: 20,
});

console.log('Customer orders:', result.data.length);
```

### Update Order

```typescript
const updated = await client.menuOrders.update({
  id: 'order_123',
  status: OrderStatus.READY,
  estimatedReadyTime: Date.now() + 600000,
});

console.log('Order updated:', updated.status);
```

### Update Order Status

```typescript
const updated = await client.menuOrders.updateStatus('order_123', {
  status: OrderStatus.PREPARING,
});

console.log('Status updated:', updated.status);
```

### Cancel Order

```typescript
const cancelled = await client.menuOrders.cancel('order_123', {
  reason: 'Customer requested cancellation',
});

console.log('Order cancelled:', cancelled.status);
console.log('Reason:', cancelled.cancelReason);
```

### Delete Order

```typescript
const deleted = await client.menuOrders.delete('order_123');

console.log('Deleted:', deleted);
```

### List Orders

```typescript
const result = await client.menuOrders.list({
  page: 1,
  pageSize: 20,
});

console.log('Orders:', result.data.length);
console.log('Total:', result.meta.totalCount);
```

## Order Status Values

Order status follows this enum:

```typescript
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}
```

## Payment Status Values

Payment status follows this enum:

```typescript
enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}
```

## Order Type Values

Order type follows this enum:

```typescript
enum MenuOrderType {
  DINE_IN = 'dine_in',
  TAKEOUT = 'takeout',
  DELIVERY = 'delivery'
}
```

## Complete Example: Restaurant Menu Setup

```typescript
import { WiilClient, MenuOrderType, OrderStatus, PaymentStatus } from 'wiil-js';

async function setupRestaurantMenu() {
  const client = new WiilClient({
    apiKey: process.env.WIIL_API_KEY!,
  });

  // 1. Create menu categories
  const appetizers = await client.menus.createCategory({
    name: 'Appetizers',
    description: 'Start your meal right',
    displayOrder: 1,
  });

  const entrees = await client.menus.createCategory({
    name: 'Main Courses',
    description: 'Signature entrees',
    displayOrder: 2,
  });

  // 2. Create menu items
  const wings = await client.menus.createItem({
    name: 'Buffalo Wings',
    description: 'Crispy chicken wings with hot sauce',
    price: 11.99,
    categoryId: appetizers.id,
    ingredients: ['chicken wings', 'buffalo sauce', 'celery', 'ranch dressing'],
    allergens: ['dairy'],
    nutritionalInfo: {
      calories: 540,
      protein: 42,
      carbs: 18,
      fat: 32,
    },
    isAvailable: true,
    preparationTime: 20,
    isActive: true,
    displayOrder: 1,
  });

  const burger = await client.menus.createItem({
    name: 'Classic Burger',
    description: 'Angus beef with all the fixings',
    price: 14.99,
    categoryId: entrees.id,
    ingredients: ['beef', 'lettuce', 'tomato', 'onion', 'bun'],
    allergens: ['gluten'],
    nutritionalInfo: {
      calories: 680,
      protein: 38,
      carbs: 52,
      fat: 34,
    },
    isAvailable: true,
    preparationTime: 15,
    isActive: true,
    displayOrder: 1,
  });

  // 3. Process a customer order
  const order = await client.menuOrders.create({
    type: MenuOrderType.DINE_IN,
    items: [
      {
        menuItemId: wings.id,
        itemName: wings.name,
        quantity: 1,
        unitPrice: wings.price,
        totalPrice: wings.price,
      },
      {
        menuItemId: burger.id,
        itemName: burger.name,
        quantity: 2,
        unitPrice: burger.price,
        totalPrice: burger.price * 2,
        specialInstructions: 'Medium rare',
      },
    ],
    customerId: 'cust_123',
    customer: {
      name: 'Sarah Johnson',
      phone: '+12125555678',
      email: 'sarah@example.com',
    },
    pricing: {
      subtotal: 41.97,
      tax: 4.20,
      tip: 8.00,
      total: 54.17,
      currency: 'USD',
    },
    orderDate: Date.now(),
    tableNumber: 'T-12',
    source: 'direct',
  });

  console.log('Order created:', order.orderNumber);

  // 4. Update order status as it progresses
  await client.menuOrders.updateStatus(order.id, {
    status: OrderStatus.CONFIRMED,
  });

  await client.menuOrders.updateStatus(order.id, {
    status: OrderStatus.PREPARING,
  });

  await client.menuOrders.update({
    id: order.id,
    status: OrderStatus.READY,
    estimatedReadyTime: Date.now() + 300000,
  });

  // 5. Complete the order
  await client.menuOrders.updateStatus(order.id, {
    status: OrderStatus.COMPLETED,
  });

  // 6. Get customer's order history
  const customerOrders = await client.menuOrders.getByCustomer('cust_123');
  console.log('Customer has', customerOrders.data.length, 'orders');
}
```

## Best Practices

### Menu Organization
- Use categories to organize your menu logically
- Set displayOrder for both categories and items to control presentation
- Keep descriptions clear and concise

### Item Management
- Always include allergen information for food safety
- Provide accurate nutritional information when possible
- Use preparationTime to help estimate order completion
- Mark items as unavailable rather than deleting when out of stock

### Order Processing
- Always validate item availability before creating an order
- Calculate pricing accurately including tax and fees
- Include customer contact information for order updates
- Use status updates to track order progress

### Pricing Calculations
```typescript
const items = [
  { price: 12.99, quantity: 2 }, // 25.98
  { price: 8.99, quantity: 1 },  // 8.99
];

const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
const tax = subtotal * 0.0875; // 8.75% tax rate
const tip = subtotal * 0.20;   // 20% tip
const total = subtotal + tax + tip;

const pricing = {
  subtotal: Number(subtotal.toFixed(2)),
  tax: Number(tax.toFixed(2)),
  tip: Number(tip.toFixed(2)),
  shippingAmount: 0,
  discount: 0,
  total: Number(total.toFixed(2)),
  currency: 'USD',
};
```

### Status Management
Follow this typical order lifecycle:
1. Order created → 'pending'
2. Restaurant confirms → 'confirmed'
3. Kitchen starts → 'preparing'
4. Food ready → 'ready'
5. For delivery → 'out_for_delivery'
6. Complete → 'completed'

## Troubleshooting

### Problem: Missing required customer ID

**Error:**
```
ValidationError: customerId is required
```

**Solution:**
Ensure you provide a valid customer ID:
```typescript
const order = await client.menuOrders.create({
  customerId: 'cust_123', // Required
  // ... other fields
});
```

### Problem: Invalid pricing calculation

**Error:**
```
ValidationError: pricing.total does not match sum of components
```

**Solution:**
Verify your pricing calculation:
```typescript
const pricing = {
  subtotal: 25.98,
  tax: 2.60,
  tip: 5.00,
  shippingAmount: 0,
  discount: 0,
  total: 33.58, // Must equal subtotal + tax + tip + shippingAmount - discount
  currency: 'USD',
};
```

### Problem: Item not found when creating order

**Error:**
```
NotFoundError: Menu item not found
```

**Solution:**
Verify the menu item exists and is active:
```typescript
const item = await client.menus.getItem('item_123');
if (!item.isActive || !item.isAvailable) {
  throw new Error('Item is not available for ordering');
}
```

### Problem: Invalid order type

**Error:**
```
ValidationError: Invalid order type
```

**Solution:**
Use the MenuOrderType enum values:
```typescript
import { MenuOrderType } from 'wiil-js';

const order = await client.menuOrders.create({
  type: MenuOrderType.DINE_IN, // or TAKEOUT, DELIVERY
  // ... other fields
});
```
