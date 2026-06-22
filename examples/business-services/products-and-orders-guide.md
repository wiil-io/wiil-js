# Product Management Guide

**Manage product catalogs and retail orders using the WIIL Platform JS SDK**

**Setup Time**: ~15 minutes

---

## Overview

The Product Management system provides comprehensive tools for managing product catalogs, variants, and customer orders.

**Key Resources:**
- `client.products` - Categories and products
- `client.productVariants` - Product variations (size, color)
- `client.productVariantAxes` - Define variation axes
- `client.productOrders` - Customer orders

---

## Prerequisites

1. Active WIIL Platform account
2. API key with business management permissions
3. Node.js project with wiil-js SDK installed

---

## Quick Start

```typescript
import { WiilClient } from 'wiil-js';

const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

// 1. Create a product category
const category = await client.products.createCategory({
  name: 'Electronics',
  description: 'Electronic devices and accessories',
  isDefault: false,
});

// 2. Create a product with required variants
const product = await client.products.create({
  categoryId: category.id,
  name: 'Wireless Mouse',
  description: 'Ergonomic wireless mouse with 6 buttons',
  price: 29.99,
  sku: 'WM-2024-BLK',
  trackInventory: true,
  isActive: true,
  isAlcoholic: false,
  variants: [
    {
      axisValues: {},
      price: 29.99,
      isDefault: true,
      isActive: true,
    },
  ],
});

// 3. Create an order (requires variantId)
const order = await client.productOrders.create({
  customerId: 'cust_123',
  orderDate: Date.now(),
  items: [
    {
      productId: product.id,
      variantId: product.variants[0].id,
      itemName: product.name,
      quantity: 2,
      unitPrice: 29.99,
      totalPrice: 59.98,
    },
  ],
  pricing: {
    subtotal: 59.98,
    total: 59.98,
  },
});

console.log(`Order Created: ${order.id}`);
```

---

## Product Categories

### Create Category

```typescript
const category = await client.products.createCategory({
  name: 'Electronics',
  description: 'Electronic devices and accessories',
  isDefault: false,
});

console.log(`Category Created: ${category.id}`);
```

### Get Category

```typescript
const category = await client.products.getCategory('category_123');

console.log(`Category: ${category.name}`);
```

### List Categories

```typescript
const result = await client.products.listCategories();

console.log(`Categories: ${result.data.length}`);
result.data.forEach(cat => {
  console.log(`- ${cat.name}`);
});
```

### Update Category

```typescript
const updated = await client.products.updateCategory({
  id: 'category_123',
  description: 'Updated description for electronics',
});

console.log(`Updated: ${updated.description}`);
```

### Delete Category

```typescript
await client.products.deleteCategory('category_123');
console.log('Category deleted');
```

### Batch Create Categories

```typescript
const result = await client.products.createCategoryBatch([
  { name: 'Electronics', description: 'Electronic devices', isDefault: false },
  { name: 'Accessories', description: 'Computer peripherals', isDefault: false },
  { name: 'Software', description: 'Digital products', isDefault: false },
]);

console.log(`Created ${result.data.length} categories`);
```

---

## Products

Products **require at least one variant** for pricing.

### Create Product

```typescript
const product = await client.products.create({
  categoryId: 'category_123',
  name: 'Wireless Headphones',
  description: 'Premium noise-canceling wireless headphones',
  price: 199.99,
  sku: 'WH-2024-BLK',
  trackInventory: true,
  isActive: true,
  isAlcoholic: false,
  variants: [
    {
      axisValues: {},
      price: 199.99,
      isDefault: true,
      isActive: true,
    },
  ],
});

console.log(`Product Created: ${product.id}`);
console.log(`Variant ID: ${product.variants[0].id}`);
```

### Create Product with Multiple Variants

