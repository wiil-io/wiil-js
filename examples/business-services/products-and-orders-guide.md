# Product Management Guide

This guide covers managing product catalogs and retail orders using the WIIL Platform JS SDK.

## Quick Start

```typescript
import { WiilClient, OrderStatus, PaymentStatus } from 'wiil-js';

const client = new WiilClient({
  apiKey: 'your-api-key',
});

// Create a product category
const category = await client.products.createCategory({
  name: 'Electronics',
  description: 'Electronic devices and accessories',
});

// Create a product
const product = await client.products.create({
  name: 'Wireless Mouse',
  description: 'Ergonomic wireless mouse with 6 buttons',
  price: 29.99,
  sku: 'WM-2024-BLK',
  barcode: '123456789012',
  categoryId: category.id,
  brand: 'TechBrand',
  trackInventory: true,
  stockQuantity: 150,
  lowStockThreshold: 20,
  weight: 0.25,
  dimensions: {
    length: 4.5,
    width: 2.8,
    height: 1.6,
    unit: 'inches',
  },
  isActive: true,
});

// Create an order
const order = await client.productOrders.create({
  items: [
    {
      productId: product.id,
      itemName: product.name,
      sku: product.sku,
      quantity: 2,
      unitPrice: product.price,
      totalPrice: product.price * 2,
    },
  ],
  customerId: 'cust_123',
  pricing: {
    subtotal: 59.98,
    tax: 4.80,
    shippingAmount: 9.99,
    total: 74.77,
  },
  orderDate: Date.now(),
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  },
  source: 'web',
});
```

## Product Categories

### Category Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| description | string | No | Category description |
| displayOrder | number | No | Display order for sorting |

### Create Category

```typescript
const category = await client.products.createCategory({
  name: 'Electronics',
  description: 'Electronic devices and accessories',
  displayOrder: 1,
});

console.log('Category created:', category.id);
```

### Get Category

```typescript
const category = await client.products.getCategory('category_123');

console.log('Category:', category.name);
```

### List Categories

```typescript
const result = await client.products.listCategories({
  page: 1,
  pageSize: 20,
});

console.log('Categories:', result.data.length);
console.log('Total:', result.meta.totalCount);
```

### Update Category

```typescript
const updated = await client.products.updateCategory({
  id: 'category_123',
  name: 'Premium Electronics',
  description: 'High-end electronic devices',
});

console.log('Category updated:', updated.name);
```

### Delete Category

```typescript
const deleted = await client.products.deleteCategory('category_123');

console.log('Deleted:', deleted);
```

## Products

### Product Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| description | string | No | Product description |
| price | number | Yes | Product price |
| categoryId | string | No | Category ID |
| sku | string | No | Stock Keeping Unit identifier |
| barcode | string | No | Product barcode |
| brand | string | No | Brand name |
| trackInventory | boolean | No | Track inventory (default: false) |
| stockQuantity | number | No | Current stock quantity |
| lowStockThreshold | number | No | Low stock alert threshold |
| weight | number | No | Product weight |
| dimensions | object | No | Dimensions (length, width, height, unit) |
| isActive | boolean | No | Available for sale (default: true) |

### Create Product

```typescript
const product = await client.products.create({
  name: 'Wireless Headphones',
  description: 'Premium noise-canceling wireless headphones',
  price: 199.99,
  sku: 'WH-2024-BLK',
  barcode: '987654321098',
  categoryId: 'category_electronics',
  brand: 'AudioBrand',
  trackInventory: true,
  stockQuantity: 75,
  lowStockThreshold: 15,
  weight: 0.5,
  dimensions: {
    length: 8.0,
    width: 7.0,
    height: 3.5,
    unit: 'inches',
  },
  isActive: true,
});

console.log('Product created:', product.id);
```

### Get Product

```typescript
const product = await client.products.get('product_123');

console.log('Product:', product.name);
console.log('Price:', product.price);
console.log('Stock:', product.stockQuantity);
```

### Get Product by SKU

```typescript
const product = await client.products.getBySku('WH-2024-BLK');

console.log('Found product:', product.name);
```

### Get Product by Barcode

```typescript
const product = await client.products.getByBarcode('987654321098');

console.log('Found product:', product.name);
```

### List Products

```typescript
const result = await client.products.list({
  page: 1,
  pageSize: 50,
  includeDeleted: false,
});

console.log('Products:', result.data.length);
console.log('Total:', result.meta.totalCount);
```

### Get Products by Category

```typescript
const result = await client.products.getByCategory('category_electronics', {
  page: 1,
  pageSize: 20,
});

console.log('Products in category:', result.data.length);
```

### Search Products

```typescript
const result = await client.products.search('wireless', {
  page: 1,
  pageSize: 20,
});

console.log('Search results:', result.data.length);
result.data.forEach(product => {
  console.log('-', product.name);
});
```

