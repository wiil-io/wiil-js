/**
 * @fileoverview Tests for Product Orders resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { ProductOrder, PaginatedResultType, OrderStatus, PaymentStatus } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProductOrdersResource', () => {
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

  describe('create', () => {
    it('should create a new product order with shipping', async () => {
      const input = {
        status: OrderStatus.PENDING,
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
            status: OrderStatus.PENDING,
          },
          {
            productId: 'prod_456',
            itemName: 'Phone Case',
            sku: 'PC-2024-CLR',
            quantity: 1,
            unitPrice: 19.99,
            totalPrice: 19.99,
            status: OrderStatus.PENDING,
          },
        ],
        customerId: 'cust_789',
        pricing: {
          subtotal: 179.97,
          tax: 14.40,
          tip: 0,
          shippingAmount: 9.99,
          discount: 0,
          total: 204.36,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PENDING,
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
      };

      const mockResponse: ProductOrder = {
        id: 'order_123',
        orderNumber: 'ORD-2024-001',
        status: OrderStatus.PENDING,
        items: [
          {
            id: 'item_1',
            productOrderId: 'order_123',
            productId: 'prod_123',
            itemName: 'Wireless Headphones',
            sku: 'WH-2024-BLK',
            quantity: 2,
            unitPrice: 79.99,
            totalPrice: 159.98,
            selectedVariant: 'Black',
            warrantyInfo: '1-year manufacturer warranty',
            status: OrderStatus.PENDING,
          },
          {
            id: 'item_2',
            productOrderId: 'order_123',
            productId: 'prod_456',
            itemName: 'Phone Case',
            sku: 'PC-2024-CLR',
            quantity: 1,
            unitPrice: 19.99,
            totalPrice: 19.99,
            status: OrderStatus.PENDING,
          },
        ],
        customerId: 'cust_789',
        customer: {
          name: 'John Doe',
          phone: '+12125551234',
          email: 'john@example.com',
        },
        pricing: {
          subtotal: 179.97,
          tax: 14.40,
          tip: 0,
          shippingAmount: 9.99,
          discount: 0,
          total: 204.36,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PENDING,
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-orders', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.create(input);

      expect(result.id).toBe('order_123');
      expect(result.orderNumber).toBe('ORD-2024-001');
      expect(result.items).toHaveLength(2);
      expect(result.items[0].itemName).toBe('Wireless Headphones');
      expect(result.items[0].quantity).toBe(2);
      expect(result.pricing.total).toBe(204.36);
      expect(result.shippingMethod).toBe('Standard');
    });

    it('should create a product order with tracking information', async () => {
      const input = {
        status: OrderStatus.PREPARING,
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
            status: OrderStatus.PREPARING,
          },
        ],
        customerId: 'cust_456',
        pricing: {
          subtotal: 1299.99,
          tax: 104.00,
          tip: 0,
          shippingAmount: 0,
          discount: 100.00,
          total: 1303.99,
          currency: 'USD',
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
      };

      const mockResponse: ProductOrder = {
        id: 'order_999',
        orderNumber: 'ORD-2024-999',
        status: OrderStatus.PREPARING,
        items: [
          {
            id: 'item_999',
            productOrderId: 'order_999',
            productId: 'prod_999',
            itemName: 'Laptop Computer',
            sku: 'LT-2024-15',
            quantity: 1,
            unitPrice: 1299.99,
            totalPrice: 1299.99,
            selectedVariant: '15-inch/16GB RAM',
            warrantyInfo: '3-year extended warranty',
            status: OrderStatus.PREPARING,
          },
        ],
        customerId: 'cust_456',
        pricing: {
          subtotal: 1299.99,
          tax: 104.00,
          tip: 0,
          shippingAmount: 0,
          discount: 100.00,
          total: 1303.99,
          currency: 'USD',
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-orders', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.create(input);

      expect(result.trackingNumber).toBe('1Z999AA1234567890');
      expect(result.shippingCarrier).toBe('UPS');
      expect(result.externalOrderId).toBe('SHOP-2024-999');
      expect(result.paymentReference).toBe('PP-2024-XYZ789');
    });
  });

  describe('get', () => {
    it('should retrieve a product order by ID', async () => {
      const mockResponse: ProductOrder = {
        id: 'order_123',
        orderNumber: 'ORD-2024-001',
        status: OrderStatus.OUT_FOR_DELIVERY,
        items: [
          {
            id: 'item_1',
            productOrderId: 'order_123',
            productId: 'prod_123',
            itemName: 'Smart Watch',
            sku: 'SW-2024-BLK',
            quantity: 1,
            unitPrice: 299.99,
            totalPrice: 299.99,
            status: OrderStatus.OUT_FOR_DELIVERY,
          },
        ],
        customerId: 'cust_456',
        pricing: {
          subtotal: 299.99,
          tax: 24.00,
          tip: 0,
          shippingAmount: 5.99,
          discount: 0,
          total: 329.98,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PAID,
        orderDate: Date.now(),
        shippedDate: Date.now(),
        shippingAddress: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          postalCode: '02101',
          country: 'US',
        },
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/product-orders/order_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.get('order_123');

      expect(result.id).toBe('order_123');
      expect(result.status).toBe(OrderStatus.OUT_FOR_DELIVERY);
      expect(result.shippedDate).toBeDefined();
      expect(result.items[0].itemName).toBe('Smart Watch');
    });

    it('should throw API error when order not found', async () => {
      nock(BASE_URL)
        .get('/product-orders/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product order not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productOrders.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve product orders by customer ID', async () => {
      const mockOrders: ProductOrder[] = [
        {
          id: 'order_1',
          orderNumber: 'ORD-2024-001',
          status: OrderStatus.COMPLETED,
          items: [
            {
              id: 'item_1',
              productOrderId: 'order_1',
              productId: 'prod_123',
              itemName: 'Product A',
              quantity: 1,
              unitPrice: 50.00,
              totalPrice: 50.00,
              status: OrderStatus.COMPLETED,
            },
          ],
          customerId: 'cust_456',
          pricing: { subtotal: 50.00, tax: 4.00, tip: 0, shippingAmount: 5.00, discount: 0, total: 59.00, currency: 'USD' },
          paymentStatus: PaymentStatus.PAID,
          orderDate: Date.now(),
          deliveredDate: Date.now(),
          source: 'direct',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'order_2',
          orderNumber: 'ORD-2024-002',
          status: OrderStatus.PREPARING,
          items: [
            {
              id: 'item_2',
              productOrderId: 'order_2',
              productId: 'prod_456',
              itemName: 'Product B',
              quantity: 2,
              unitPrice: 30.00,
              totalPrice: 60.00,
              status: OrderStatus.PREPARING,
            },
          ],
          customerId: 'cust_456',
          pricing: { subtotal: 60.00, tax: 4.80, tip: 0, shippingAmount: 5.00, discount: 0, total: 69.80, currency: 'USD' },
          paymentStatus: PaymentStatus.PAID,
          orderDate: Date.now(),
          source: 'direct',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductOrder> = {
        data: mockOrders,
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
        .get('/product-orders/by-customer/cust_456')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.getByCustomer('cust_456');

      expect(result.data).toHaveLength(2);
      expect(result.data.every(order => order.customerId === 'cust_456')).toBe(true);
      expect(result.data[0].status).toBe(OrderStatus.COMPLETED);
    });

    it('should get customer orders with pagination', async () => {
      const mockResponse: PaginatedResultType<ProductOrder> = {
        data: [],
        meta: {
          page: 2,
          pageSize: 10,
          totalCount: 25,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-orders/by-customer/cust_789')
        .query({ page: '2', pageSize: '10' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.getByCustomer('cust_789', {
        page: 2,
        pageSize: 10,
      });

      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a product order', async () => {
      const updateData = {
        id: 'order_123',
        status: OrderStatus.PREPARING,
        shippingCarrier: 'FedEx',
        trackingNumber: '1234567890',
        notes: 'Rush order - process immediately',
      };

      const mockResponse: ProductOrder = {
        id: 'order_123',
        orderNumber: 'ORD-2024-001',
        status: OrderStatus.PREPARING,
        items: [
          {
            id: 'item_1',
            productOrderId: 'order_123',
            productId: 'prod_123',
            itemName: 'Product',
            quantity: 1,
            unitPrice: 100.00,
            totalPrice: 100.00,
            status: OrderStatus.PREPARING,
          },
        ],
        customerId: 'cust_456',
        pricing: { subtotal: 100.00, tax: 8.00, tip: 0, shippingAmount: 10.00, discount: 0, total: 118.00, currency: 'USD' },
        paymentStatus: PaymentStatus.PAID,
        orderDate: Date.now(),
        shippingCarrier: 'FedEx',
        trackingNumber: '1234567890',
        notes: 'Rush order - process immediately',
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-orders', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.update(updateData);

      expect(result.status).toBe(OrderStatus.PREPARING);
      expect(result.shippingCarrier).toBe('FedEx');
      expect(result.trackingNumber).toBe('1234567890');
      expect(result.notes).toBe('Rush order - process immediately');
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const mockResponse: ProductOrder = {
        id: 'order_123',
        orderNumber: 'ORD-2024-001',
        status: OrderStatus.OUT_FOR_DELIVERY,
        items: [
          {
            id: 'item_1',
            productOrderId: 'order_123',
            productId: 'prod_123',
            itemName: 'Product',
            quantity: 1,
            unitPrice: 100.00,
            totalPrice: 100.00,
            status: OrderStatus.OUT_FOR_DELIVERY,
          },
        ],
        customerId: 'cust_456',
        pricing: { subtotal: 100.00, tax: 8.00, tip: 0, shippingAmount: 10.00, discount: 0, total: 118.00, currency: 'USD' },
        paymentStatus: PaymentStatus.PAID,
        orderDate: Date.now(),
        shippedDate: Date.now(),
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/product-orders/order_123/status', { status: OrderStatus.OUT_FOR_DELIVERY })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.updateStatus('order_123', { status: OrderStatus.OUT_FOR_DELIVERY });

      expect(result.status).toBe(OrderStatus.OUT_FOR_DELIVERY);
      expect(result.shippedDate).toBeDefined();
    });
  });

  describe('cancel', () => {
    it('should cancel an order with reason', async () => {
      const mockResponse: ProductOrder = {
        id: 'order_123',
        orderNumber: 'ORD-2024-001',
        status: OrderStatus.CANCELLED,
        items: [
          {
            id: 'item_1',
            productOrderId: 'order_123',
            productId: 'prod_123',
            itemName: 'Product',
            quantity: 1,
            unitPrice: 100.00,
            totalPrice: 100.00,
            status: OrderStatus.CANCELLED,
          },
        ],
        customerId: 'cust_456',
        pricing: { subtotal: 100.00, tax: 8.00, tip: 0, shippingAmount: 10.00, discount: 0, total: 118.00, currency: 'USD' },
        paymentStatus: PaymentStatus.REFUNDED,
        orderDate: Date.now(),
        cancelReason: 'Customer requested cancellation',
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-orders/order_123/cancel', { reason: 'Customer requested cancellation' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.cancel('order_123', { reason: 'Customer requested cancellation' });

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(result.cancelReason).toBe('Customer requested cancellation');
      expect(result.paymentStatus).toBe(PaymentStatus.REFUNDED);
    });

    it('should cancel an order without reason', async () => {
      const mockResponse: ProductOrder = {
        id: 'order_456',
        orderNumber: 'ORD-2024-002',
        status: OrderStatus.CANCELLED,
        items: [
          {
            id: 'item_2',
            productOrderId: 'order_456',
            productId: 'prod_456',
            itemName: 'Product',
            quantity: 1,
            unitPrice: 50.00,
            totalPrice: 50.00,
            status: OrderStatus.CANCELLED,
          },
        ],
        customerId: 'cust_789',
        pricing: { subtotal: 50.00, tax: 4.00, tip: 0, shippingAmount: 5.00, discount: 0, total: 59.00, currency: 'USD' },
        paymentStatus: PaymentStatus.REFUNDED,
        orderDate: Date.now(),
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/product-orders/order_456/cancel', {})
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.cancel('order_456', {});

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('delete', () => {
    it('should delete a product order', async () => {
      nock(BASE_URL)
        .delete('/product-orders/order_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.delete('order_123');
      expect(result).toBe(true);
    });

    it('should throw API error when order not found', async () => {
      nock(BASE_URL)
        .delete('/product-orders/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product order not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.productOrders.delete('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('list', () => {
    it('should list product orders with pagination', async () => {
      const mockOrders: ProductOrder[] = [
        {
          id: 'order_1',
          orderNumber: 'ORD-2024-001',
          status: OrderStatus.COMPLETED,
          items: [
            {
              id: 'item_1',
              productOrderId: 'order_1',
              productId: 'prod_123',
              itemName: 'Product A',
              quantity: 1,
              unitPrice: 100.00,
              totalPrice: 100.00,
              status: OrderStatus.COMPLETED,
            },
          ],
          customerId: 'cust_123',
          pricing: { subtotal: 100.00, tax: 8.00, tip: 0, shippingAmount: 10.00, discount: 0, total: 118.00, currency: 'USD' },
          paymentStatus: PaymentStatus.PAID,
          orderDate: Date.now(),
          deliveredDate: Date.now(),
          source: 'direct',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'order_2',
          orderNumber: 'ORD-2024-002',
          status: OrderStatus.OUT_FOR_DELIVERY,
          items: [
            {
              id: 'item_2',
              productOrderId: 'order_2',
              productId: 'prod_456',
              itemName: 'Product B',
              quantity: 2,
              unitPrice: 50.00,
              totalPrice: 100.00,
              status: OrderStatus.OUT_FOR_DELIVERY,
            },
          ],
          customerId: 'cust_456',
          pricing: { subtotal: 100.00, tax: 8.00, tip: 0, shippingAmount: 5.00, discount: 10.00, total: 103.00, currency: 'USD' },
          paymentStatus: PaymentStatus.PAID,
          orderDate: Date.now(),
          shippedDate: Date.now(),
          source: 'web',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<ProductOrder> = {
        data: mockOrders,
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
        .get('/product-orders')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.list();

      expect(result.data).toHaveLength(2);
      expect(result.meta.totalCount).toBe(2);
      expect(result.data[0].orderNumber).toBe('ORD-2024-001');
      expect(result.data[1].orderNumber).toBe('ORD-2024-002');
    });

    it('should list orders with custom pagination parameters', async () => {
      const mockResponse: PaginatedResultType<ProductOrder> = {
        data: [],
        meta: {
          page: 3,
          pageSize: 25,
          totalCount: 75,
          totalPages: 3,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      };

      nock(BASE_URL)
        .get('/product-orders')
        .query({ page: '3', pageSize: '25' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.productOrders.list({
        page: 3,
        pageSize: 25,
      });

      expect(result.meta.page).toBe(3);
      expect(result.meta.pageSize).toBe(25);
      expect(result.meta.hasPreviousPage).toBe(true);
    });
  });
});