```typescript
const tshirt = await client.products.create({
  categoryId: 'category_apparel',
  name: 'Classic T-Shirt',
  description: 'Comfortable cotton t-shirt',
  price: 24.99,
  sku: 'TS-CLASSIC',
  trackInventory: true,
  isActive: true,
  isAlcoholic: false,
  variants: [
    {
      axisValues: { Size: 'Small', Color: 'Black' },
      price: 24.99,
      isDefault: true,
      isActive: true,
    },
    {
      axisValues: { Size: 'Medium', Color: 'Black' },
      price: 24.99,
      isDefault: false,
      isActive: true,
    },
    {
      axisValues: { Size: 'Large', Color: 'Black' },
      price: 26.99,
      isDefault: false,
      isActive: true,
    },
  ],
});

console.log(`Created product with ${tshirt.variants.length} variants`);
```

### Get Product

```typescript
const product = await client.products.get('product_123');

console.log(`Product: ${product.name}`);
console.log(`Price: $${product.price}`);
console.log(`Variants: ${product.variants?.length}`);
```

### List Products

```typescript
const result = await client.products.list();

console.log(`Products: ${result.data.length}`);
```

### Update Product

```typescript
const updated = await client.products.update({
  id: 'product_123',
  price: 179.99,
});

console.log(`Updated price: $${updated.price}`);
```

### Delete Product

```typescript
await client.products.delete('product_123');
console.log('Product deleted');
```

### Batch Create Products

```typescript
const result = await client.products.createBatch([
  {
    categoryId: 'cat_accessories',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 29.99,
    sku: 'WM-001',
    trackInventory: true,
    isActive: true,
    isAlcoholic: false,
    variants: [{ axisValues: {}, price: 29.99, isDefault: true, isActive: true }],
  },
  {
    categoryId: 'cat_accessories',
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard',
    price: 89.99,
    sku: 'KB-001',
    trackInventory: true,
    isActive: true,
    isAlcoholic: false,
    variants: [{ axisValues: {}, price: 89.99, isDefault: true, isActive: true }],
  },
]);

console.log(`Created ${result.data.length} products`);
```

---

## Product Variants

Manage product variations separately.

### Create Variant

```typescript
const variant = await client.productVariants.create({
  productId: 'product_123',
  axisValues: { Size: 'Extra Large', Color: 'Blue' },
  sku: 'TS-XL-BL',
  price: 29.99,
  isDefault: false,
  isActive: true,
});

console.log(`Variant Created: ${variant.id}`);
```

### Get Variant

```typescript
const variant = await client.productVariants.get('variant_123');

console.log(`Variant: ${variant.sku} - $${variant.price}`);
console.log(`Axis Values: ${JSON.stringify(variant.axisValues)}`);
```

### Get Variant by SKU

```typescript
const variant = await client.productVariants.getBySku('TS-XL-BL');

if (variant) {
  console.log(`Found: ${variant.sku} - $${variant.price}`);
}
```

### Get Default Variant

```typescript
const defaultVariant = await client.productVariants.getDefault('product_123');

if (defaultVariant) {
  console.log(`Default: ${defaultVariant.sku} - $${defaultVariant.price}`);
}
```

### Update Variant

```typescript
const updated = await client.productVariants.update('variant_123', {
  id: 'variant_123',
  price: 32.99,
  isActive: true,
});

console.log(`Updated price: $${updated.price}`);
```

### Delete Variant

```typescript
await client.productVariants.delete('variant_123');
console.log('Variant deleted');
```

### Batch Create Variants

```typescript
const result = await client.productVariants.createBatch([
  {
    productId: 'product_123',
    axisValues: { Size: 'Medium', Color: 'Red' },
    sku: 'TS-MD-RD',
    price: 24.99,
    isDefault: false,
    isActive: true,
  },
  {
    productId: 'product_123',
    axisValues: { Size: 'Large', Color: 'Green' },
    sku: 'TS-LG-GN',
    price: 26.99,
    isDefault: false,
    isActive: true,
  },
]);

console.log(`Created ${result.data.length} variants`);
```

---

## Variant Axes

Define the axes for product variations (Size, Color, Material, etc.).

### Create Axis