### Update Product

```typescript
const updated = await client.products.update({
  id: 'product_123',
  price: 179.99,
  stockQuantity: 100,
  isActive: true,
});

console.log('Product updated:', updated.name);
console.log('New price:', updated.price);
```

### Delete Product

```typescript
const deleted = await client.products.delete('product_123');

console.log('Deleted:', deleted);
```

## Product Orders

### Order Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | array | Yes | Order items (see Item Schema below) |
| customerId | string | Yes | Customer ID |
| pricing | object | Yes | Pricing breakdown (subtotal, tax, tip, shippingAmount, discount, total, currency) |
| orderDate | number | Yes | Order date (Unix timestamp) |
| paymentStatus | string | No | Payment status (default: 'pending') |
| paymentMethod | string | No | Payment method |
| paymentReference | string | No | Payment reference number |
| billingAddress | object | No | Billing address |
| shippingAddress | object | No | Shipping address |
| shippingMethod | string | No | Shipping method (Standard, Express, etc.) |
| trackingNumber | string | No | Shipment tracking number |
| shippingCarrier | string | No | Shipping carrier (UPS, FedEx, USPS, etc.) |
| requestedDeliveryDate | number | No | Requested delivery date |
| externalOrderId | string | No | External order ID |
| source | string | No | Order source (default: 'direct') |
| notes | string | No | Additional notes |

### Order Item Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | string | Yes | Product ID |
| itemName | string | Yes | Product name |
| sku | string | No | Product SKU |
| quantity | number | Yes | Quantity ordered |
| unitPrice | number | Yes | Price per unit |
| totalPrice | number | Yes | Total price for this item |
| selectedVariant | string | No | Selected variant (size, color, etc.) |
| warrantyInfo | string | No | Warranty information |
| notes | string | No | Additional notes |

Note: Status defaults to 'pending' and should not be included in create requests.

### Create Order

```typescript
const order = await client.productOrders.create({
  items: [
    {
      productId: 'prod_123',
      itemName: 'Wireless Headphones',
      sku: 'WH-2024-BLK',
      quantity: 2,
      unitPrice: 79.99,
      totalPrice: 159.98,
      selectedVariant: 'Black',
      warrantyInfo: '1-year manufacturer warranty',
    },
    {
      productId: 'prod_456',
      itemName: 'Phone Case',
      sku: 'PC-2024-CLR',
      quantity: 1,
      unitPrice: 19.99,
      totalPrice: 19.99,
    },
  ],
  customerId: 'cust_789',
  pricing: {
    subtotal: 179.97,
    tax: 14.40,
    shippingAmount: 9.99,
    total: 204.36,
    currency: 'USD',
  },
  paymentMethod: 'credit_card',
  billingAddress: {
    street: '123 Billing Ave',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
  },
  orderDate: Date.now(),
  requestedDeliveryDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
  shippingAddress: {
    street: '456 Delivery St',
    city: 'Brooklyn',
    state: 'NY',
    postalCode: '11201',
    country: 'US',
    deliveryInstructions: 'Leave at front door',
  },
  shippingMethod: 'Standard',
  source: 'web',
});

console.log('Order created:', order.id);
console.log('Order number:', order.orderNumber);
```

### Create Order with Tracking

```typescript
const order = await client.productOrders.create({
  items: [
    {
      productId: 'prod_999',
      itemName: 'Laptop Computer',
      sku: 'LT-2024-15',
      quantity: 1,
      unitPrice: 1299.99,
      totalPrice: 1299.99,
      selectedVariant: '15-inch/16GB RAM',
      warrantyInfo: '3-year extended warranty',
    },
  ],
  customerId: 'cust_456',
  pricing: {
    subtotal: 1299.99,
    tax: 104.00,
    discount: 100.00,
    total: 1303.99,
  },
  paymentStatus: PaymentStatus.PAID,
  paymentMethod: 'paypal',
  paymentReference: 'PP-2024-XYZ789',
  orderDate: Date.now(),
  shippingAddress: {
    street: '789 Tech Blvd',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94102',
    country: 'US',
  },
  shippingMethod: 'Express',
  trackingNumber: '1Z999AA1234567890',
  shippingCarrier: 'UPS',
  externalOrderId: 'SHOP-2024-999',
  source: 'marketplace',
});

console.log('Order created:', order.id);
console.log('Tracking:', order.trackingNumber);
```

### Get Order

```typescript
const order = await client.productOrders.get('order_123');

console.log('Order:', order.orderNumber);
console.log('Status:', order.status);
console.log('Items:', order.items.length);
console.log('Tracking:', order.trackingNumber);
```

### Get Orders by Customer

