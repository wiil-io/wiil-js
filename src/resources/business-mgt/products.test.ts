/**
 * @fileoverview Tests for Products resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import { ProductCategory, BusinessProduct, PaginatedResultType } from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('ProductsResource', () => {
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

  describe('Product Categories', () => {
    describe('createCategory', () => {
      it('should create a new product category', async () => {
        const input = {
          name: 'Electronics',
          description: 'Electronic devices and accessories',
        };

        const mockResponse: ProductCategory = {
          id: 'category_123',
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/product-management/categories', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.createCategory(input);

        expect(result.id).toBe('category_123');
        expect(result.name).toBe('Electronics');
      });

      it('should create a default category', async () => {
        const input = {
          name: 'Uncategorized',
        };

        const mockResponse: ProductCategory = {
          id: 'category_default',
          name: 'Uncategorized',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/product-management/categories', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.createCategory(input);

        expect(result.name).toBe('Uncategorized');
      });
    });

    describe('getCategory', () => {
      it('should retrieve a product category by ID', async () => {
        const mockResponse: ProductCategory = {
          id: 'category_123',
          name: 'Clothing',
          description: 'Apparel and fashion items',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/product-management/categories/category_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.getCategory('category_123');

        expect(result.id).toBe('category_123');
        expect(result.name).toBe('Clothing');
      });

      it('should throw API error when category not found', async () => {
        nock(BASE_URL)
          .get('/product-management/categories/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Product category not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.products.getCategory('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });

    describe('listCategories', () => {
      it('should list product categories with pagination', async () => {
        const mockCategories: ProductCategory[] = [
          {
            id: 'category_1',
            name: 'Electronics',
            description: 'Electronic devices',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'category_2',
            name: 'Clothing',
            description: 'Apparel items',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<ProductCategory> = {
          data: mockCategories,
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
          .get('/product-management/categories')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.listCategories();

        expect(result.data).toHaveLength(2);
        expect(result.meta.totalCount).toBe(2);
      });

      it('should list categories with custom pagination parameters', async () => {
        const mockResponse: PaginatedResultType<ProductCategory> = {
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
          .get('/product-management/categories')
          .query({ page: '2', pageSize: '10' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.listCategories({
          page: 2,
          pageSize: 10,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.pageSize).toBe(10);
        expect(result.meta.hasNextPage).toBe(true);
      });
    });

    describe('updateCategory', () => {
      it('should update a product category', async () => {
        const updateData = {
          id: 'category_123',
          name: 'Updated Electronics',
          description: 'Modern electronic devices and gadgets',
        };

        const mockResponse: ProductCategory = {
          id: 'category_123',
          name: 'Updated Electronics',
          description: 'Modern electronic devices and gadgets',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/product-management/categories', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.updateCategory(updateData);

        expect(result.name).toBe('Updated Electronics');
        expect(result.description).toBe('Modern electronic devices and gadgets');
      });
    });

    describe('deleteCategory', () => {
      it('should delete a product category', async () => {
        nock(BASE_URL)
          .delete('/product-management/categories/category_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.deleteCategory('category_123');
        expect(result).toBe(true);
      });

      it('should throw API error when category not found', async () => {
        nock(BASE_URL)
          .delete('/product-management/categories/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Product category not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.products.deleteCategory('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });
  });

  describe('Products', () => {
    describe('create', () => {
      it('should create a new product with full details', async () => {
        const input = {
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse with 6 buttons',
          price: 29.99,
          sku: 'WM-2024-BLK',
          barcode: '123456789012',
          categoryId: 'category_electronics',
          brand: 'TechBrand',
          trackInventory: true,
          stockQuantity: 150,
          lowStockThreshold: 20,
          weight: 0.25,
          dimensions: {
            length: 4.5,
            width: 2.8,
            height: 1.6,
            unit: 'inches' as const,
          },
          isActive: true,
        };

        const mockResponse: BusinessProduct = {
          id: 'product_123',
          name: 'Wireless Mouse',
          description: 'Ergonomic wireless mouse with 6 buttons',
          price: 29.99,
          sku: 'WM-2024-BLK',
          barcode: '123456789012',
          categoryId: 'category_electronics',
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
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/product-management/products', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.create(input);

        expect(result.id).toBe('product_123');
        expect(result.name).toBe('Wireless Mouse');
        expect(result.price).toBe(29.99);
        expect(result.sku).toBe('WM-2024-BLK');
        expect(result.trackInventory).toBe(true);
        expect(result.stockQuantity).toBe(150);
        expect(result.dimensions?.length).toBe(4.5);
      });

      it('should create a product with minimal details', async () => {
        const input = {
          name: 'Basic Item',
          price: 9.99,
          isActive: true,
          trackInventory: false,
        };

        const mockResponse: BusinessProduct = {
          id: 'product_456',
          name: 'Basic Item',
          price: 9.99,
          categoryId: 'category_default',
          trackInventory: false,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/product-management/products', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.create(input);

        expect(result.id).toBe('product_456');
        expect(result.trackInventory).toBe(false);
      });
    });

    describe('get', () => {
      it('should retrieve a product by ID', async () => {
        const mockResponse: BusinessProduct = {
          id: 'product_123',
          name: 'Laptop Computer',
          description: '15-inch laptop with 16GB RAM',
          price: 1299.99,
          sku: 'LT-2024-15',
          categoryId: 'category_electronics',
          brand: 'CompBrand',
          trackInventory: true,
          stockQuantity: 25,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/product-management/products/product_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.get('product_123');

        expect(result.id).toBe('product_123');
        expect(result.name).toBe('Laptop Computer');
        expect(result.price).toBe(1299.99);
      });

      it('should throw API error when product not found', async () => {
        nock(BASE_URL)
          .get('/product-management/products/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Product not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.products.get('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });

    describe('getBySku', () => {
      it('should retrieve a product by SKU', async () => {
        const mockResponse: BusinessProduct = {
          id: 'product_123',
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          price: 89.99,
          sku: 'KB-2024-MEC',
          categoryId: 'category_electronics',
          trackInventory: true,
          stockQuantity: 50,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/product-management/products/by-sku/KB-2024-MEC')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.getBySku('KB-2024-MEC');

        expect(result.sku).toBe('KB-2024-MEC');
        expect(result.name).toBe('Keyboard');
      });
    });

    describe('getByBarcode', () => {
      it('should retrieve a product by barcode', async () => {
        const mockResponse: BusinessProduct = {
          id: 'product_456',
          name: 'Monitor',
          description: '27-inch 4K monitor',
          price: 399.99,
          sku: 'MON-2024-27',
          barcode: '987654321098',
          categoryId: 'category_electronics',
          trackInventory: true,
          stockQuantity: 30,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/product-management/products/by-barcode/987654321098')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.getByBarcode('987654321098');

        expect(result.barcode).toBe('987654321098');
        expect(result.name).toBe('Monitor');
      });
    });

    describe('list', () => {
      it('should list products with pagination', async () => {
        const mockProducts: BusinessProduct[] = [
          {
            id: 'product_1',
            name: 'Product A',
            price: 49.99,
            categoryId: 'category_1',
            trackInventory: false,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'product_2',
            name: 'Product B',
            price: 79.99,
            categoryId: 'category_1',
            trackInventory: true,
            stockQuantity: 100,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<BusinessProduct> = {
          data: mockProducts,
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
          .get('/product-management/products')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.list();

        expect(result.data).toHaveLength(2);
        expect(result.meta.totalCount).toBe(2);
        expect(result.data[0].name).toBe('Product A');
      });

      it('should list products with includeDeleted parameter', async () => {
        const mockResponse: PaginatedResultType<BusinessProduct> = {
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
          .get('/product-management/products')
          .query({ page: '1', pageSize: '20', includeDeleted: 'true' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.list({
          page: 1,
          pageSize: 20,
          includeDeleted: true,
        });

        expect(result.data).toHaveLength(0);
      });
    });

    describe('getByCategory', () => {
      it('should retrieve products by category ID', async () => {
        const mockProducts: BusinessProduct[] = [
          {
            id: 'product_1',
            name: 'Mouse',
            price: 29.99,
            categoryId: 'category_electronics',
            trackInventory: true,
            stockQuantity: 100,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'product_2',
            name: 'Keyboard',
            price: 89.99,
            categoryId: 'category_electronics',
            trackInventory: true,
            stockQuantity: 75,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<BusinessProduct> = {
          data: mockProducts,
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
          .get('/product-management/products/by-category/category_electronics')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.getByCategory('category_electronics');

        expect(result.data).toHaveLength(2);
        expect(result.data.every(product => product.categoryId === 'category_electronics')).toBe(true);
      });

      it('should get products by category with pagination', async () => {
        const mockResponse: PaginatedResultType<BusinessProduct> = {
          data: [],
          meta: {
            page: 2,
            pageSize: 15,
            totalCount: 30,
            totalPages: 2,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        };

        nock(BASE_URL)
          .get('/product-management/products/by-category/category_clothing')
          .query({ page: '2', pageSize: '15' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.getByCategory('category_clothing', {
          page: 2,
          pageSize: 15,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.pageSize).toBe(15);
      });
    });

    describe('search', () => {
      it('should search products by query', async () => {
        const mockProducts: BusinessProduct[] = [
          {
            id: 'product_1',
            name: 'Wireless Mouse',
            description: 'Ergonomic wireless mouse',
            price: 29.99,
            categoryId: 'category_electronics',
            trackInventory: true,
            stockQuantity: 50,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'product_2',
            name: 'Wireless Keyboard',
            description: 'Compact wireless keyboard',
            price: 59.99,
            categoryId: 'category_electronics',
            trackInventory: true,
            stockQuantity: 30,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<BusinessProduct> = {
          data: mockProducts,
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
          .get('/product-management/products/search')
          .query({ query: 'wireless' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.search('wireless');

        expect(result.data).toHaveLength(2);
        expect(result.data[0].name).toContain('Wireless');
        expect(result.data[1].name).toContain('Wireless');
      });

      it('should search products with pagination', async () => {
        const mockResponse: PaginatedResultType<BusinessProduct> = {
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
          .get('/product-management/products/search')
          .query({ query: 'laptop', page: '2', pageSize: '10' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.search('laptop', {
          page: 2,
          pageSize: 10,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.hasNextPage).toBe(true);
      });
    });

    describe('update', () => {
      it('should update a product', async () => {
        const updateData = {
          id: 'product_123',
          name: 'Premium Wireless Mouse',
          price: 34.99,
          stockQuantity: 200,
          isActive: true,
        };

        const mockResponse: BusinessProduct = {
          id: 'product_123',
          name: 'Premium Wireless Mouse',
          description: 'Ergonomic wireless mouse with 6 buttons',
          price: 34.99,
          sku: 'WM-2024-BLK',
          categoryId: 'category_electronics',
          trackInventory: true,
          stockQuantity: 200,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/product-management/products', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.update(updateData);

        expect(result.name).toBe('Premium Wireless Mouse');
        expect(result.price).toBe(34.99);
        expect(result.stockQuantity).toBe(200);
      });

      it('should update product dimensions', async () => {
        const updateData = {
          id: 'product_456',
          dimensions: {
            length: 10.5,
            width: 8.2,
            height: 3.1,
            unit: 'cm' as const,
          },
        };

        const mockResponse: BusinessProduct = {
          id: 'product_456',
          name: 'Product',
          price: 99.99,
          categoryId: 'category_1',
          trackInventory: false,
          dimensions: {
            length: 10.5,
            width: 8.2,
            height: 3.1,
            unit: 'cm',
          },
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/product-management/products', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.update(updateData);

        expect(result.dimensions?.length).toBe(10.5);
        expect(result.dimensions?.unit).toBe('cm');
      });
    });

    describe('delete', () => {
      it('should delete a product', async () => {
        nock(BASE_URL)
          .delete('/product-management/products/product_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.products.delete('product_123');
        expect(result).toBe(true);
      });

      it('should throw API error when product not found', async () => {
        nock(BASE_URL)
          .delete('/product-management/products/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Product not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.products.delete('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });
  });
});