```typescript
import { VariantAxisType } from 'wiil-core-js';

const sizeAxis = await client.productVariantAxes.create({
  name: 'Size',
  type: VariantAxisType.TEXT,
  values: [
    { id: 'sm', label: 'Small', sortOrder: 0 },
    { id: 'md', label: 'Medium', sortOrder: 1 },
    { id: 'lg', label: 'Large', sortOrder: 2 },
    { id: 'xl', label: 'Extra Large', sortOrder: 3 },
  ],
  isActive: true,
});

console.log(`Axis Created: ${sizeAxis.id}`);
```

### Create Color Axis with Swatches

```typescript
import { VariantAxisType } from 'wiil-core-js';

const colorAxis = await client.productVariantAxes.create({
  name: 'Color',
  type: VariantAxisType.SWATCH,
  values: [
    { id: 'black', label: 'Black', swatchColor: '#000000', sortOrder: 0 },
    { id: 'white', label: 'White', swatchColor: '#FFFFFF', sortOrder: 1 },
    { id: 'red', label: 'Red', swatchColor: '#FF0000', sortOrder: 2 },
    { id: 'blue', label: 'Blue', swatchColor: '#0000FF', sortOrder: 3 },
  ],
  isActive: true,
});

console.log(`Color Axis Created: ${colorAxis.id}`);
```

### Get Axis

```typescript
const axis = await client.productVariantAxes.get('axis_123');

console.log(`Axis: ${axis.name}`);
console.log(`Type: ${axis.type}`);
console.log(`Values: ${axis.values.length}`);
```

### Get Axis by Name

```typescript
const axis = await client.productVariantAxes.getByName('Size');

if (axis) {
  console.log(`Found: ${axis.name} with ${axis.values.length} values`);
}
```

### List Axes

```typescript
const result = await client.productVariantAxes.list();

console.log(`Axes: ${result.data.length}`);
result.data.forEach(axis => {
  console.log(`- ${axis.name} (${axis.type}): ${axis.values.length} values`);
});
```

### Update Axis

```typescript
const updated = await client.productVariantAxes.update('axis_123', {
  id: 'axis_123',
  values: [
    { id: 'xs', label: 'Extra Small', sortOrder: 0 },
    { id: 'sm', label: 'Small', sortOrder: 1 },
    { id: 'md', label: 'Medium', sortOrder: 2 },
    { id: 'lg', label: 'Large', sortOrder: 3 },
    { id: 'xl', label: 'Extra Large', sortOrder: 4 },
  ],
});

console.log(`Updated: ${updated.values.length} values`);
```

### Delete Axis

```typescript
await client.productVariantAxes.delete('axis_123');
console.log('Axis deleted');
```

### Batch Create Axes

```typescript
import { VariantAxisType } from 'wiil-core-js';

const result = await client.productVariantAxes.createBatch([
  {
    name: 'Material',
    type: VariantAxisType.TEXT,
    values: [
      { id: 'cotton', label: 'Cotton', sortOrder: 0 },
      { id: 'polyester', label: 'Polyester', sortOrder: 1 },
    ],
    isActive: true,
  },
  {
    name: 'Style',
    type: VariantAxisType.TEXT,
    values: [
      { id: 'slim', label: 'Slim Fit', sortOrder: 0 },
      { id: 'regular', label: 'Regular Fit', sortOrder: 1 },
    ],
    isActive: true,
  },
]);

console.log(`Created ${result.data.length} axes`);
```

---

## Product Orders

### Create Order

```typescript
const order = await client.productOrders.create({
  customerId: 'cust_456',
  orderDate: Date.now(),
  items: [
    {
      productId: 'product_123',
      variantId: 'variant_456',
      itemName: 'Wireless Headphones',
      quantity: 1,
      unitPrice: 199.99,
      totalPrice: 199.99,
    },
  ],
  pricing: {
    subtotal: 199.99,
    total: 199.99,
  },
});

console.log(`Order Created: ${order.id}`);
```

### Get Order

```typescript
const order = await client.productOrders.get('order_123');

console.log(`Order: ${order.id}`);
console.log(`Status: ${order.status}`);
console.log(`Total: $${order.pricing.total}`);
```