```typescript
const result = await client.productOrders.getByCustomer('cust_456', {
  page: 1,
  pageSize: 20,
});

console.log('Customer orders:', result.data.length);
result.data.forEach(order => {
  console.log('-', order.orderNumber, order.status);
});
```

### Update Order

```typescript
const updated = await client.productOrders.update({
  id: 'order_123',
  status: OrderStatus.PREPARING,
  shippingCarrier: 'FedEx',
  trackingNumber: '1234567890',
  notes: 'Rush order - process immediately',
});

console.log('Order updated:', updated.status);
console.log('Tracking:', updated.trackingNumber);
```

### Update Order Status

```typescript
const updated = await client.productOrders.updateStatus('order_123', {
  status: OrderStatus.OUT_FOR_DELIVERY,
});

console.log('Status updated:', updated.status);
console.log('Shipped:', updated.shippedDate);
```

### Cancel Order

```typescript
const cancelled = await client.productOrders.cancel('order_123', {
  reason: 'Customer requested cancellation',
});

console.log('Order cancelled:', cancelled.status);
console.log('Reason:', cancelled.cancelReason);
console.log('Payment status:', cancelled.paymentStatus);
```

### Delete Order

```typescript
const deleted = await client.productOrders.delete('order_123');

console.log('Deleted:', deleted);
```

### List Orders

```typescript
const result = await client.productOrders.list({
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

## Complete Example: Electronics Store Setup

```typescript
import { WiilClient, OrderStatus, PaymentStatus } from 'wiil-js';

async function setupElectronicsStore() {
  const client = new WiilClient({
    apiKey: process.env.WIIL_API_KEY!,
  });

  // 1. Create product categories
  const computers = await client.products.createCategory({
    name: 'Computers',
    description: 'Laptops, desktops, and accessories',
    displayOrder: 1,
  });

  const accessories = await client.products.createCategory({
    name: 'Accessories',
    description: 'Computer peripherals and accessories',
    displayOrder: 2,
  });

  // 2. Create products
  const laptop = await client.products.create({
    name: 'Pro Laptop 15"',
    description: '15-inch laptop with 16GB RAM and 512GB SSD',
    price: 1299.99,
    sku: 'LT-PRO-15-2024',
    barcode: '123456789012',
    categoryId: computers.id,
    brand: 'TechBrand',
    trackInventory: true,
    stockQuantity: 25,
    lowStockThreshold: 5,
    weight: 4.5,
    dimensions: {
      length: 14.0,
      width: 9.5,
      height: 0.7,
      unit: 'inches',
    },
    isActive: true,
  });

  const mouse = await client.products.create({
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 29.99,
    sku: 'MS-WL-BLK-2024',
    barcode: '987654321098',
    categoryId: accessories.id,
    brand: 'TechBrand',
    trackInventory: true,
    stockQuantity: 150,
    lowStockThreshold: 20,
    weight: 0.25,
    dimensions: {
      length: 4.5,
      width: 2.8,
      height: 1.6,
      unit: 'inches',
    },
    isActive: true,
  });

  const keyboard = await client.products.create({
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with blue switches',
    price: 89.99,
    sku: 'KB-MEC-RGB-2024',
    barcode: '456789012345',
    categoryId: accessories.id,
    brand: 'TechBrand',
    trackInventory: true,
    stockQuantity: 60,
    lowStockThreshold: 10,
    weight: 2.1,
    dimensions: {
      length: 17.5,
      width: 5.2,
      height: 1.3,
      unit: 'inches',
    },
    isActive: true,
  });

  // 3. Process a customer order
  const order = await client.productOrders.create({
    items: [
      {
        productId: laptop.id,
        itemName: laptop.name,
        sku: laptop.sku,
        quantity: 1,
        unitPrice: laptop.price,
        totalPrice: laptop.price,
        selectedVariant: 'Silver',
        warrantyInfo: '2-year extended warranty included',
      },
      {
        productId: mouse.id,
        itemName: mouse.name,
        sku: mouse.sku,
        quantity: 1,
        unitPrice: mouse.price,
        totalPrice: mouse.price,
        selectedVariant: 'Black',
      },
      {
        productId: keyboard.id,
        itemName: keyboard.name,
        sku: keyboard.sku,
        quantity: 1,
        unitPrice: keyboard.price,
        totalPrice: keyboard.price,
        selectedVariant: 'RGB',
      },
    ],
    customerId: 'cust_123',
    pricing: {
      subtotal: 1419.97,
      tax: 113.60,
      shippingAmount: 15.00,
      discount: 50.00,
      total: 1498.57,
      currency: 'USD',
    },
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: 'credit_card',
    paymentReference: 'CC-2024-ABC123',
    billingAddress: {
      street: '100 Main Street',
      street2: 'Suite 200',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    },
    orderDate: Date.now(),
    requestedDeliveryDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    shippingAddress: {
      street: '200 Work Plaza',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
      deliveryInstructions: 'Reception desk on 2nd floor',
    },
    shippingMethod: 'Express',
    source: 'web',
  });

  console.log('Order created:', order.orderNumber);

  // 4. Update order through fulfillment lifecycle
  await client.productOrders.updateStatus(order.id, {
    status: OrderStatus.CONFIRMED,
  });

  await client.productOrders.updateStatus(order.id, {
    status: OrderStatus.PREPARING,
  });

  await client.productOrders.update({
    id: order.id,
    status: OrderStatus.OUT_FOR_DELIVERY,
    trackingNumber: '1Z999AA10123456789',
    shippingCarrier: 'UPS',
  });

  // 5. Complete the order
  await client.productOrders.updateStatus(order.id, {
    status: OrderStatus.COMPLETED,
  });

  // 6. Check inventory levels
  const lowStockProducts = await client.products.list();
  const needsRestock = lowStockProducts.data.filter(
    p => p.trackInventory && p.stockQuantity! <= p.lowStockThreshold!
  );

  console.log('Products needing restock:', needsRestock.length);
  needsRestock.forEach(product => {
    console.log('-', product.name, 'Stock:', product.stockQuantity);
  });
}
```

## Best Practices

### Product Management
- Use SKUs and barcodes for easier inventory tracking
- Set low stock thresholds to get alerts before running out
- Include accurate dimensions and weight for shipping calculations
- Keep product descriptions clear and informative
- Use categories to organize your catalog effectively

### Inventory Tracking
```typescript
// Enable inventory tracking for physical products
const product = await client.products.create({
  name: 'Physical Product',
  price: 49.99,
  trackInventory: true,
  stockQuantity: 100,
  lowStockThreshold: 20,
  // ... other fields
});

