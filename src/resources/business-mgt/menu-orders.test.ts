/**
 * @fileoverview Tests for Menu Orders resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { MenuOrder, PaginatedResultType, MenuOrderType, OrderStatus, PaymentStatus } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('MenuOrdersResource', () => {
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
    it('should create a new menu order', async () => {
      const input = {
        type: MenuOrderType.TAKEOUT,
        status: OrderStatus.PENDING,
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
            status: OrderStatus.PENDING,
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
          shippingAmount: 0,
          discount: 0,
          total: 33.58,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: 'credit_card',
        orderDate: Date.now(),
        requestedTime: Date.now() + 3600000,
        specialInstructions: 'Call upon arrival',
        source: 'web',
        serviceConversationConfigId: 'config_789',
      };

      const mockResponse: MenuOrder = {
        id: 'order_123',
        orderNumber: '#1234',
        type: MenuOrderType.TAKEOUT,
        status: OrderStatus.PENDING,
        items: [
          {
            id: 'orderitem_1',
            menuOrderId: 'order_123',
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
            status: OrderStatus.PENDING,
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
          shippingAmount: 0,
          discount: 0,
          total: 33.58,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: 'credit_card',
        orderDate: Date.now(),
        requestedTime: Date.now() + 3600000,
        estimatedReadyTime: Date.now() + 1800000,
        specialInstructions: 'Call upon arrival',
        source: 'web',
        serviceConversationConfigId: 'config_789',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-orders', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.create(input);

      expect(result.id).toBe('order_123');
      expect(result.orderNumber).toBe('#1234');
      expect(result.type).toBe(MenuOrderType.TAKEOUT);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].itemName).toBe('Cheeseburger');
    });

    it('should create a delivery order with address', async () => {
      const input = {
        type: MenuOrderType.DELIVERY,
        status: OrderStatus.PENDING,
        items: [
          {
            menuItemId: 'item_456',
            itemName: 'Pizza',
            quantity: 1,
            unitPrice: 18.99,
            totalPrice: 18.99,
            status: OrderStatus.PENDING,
          },
        ],
        customerId: 'cust_789',
        pricing: {
          subtotal: 18.99,
          tax: 1.90,
          tip: 0,
          shippingAmount: 5.00,
          discount: 0,
          total: 25.89,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PAID,
        orderDate: Date.now(),
        source: 'direct',
        deliveryAddress: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001',
        },
      };

      const mockResponse: MenuOrder = {
        id: 'order_456',
        orderNumber: '#1235',
        type: MenuOrderType.DELIVERY,
        status: OrderStatus.PENDING,
        items: [
          {
            id: 'orderitem_2',
            menuOrderId: 'order_456',
            menuItemId: 'item_456',
            itemName: 'Pizza',
            quantity: 1,
            unitPrice: 18.99,
            totalPrice: 18.99,
            status: OrderStatus.PENDING,
          },
        ],
        customerId: 'cust_789',
        pricing: {
          subtotal: 18.99,
          tax: 1.90,
          tip: 0,
          shippingAmount: 5.00,
          discount: 0,
          total: 25.89,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PAID,
        orderDate: Date.now(),
        source: 'direct',
        deliveryAddress: {
          street: '123 Main St',
          city: 'New York',
          postalCode: '10001',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-orders', input)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.create(input);

      expect(result.type).toBe(MenuOrderType.DELIVERY);
      expect(result.deliveryAddress).toBeDefined();
      expect(result.deliveryAddress?.street).toBe('123 Main St');
    });
  });

  describe('get', () => {
    it('should retrieve a menu order by ID', async () => {
      const mockResponse: MenuOrder = {
        id: 'order_123',
        orderNumber: '#1234',
        type: MenuOrderType.DINE_IN,
        status: OrderStatus.PREPARING,
        items: [
          {
            id: 'orderitem_1',
            menuOrderId: 'order_123',
            menuItemId: 'item_123',
            itemName: 'Pasta Carbonara',
            quantity: 1,
            unitPrice: 16.99,
            totalPrice: 16.99,
            status: OrderStatus.PREPARING,
          },
        ],
        customerId: 'cust_123',
        pricing: {
          subtotal: 16.99,
          tax: 1.70,
          tip: 0,
          shippingAmount: 0,
          discount: 0,
          total: 18.69,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PENDING,
        orderDate: Date.now(),
        tableNumber: 'T-15',
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .get('/menu-orders/order_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.get('order_123');

      expect(result.id).toBe('order_123');
      expect(result.type).toBe(MenuOrderType.DINE_IN);
      expect(result.tableNumber).toBe('T-15');
    });

    it('should throw API error when menu order not found', async () => {
      nock(BASE_URL)
        .get('/menu-orders/invalid_id')
        .reply(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Menu order not found' },
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      await expect(
        client.menuOrders.get('invalid_id')
      ).rejects.toThrow(WiilAPIError);
    });
  });

  describe('getByCustomer', () => {
    it('should retrieve menu orders by customer ID', async () => {
      const mockOrders: MenuOrder[] = [
        {
          id: 'order_1',
          orderNumber: '#1000',
          type: MenuOrderType.TAKEOUT,
          status: OrderStatus.COMPLETED,
          items: [
            {
              id: 'orderitem_1',
              menuOrderId: 'order_1',
              menuItemId: 'item_1',
              itemName: 'Burger',
              quantity: 1,
              unitPrice: 10.99,
              totalPrice: 10.99,
              status: OrderStatus.COMPLETED,
            },
          ],
          customerId: 'cust_123',
          pricing: {
            subtotal: 10.99,
            tax: 1.10,
            tip: 0,
            shippingAmount: 0,
            discount: 0,
            total: 12.09,
            currency: 'USD',
          },
          paymentStatus: PaymentStatus.PAID,
          orderDate: Date.now() - 86400000,
          source: 'web',
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 86400000,
        },
      ];

      const mockResponse: PaginatedResultType<MenuOrder> = {
        data: mockOrders,
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
        .get('/menu-orders/by-customer/cust_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.getByCustomer('cust_123');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].customerId).toBe('cust_123');
    });
  });

  describe('update', () => {
    it('should update a menu order', async () => {
      const updateData = {
        id: 'order_123',
        status: OrderStatus.READY,
        estimatedReadyTime: Date.now() + 600000,
      };

      const mockResponse: MenuOrder = {
        id: 'order_123',
        orderNumber: '#1234',
        type: MenuOrderType.TAKEOUT,
        status: OrderStatus.READY,
        items: [
          {
            id: 'orderitem_1',
            menuOrderId: 'order_123',
            menuItemId: 'item_123',
            itemName: 'Burger',
            quantity: 1,
            unitPrice: 10.99,
            totalPrice: 10.99,
            status: OrderStatus.READY,
          },
        ],
        customerId: 'cust_123',
        pricing: {
          subtotal: 10.99,
          tax: 1.10,
          tip: 0,
          shippingAmount: 0,
          discount: 0,
          total: 12.09,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PAID,
        orderDate: Date.now(),
        estimatedReadyTime: Date.now() + 600000,
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-orders', updateData)
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.update(updateData);

      expect(result.status).toBe(OrderStatus.READY);
      expect(result.estimatedReadyTime).toBeDefined();
    });
  });

  describe('updateStatus', () => {
    it('should update menu order status', async () => {
      const mockResponse: MenuOrder = {
        id: 'order_123',
        orderNumber: '#1234',
        type: MenuOrderType.DINE_IN,
        status: OrderStatus.PREPARING,
        items: [
          {
            id: 'orderitem_1',
            menuOrderId: 'order_123',
            menuItemId: 'item_123',
            itemName: 'Steak',
            quantity: 1,
            unitPrice: 25.99,
            totalPrice: 25.99,
            status: OrderStatus.PREPARING,
          },
        ],
        customerId: 'cust_456',
        pricing: {
          subtotal: 25.99,
          tax: 2.60,
          tip: 0,
          shippingAmount: 0,
          discount: 0,
          total: 28.59,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.PENDING,
        orderDate: Date.now(),
        source: 'direct',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .patch('/menu-orders/order_123/status', { status: OrderStatus.PREPARING })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.updateStatus('order_123', { status: OrderStatus.PREPARING });

      expect(result.status).toBe(OrderStatus.PREPARING);
    });
  });

  describe('cancel', () => {
    it('should cancel a menu order', async () => {
      const mockResponse: MenuOrder = {
        id: 'order_123',
        orderNumber: '#1234',
        type: MenuOrderType.DELIVERY,
        status: OrderStatus.CANCELLED,
        items: [
          {
            id: 'orderitem_1',
            menuOrderId: 'order_123',
            menuItemId: 'item_123',
            itemName: 'Pizza',
            quantity: 1,
            unitPrice: 18.99,
            totalPrice: 18.99,
            status: OrderStatus.CANCELLED,
          },
        ],
        customerId: 'cust_789',
        pricing: {
          subtotal: 18.99,
          tax: 1.90,
          tip: 0,
          shippingAmount: 0,
          discount: 0,
          total: 20.89,
          currency: 'USD',
        },
        paymentStatus: PaymentStatus.REFUNDED,
        orderDate: Date.now(),
        cancelReason: 'Customer requested cancellation',
        source: 'phone',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      nock(BASE_URL)
        .post('/menu-orders/order_123/cancel', { reason: 'Customer requested cancellation' })
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.cancel('order_123', { reason: 'Customer requested cancellation' });

      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(result.cancelReason).toBe('Customer requested cancellation');
    });
  });

  describe('delete', () => {
    it('should delete a menu order', async () => {
      nock(BASE_URL)
        .delete('/menu-orders/order_123')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: true,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.delete('order_123');
      expect(result).toBe(true);
    });
  });

  describe('list', () => {
    it('should list menu orders with pagination', async () => {
      const mockOrders: MenuOrder[] = [
        {
          id: 'order_1',
          orderNumber: '#1000',
          type: MenuOrderType.DINE_IN,
          status: OrderStatus.COMPLETED,
          items: [
            {
              id: 'orderitem_1',
              menuOrderId: 'order_1',
              menuItemId: 'item_1',
              itemName: 'Salad',
              quantity: 1,
              unitPrice: 8.99,
              totalPrice: 8.99,
              status: OrderStatus.COMPLETED,
            },
          ],
          customerId: 'cust_1',
          pricing: {
            subtotal: 8.99,
            tax: 0.90,
            tip: 0,
            shippingAmount: 0,
            discount: 0,
            total: 9.89,
            currency: 'USD',
          },
          paymentStatus: PaymentStatus.PAID,
          orderDate: Date.now(),
          source: 'direct',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const mockResponse: PaginatedResultType<MenuOrder> = {
        data: mockOrders,
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
        .get('/menu-orders')
        .matchHeader('X-WIIL-API-Key', API_KEY)
        .reply(200, {
          success: true,
          data: mockResponse,
          metadata: { timestamp: Date.now(), version: 'v1' },
        });

      const result = await client.menuOrders.list();

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalCount).toBe(1);
    });
  });
});