### List Orders

```typescript
const result = await client.productOrders.list();

console.log(`Orders: ${result.data.length}`);
result.data.forEach(order => {
  console.log(`- ${order.id}: ${order.status} ($${order.pricing.total})`);
});
```

### Update Order

```typescript
const updated = await client.productOrders.update({
  id: 'order_123',
  pricing: {
    subtotal: 180.00,
    total: 180.00,
  },
});

console.log(`Updated total: $${updated.pricing.total}`);
```

### Update Order Status

```typescript
import { OrderStatus } from 'wiil-core-js';

const updated = await client.productOrders.updateStatus('order_123', {
  id: 'order_123',
  status: OrderStatus.CONFIRMED,
});

console.log(`Status: ${updated.status}`);
```

### Cancel Order

```typescript
const cancelled = await client.productOrders.cancel('order_123', {
  cancelReason: 'Customer requested cancellation',
});

console.log(`Status: ${cancelled.status}`);
```

### Delete Order

```typescript
await client.productOrders.delete('order_123');
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

### Variant Axis Type

```typescript
import { VariantAxisType } from 'wiil-core-js';

// VariantAxisType.TEXT   - Text-based values (Size: Small, Medium, Large)
// VariantAxisType.SWATCH - Color swatches with hex codes
```

---

## Complete Example: Electronics Store

```typescript
import { WiilClient } from 'wiil-js';
import { OrderStatus, VariantAxisType, PreferredContactMethod } from 'wiil-core-js';

async function setupElectronicsStore() {
  const client = new WiilClient({ apiKey: process.env.WIIL_API_KEY! });

  // 1. Create customer
  console.log('Creating customer...');
  const customer = await client.customers.create({
    phone_number: '+15551234567',
    firstname: 'John',
    lastname: 'Doe',
    preferred_language: 'en',
    preferred_contact_method: PreferredContactMethod.EMAIL,
    isValidatedNames: false,
  });
  console.log(`Customer: ${customer.id}`);

  // 2. Create categories
  console.log('\nCreating categories...');
  const computers = await client.products.createCategory({
    name: 'Computers',
    description: 'Laptops and desktops',
    isDefault: false,
  });

  const accessories = await client.products.createCategory({
    name: 'Accessories',
    description: 'Computer peripherals',
    isDefault: false,
  });
  console.log('Categories created');

  // 3. Create variant axes
  console.log('\nCreating variant axes...');
  const colorAxis = await client.productVariantAxes.create({
    name: 'Color',
    type: VariantAxisType.SWATCH,
    values: [
      { id: 'black', label: 'Black', swatchColor: '#000000', sortOrder: 0 },
      { id: 'silver', label: 'Silver', swatchColor: '#C0C0C0', sortOrder: 1 },
    ],
    isActive: true,
  });
  console.log(`Color axis: ${colorAxis.id}`);

  // 4. Create products with variants
  console.log('\nCreating products...');
  const laptop = await client.products.create({
    categoryId: computers.id,
    name: 'Pro Laptop 15"',
    description: '15-inch laptop with 16GB RAM',
    price: 1299.99,
    sku: 'LT-PRO-15',
    trackInventory: true,
    isActive: true,
    isAlcoholic: false,
    variants: [
      { axisValues: { Color: 'Black' }, price: 1299.99, isDefault: true, isActive: true },
      { axisValues: { Color: 'Silver' }, price: 1349.99, isDefault: false, isActive: true },
    ],
  });

  const mouse = await client.products.create({
    categoryId: accessories.id,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 29.99,
    sku: 'MS-WL',
    trackInventory: true,
    isActive: true,
    isAlcoholic: false,
    variants: [
      { axisValues: {}, price: 29.99, isDefault: true, isActive: true },
    ],
  });
  console.log('Products created');

  // 5. Create order
  console.log('\nCreating order...');
  const order = await client.productOrders.create({
    customerId: customer.id,
    orderDate: Date.now(),
    items: [
      {
        productId: laptop.id,
        variantId: laptop.variants[0].id,
        itemName: 'Pro Laptop 15" (Black)',
        quantity: 1,
        unitPrice: 1299.99,
        totalPrice: 1299.99,
      },
      {
        productId: mouse.id,
        variantId: mouse.variants[0].id,
        itemName: 'Wireless Mouse',
        quantity: 2,
        unitPrice: 29.99,
        totalPrice: 59.98,
      },
    ],
    pricing: {
      subtotal: 1359.97,
      total: 1359.97,
    },
  });
  console.log(`Order Created: ${order.id}`);

  // 6. Update order status through lifecycle
  console.log('\nProcessing order...');

  await client.productOrders.updateStatus(order.id, {
    id: order.id,
    status: OrderStatus.CONFIRMED,
  });
  console.log('Order confirmed');

  await client.productOrders.updateStatus(order.id, {
    id: order.id,
    status: OrderStatus.PREPARING,
  });
  console.log('Order preparing');

  await client.productOrders.updateStatus(order.id, {
    id: order.id,
    status: OrderStatus.COMPLETED,
  });
  console.log('Order completed');

  return { customer, categories: [computers, accessories], products: [laptop, mouse], order };
}