// Disable tracking for digital products or services
const digital = await client.products.create({
  name: 'Digital Download',
  price: 9.99,
  trackInventory: false,
  // ... other fields
});
```

### Order Processing
- Always validate product availability before creating orders
- Include shipping and billing addresses for physical products
- Use tracking numbers to help customers monitor deliveries
- Set realistic delivery dates
- Include payment references for reconciliation

### Pricing Calculations
```typescript
const items = [
  { price: 79.99, quantity: 2 },  // 159.98
  { price: 19.99, quantity: 1 },  // 19.99
];

const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
const tax = subtotal * 0.0875;        // 8.75% tax
const shippingAmount = 9.99;          // Flat rate shipping
const discount = 10.00;               // Promotional discount
const total = subtotal + tax + shippingAmount - discount;

const pricing = {
  subtotal: Number(subtotal.toFixed(2)),
  tax: Number(tax.toFixed(2)),
  shippingAmount: Number(shippingAmount.toFixed(2)),
  discount: Number(discount.toFixed(2)),
  total: Number(total.toFixed(2)),
  currency: 'USD',
};
```

### Status Management
Follow this typical order lifecycle:
1. Order created → 'pending'
2. Payment confirmed → 'confirmed'
3. Warehouse prepares → 'preparing'
4. Items ready → 'ready'
5. Shipped → 'out_for_delivery'
6. Delivered → 'completed'

## Troubleshooting

### Problem: Missing required customer ID

**Error:**
```
ValidationError: customerId is required
```

**Solution:**
Ensure you provide a valid customer ID:
```typescript
const order = await client.productOrders.create({
  customerId: 'cust_123', // Required
  // ... other fields
});
```

### Problem: Product not found by SKU

**Error:**
```
NotFoundError: Product not found
```

**Solution:**
Verify the SKU exists and is spelled correctly:
```typescript
try {
  const product = await client.products.getBySku('WM-2024-BLK');
} catch (error) {
  console.error('Product not found. Check SKU:', error);
}
```

### Problem: Inventory tracking not working

**Error:**
Product stock not updating after orders

**Solution:**
Ensure trackInventory is enabled:
```typescript
const product = await client.products.update({
  id: 'product_123',
  trackInventory: true,
  stockQuantity: 100,
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
  subtotal: 179.97,
  tax: 14.40,
  shippingAmount: 9.99,
  discount: 0,
  total: 204.36, // Must equal subtotal + tax + shippingAmount - discount
  currency: 'USD',
};
```

### Problem: Dimensions not saving

**Error:**
Dimensions field appears empty

**Solution:**
Ensure you include the unit field:
```typescript
const product = await client.products.create({
  name: 'Product',
  price: 99.99,
  dimensions: {
    length: 10.5,
    width: 8.2,
    height: 3.1,
    unit: 'inches', // Required: 'cm' or 'inches'
  },
  // ... other fields
});
```