setupElectronicsStore().catch(console.error);
```

---

## Best Practices

### 1. Always Include Variants

```typescript
// Every product needs at least one variant
const product = await client.products.create({
  categoryId: 'cat_123',
  name: 'Widget',
  price: 19.99,
  sku: 'WGT-001',
  trackInventory: true,
  isActive: true,
  isAlcoholic: false,
  variants: [
    { axisValues: {}, price: 19.99, isDefault: true, isActive: true },
  ],
});
```

### 2. Use variantId in Orders

```typescript
// Order items require variantId
const order = await client.productOrders.create({
  customerId: customer.id,
  orderDate: Date.now(),
  items: [
    {
      productId: product.id,
      variantId: product.variants[0].id,  // Required
      itemName: product.name,
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
    },
  ],
  pricing: { subtotal: product.price, total: product.price },
});
```

### 3. Define Axes for Complex Products

```typescript
// Create axes first, then reference in product variants
const sizeAxis = await client.productVariantAxes.create({
  name: 'Size',
  type: VariantAxisType.TEXT,
  values: [
    { id: 'sm', label: 'Small', sortOrder: 0 },
    { id: 'md', label: 'Medium', sortOrder: 1 },
    { id: 'lg', label: 'Large', sortOrder: 2 },
  ],
  isActive: true,
});

// Reference in product variants
const product = await client.products.create({
  // ...
  variants: [
    { axisValues: { Size: 'Small' }, price: 24.99, isDefault: true, isActive: true },
    { axisValues: { Size: 'Medium' }, price: 24.99, isDefault: false, isActive: true },
    { axisValues: { Size: 'Large' }, price: 26.99, isDefault: false, isActive: true },
  ],
});
```

### 4. Status Progression

```typescript
// Follow the standard order lifecycle
// pending → confirmed → preparing → ready → out_for_delivery → completed
```

---

## Troubleshooting

### Missing variants

**Problem**: "Product must have at least one variant"

**Solution**: Include the `variants` array when creating products:
```typescript
const product = await client.products.create({
  // ... other fields
  variants: [
    { axisValues: {}, price: 29.99, isDefault: true, isActive: true },
  ],
});
```

### Missing variantId in order

**Problem**: "variantId is required for order items"

**Solution**: Include variantId for each order item:
```typescript
const order = await client.productOrders.create({
  items: [
    {
      productId: product.id,
      variantId: product.variants[0].id,  // Required
      // ... other fields
    },
  ],
  // ...
});
```

### Invalid order status update

**Problem**: Status update fails

**Solution**: Include the id field in status update:
```typescript
await client.productOrders.updateStatus(orderId, {
  id: orderId,  // Required
  status: OrderStatus.CONFIRMED,
});
```

---

[Back to Examples](../README.md)
