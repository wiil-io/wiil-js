/**
 * @fileoverview Tests for Property Configuration resource.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { WiilClient } from '../../client/WiilClient';
import {
  PropertyCategory,
  PropertyAddress,
  Property,
  PaginatedResultType,
  PropertyType,
  PropertySubType,
  ListingType,
  ListingStatus,
  RentalPeriod,
} from 'wiil-core-js';
import { WiilAPIError } from '../../errors/WiilError';

const BASE_URL = 'https://api.wiil.io/v1';
const API_KEY = 'test-api-key';

describe('PropertyConfigResource', () => {
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

  describe('Property Categories', () => {
    describe('createCategory', () => {
      it('should create a new property category', async () => {
        const input = {
          organizationId: 'org_123',
          name: 'Luxury Homes',
          description: 'High-end residential properties',
          propertyType: PropertyType.RESIDENTIAL,
          isDefault: false,
        };

        const mockResponse: PropertyCategory = {
          id: 'category_123',
          organizationId: 'org_123',
          name: 'Luxury Homes',
          description: 'High-end residential properties',
          propertyType: PropertyType.RESIDENTIAL,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/property-management/categories', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.createCategory(input);

        expect(result.id).toBe('category_123');
        expect(result.name).toBe('Luxury Homes');
        expect(result.propertyType).toBe(PropertyType.RESIDENTIAL);
      });

      it('should create a default category', async () => {
        const input = {
          organizationId: 'org_123',
          name: 'Uncategorized',
          propertyType: PropertyType.RESIDENTIAL,
          isDefault: true,
        };

        const mockResponse: PropertyCategory = {
          id: 'category_default',
          organizationId: 'org_123',
          name: 'Uncategorized',
          propertyType: PropertyType.RESIDENTIAL,
          isDefault: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/property-management/categories', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.createCategory(input);

        expect(result.name).toBe('Uncategorized');
        expect(result.isDefault).toBe(true);
      });
    });

    describe('getCategory', () => {
      it('should retrieve a property category by ID', async () => {
        const mockResponse: PropertyCategory = {
          id: 'category_123',
          organizationId: 'org_123',
          name: 'Commercial Offices',
          description: 'Office spaces and commercial buildings',
          propertyType: PropertyType.COMMERCIAL,
          displayOrder: 1,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/property-management/categories/category_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.getCategory('category_123');

        expect(result.id).toBe('category_123');
        expect(result.name).toBe('Commercial Offices');
        expect(result.propertyType).toBe(PropertyType.COMMERCIAL);
      });

      it('should throw API error when category not found', async () => {
        nock(BASE_URL)
          .get('/property-management/categories/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property category not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.propertyConfig.getCategory('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });

    describe('listCategories', () => {
      it('should list property categories with pagination', async () => {
        const mockCategories: PropertyCategory[] = [
          {
            id: 'category_1',
            organizationId: 'org_123',
            name: 'Residential',
            propertyType: PropertyType.RESIDENTIAL,
            isDefault: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'category_2',
            organizationId: 'org_123',
            name: 'Commercial',
            propertyType: PropertyType.COMMERCIAL,
            isDefault: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<PropertyCategory> = {
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
          .get('/property-management/categories')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.listCategories();

        expect(result.data).toHaveLength(2);
        expect(result.meta.totalCount).toBe(2);
      });

      it('should list categories with custom pagination parameters', async () => {
        const mockResponse: PaginatedResultType<PropertyCategory> = {
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
          .get('/property-management/categories')
          .query({ page: '2', pageSize: '10' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.listCategories({
          page: 2,
          pageSize: 10,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.pageSize).toBe(10);
        expect(result.meta.hasNextPage).toBe(true);
      });
    });

    describe('updateCategory', () => {
      it('should update a property category', async () => {
        const updateData = {
          id: 'category_123',
          name: 'Updated Luxury Homes',
          description: 'Premium residential properties',
        };

        const mockResponse: PropertyCategory = {
          id: 'category_123',
          organizationId: 'org_123',
          name: 'Updated Luxury Homes',
          description: 'Premium residential properties',
          propertyType: PropertyType.RESIDENTIAL,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/property-management/categories', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.updateCategory(updateData);

        expect(result.name).toBe('Updated Luxury Homes');
        expect(result.description).toBe('Premium residential properties');
      });
    });

    describe('deleteCategory', () => {
      it('should delete a property category', async () => {
        nock(BASE_URL)
          .delete('/property-management/categories/category_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.deleteCategory('category_123');
        expect(result).toBe(true);
      });

      it('should throw API error when category not found', async () => {
        nock(BASE_URL)
          .delete('/property-management/categories/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property category not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.propertyConfig.deleteCategory('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });
  });

  describe('Property Addresses', () => {
    describe('createAddress', () => {
      it('should create a new property address', async () => {
        const input = {
          organizationId: 'org_123',
          street: '123 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
          neighborhood: 'Downtown',
          isVerified: false,
        };

        const mockResponse: PropertyAddress = {
          id: 'address_123',
          organizationId: 'org_123',
          street: '123 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'US',
          neighborhood: 'Downtown',
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/property-management/addresses', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.createAddress(input);

        expect(result.id).toBe('address_123');
        expect(result.street).toBe('123 Main Street');
        expect(result.city).toBe('Los Angeles');
      });

      it('should create address with coordinates', async () => {
        const input = {
          organizationId: 'org_123',
          street: '456 Ocean Ave',
          city: 'Miami',
          state: 'FL',
          postalCode: '33139',
          country: 'US',
          coordinates: {
            latitude: 25.7617,
            longitude: -80.1918,
          },
          isVerified: false,
        };

        const mockResponse: PropertyAddress = {
          id: 'address_456',
          organizationId: 'org_123',
          street: '456 Ocean Ave',
          city: 'Miami',
          state: 'FL',
          postalCode: '33139',
          country: 'US',
          coordinates: {
            latitude: 25.7617,
            longitude: -80.1918,
          },
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/property-management/addresses', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.createAddress(input);

        expect(result.coordinates?.latitude).toBe(25.7617);
        expect(result.coordinates?.longitude).toBe(-80.1918);
      });
    });

    describe('getAddress', () => {
      it('should retrieve a property address by ID', async () => {
        const mockResponse: PropertyAddress = {
          id: 'address_123',
          organizationId: 'org_123',
          street: '789 Park Avenue',
          city: 'New York',
          state: 'NY',
          postalCode: '10021',
          country: 'US',
          neighborhood: 'Upper East Side',
          isVerified: true,
          verifiedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/property-management/addresses/address_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.getAddress('address_123');

        expect(result.id).toBe('address_123');
        expect(result.street).toBe('789 Park Avenue');
        expect(result.isVerified).toBe(true);
      });

      it('should throw API error when address not found', async () => {
        nock(BASE_URL)
          .get('/property-management/addresses/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property address not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.propertyConfig.getAddress('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });

    describe('listAddresses', () => {
      it('should list property addresses with pagination', async () => {
        const mockAddresses: PropertyAddress[] = [
          {
            id: 'address_1',
            organizationId: 'org_123',
            street: '100 First St',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            isVerified: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'address_2',
            organizationId: 'org_123',
            street: '200 Second St',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            isVerified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<PropertyAddress> = {
          data: mockAddresses,
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
          .get('/property-management/addresses')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.listAddresses();

        expect(result.data).toHaveLength(2);
        expect(result.meta.totalCount).toBe(2);
      });
    });

    describe('updateAddress', () => {
      it('should update a property address', async () => {
        const updateData = {
          id: 'address_123',
          street: '123 Updated Street',
          unit: 'Suite 100',
        };

        const mockResponse: PropertyAddress = {
          id: 'address_123',
          organizationId: 'org_123',
          street: '123 Updated Street',
          unit: 'Suite 100',
          city: 'Los Angeles',
          state: 'CA',
          country: 'US',
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/property-management/addresses', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.updateAddress(updateData);

        expect(result.street).toBe('123 Updated Street');
        expect(result.unit).toBe('Suite 100');
      });
    });

    describe('deleteAddress', () => {
      it('should delete a property address', async () => {
        nock(BASE_URL)
          .delete('/property-management/addresses/address_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.deleteAddress('address_123');
        expect(result).toBe(true);
      });
    });

    describe('verifyAddress', () => {
      it('should verify a property address', async () => {
        const mockResponse: PropertyAddress = {
          id: 'address_123',
          organizationId: 'org_123',
          street: '123 Main Street',
          city: 'Los Angeles',
          state: 'CA',
          country: 'US',
          isVerified: true,
          verifiedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/property-management/addresses/address_123/verify', {})
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.verifyAddress('address_123');

        expect(result.isVerified).toBe(true);
        expect(result.verifiedAt).toBeDefined();
      });
    });
  });

  describe('Properties', () => {
    describe('create', () => {
      it('should create a new property listing', async () => {
        const input = {
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Beautiful Downtown Condo',
          description: 'Modern 2BR condo with stunning views',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.APARTMENT,
          addressId: 'address_123',
          listingType: ListingType.SALE,
          listingStatus: ListingStatus.ACTIVE,
          salePrice: 450000,
          salePriceCurrency: 'USD',
          rentalPriceCurrency: 'USD',
          priceNegotiable: true,
          features: {
            bedrooms: 2,
            bathrooms: 2,
            squareFootage: 1200,
            parkingSpaces: 1,
            amenities: ['pool', 'gym', 'concierge'],
            utilities: ['gas', 'electric', 'water'],
            lotSizeUnit: 'sqft' as const,
          },
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          isActive: true,
          isFeatured: false,
          isVerified: false,
          furnished: false,
        };

        const mockResponse: Property = {
          id: 'property_123',
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Beautiful Downtown Condo',
          description: 'Modern 2BR condo with stunning views',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.APARTMENT,
          addressId: 'address_123',
          listingType: ListingType.SALE,
          listingStatus: ListingStatus.ACTIVE,
          salePrice: 450000,
          salePriceCurrency: 'USD',
          rentalPriceCurrency: 'USD',
          priceNegotiable: true,
          features: {
            bedrooms: 2,
            bathrooms: 2,
            squareFootage: 1200,
            parkingSpaces: 1,
            amenities: ['pool', 'gym', 'concierge'],
            utilities: ['gas', 'electric', 'water'],
            lotSizeUnit: 'sqft',
          },
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          isActive: true,
          isFeatured: false,
          isVerified: false,
          furnished: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/property-management/properties', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.create(input);

        expect(result.id).toBe('property_123');
        expect(result.title).toBe('Beautiful Downtown Condo');
        expect(result.salePrice).toBe(450000);
        expect(result.features?.bedrooms).toBe(2);
      });

      it('should create a rental property', async () => {
        const input = {
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Cozy Studio Apartment',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.APARTMENT,
          addressId: 'address_456',
          listingType: ListingType.RENT,
          listingStatus: ListingStatus.ACTIVE,
          rentalPrice: 2500,
          rentalPeriod: RentalPeriod.MONTHLY,
          rentalPriceCurrency: 'USD',
          salePriceCurrency: 'USD',
          priceNegotiable: false,
          furnished: true,
          images: [] as string[],
          isActive: true,
          isFeatured: false,
          isVerified: false,
        };

        const mockResponse: Property = {
          id: 'property_456',
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Cozy Studio Apartment',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.APARTMENT,
          addressId: 'address_456',
          listingType: ListingType.RENT,
          listingStatus: ListingStatus.ACTIVE,
          rentalPrice: 2500,
          rentalPeriod: RentalPeriod.MONTHLY,
          rentalPriceCurrency: 'USD',
          salePriceCurrency: 'USD',
          priceNegotiable: false,
          furnished: true,
          images: [],
          isActive: true,
          isFeatured: false,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .post('/property-management/properties', input)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.create(input);

        expect(result.rentalPrice).toBe(2500);
        expect(result.rentalPeriod).toBe('monthly');
        expect(result.furnished).toBe(true);
      });
    });

    describe('get', () => {
      it('should retrieve a property by ID', async () => {
        const mockResponse: Property = {
          id: 'property_123',
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Luxury Villa',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.VILLA,
          addressId: 'address_123',
          listingType: ListingType.SALE,
          listingStatus: ListingStatus.ACTIVE,
          salePrice: 2500000,
          salePriceCurrency: 'USD',
          rentalPriceCurrency: 'USD',
          priceNegotiable: false,
          furnished: true,
          images: [],
          isActive: true,
          isFeatured: true,
          isVerified: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/property-management/properties/property_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.get('property_123');

        expect(result.id).toBe('property_123');
        expect(result.title).toBe('Luxury Villa');
        expect(result.isFeatured).toBe(true);
      });

      it('should throw API error when property not found', async () => {
        nock(BASE_URL)
          .get('/property-management/properties/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.propertyConfig.get('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });

    describe('list', () => {
      it('should list properties with pagination', async () => {
        const mockProperties: Property[] = [
          {
            id: 'property_1',
            organizationId: 'org_123',
            categoryId: 'category_1',
            title: 'Property A',
            propertyType: PropertyType.RESIDENTIAL,
            propertySubType: PropertySubType.HOUSE,
            addressId: 'address_1',
            listingType: ListingType.SALE,
            listingStatus: ListingStatus.ACTIVE,
            salePrice: 500000,
            salePriceCurrency: 'USD',
            rentalPriceCurrency: 'USD',
            priceNegotiable: false,
            furnished: false,
            images: [],
            isActive: true,
            isFeatured: false,
            isVerified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'property_2',
            organizationId: 'org_123',
            categoryId: 'category_1',
            title: 'Property B',
            propertyType: PropertyType.COMMERCIAL,
            propertySubType: PropertySubType.OFFICE,
            addressId: 'address_2',
            listingType: ListingType.RENT,
            listingStatus: ListingStatus.ACTIVE,
            rentalPrice: 5000,
            rentalPeriod: RentalPeriod.MONTHLY,
            rentalPriceCurrency: 'USD',
            salePriceCurrency: 'USD',
            priceNegotiable: true,
            furnished: false,
            images: [],
            isActive: true,
            isFeatured: false,
            isVerified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<Property> = {
          data: mockProperties,
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
          .get('/property-management/properties')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.list();

        expect(result.data).toHaveLength(2);
        expect(result.meta.totalCount).toBe(2);
        expect(result.data[0].title).toBe('Property A');
      });

      it('should list properties with includeDeleted parameter', async () => {
        const mockResponse: PaginatedResultType<Property> = {
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
          .get('/property-management/properties')
          .query({ page: '1', pageSize: '20', includeDeleted: 'true' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.list({
          page: 1,
          pageSize: 20,
          includeDeleted: true,
        });

        expect(result.data).toHaveLength(0);
      });
    });

    describe('getByCategory', () => {
      it('should retrieve properties by category ID', async () => {
        const mockProperties: Property[] = [
          {
            id: 'property_1',
            organizationId: 'org_123',
            categoryId: 'category_residential',
            title: 'House A',
            propertyType: PropertyType.RESIDENTIAL,
            propertySubType: PropertySubType.HOUSE,
            addressId: 'address_1',
            listingType: ListingType.SALE,
            listingStatus: ListingStatus.ACTIVE,
            salePrice: 600000,
            salePriceCurrency: 'USD',
            rentalPriceCurrency: 'USD',
            priceNegotiable: false,
            furnished: false,
            images: [],
            isActive: true,
            isFeatured: false,
            isVerified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<Property> = {
          data: mockProperties,
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
          .get('/property-management/properties/by-category/category_residential')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.getByCategory('category_residential');

        expect(result.data).toHaveLength(1);
        expect(result.data.every(p => p.categoryId === 'category_residential')).toBe(true);
      });

      it('should get properties by category with pagination', async () => {
        const mockResponse: PaginatedResultType<Property> = {
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
          .get('/property-management/properties/by-category/category_commercial')
          .query({ page: '2', pageSize: '15' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.getByCategory('category_commercial', {
          page: 2,
          pageSize: 15,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.pageSize).toBe(15);
      });
    });

    describe('getByAddress', () => {
      it('should retrieve property by address ID', async () => {
        const mockResponse: Property = {
          id: 'property_123',
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Property at Address',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.APARTMENT,
          addressId: 'address_specific',
          listingType: ListingType.SALE,
          listingStatus: ListingStatus.ACTIVE,
          salePrice: 350000,
          salePriceCurrency: 'USD',
          rentalPriceCurrency: 'USD',
          priceNegotiable: false,
          furnished: false,
          images: [],
          isActive: true,
          isFeatured: false,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .get('/property-management/properties/by-address/address_specific')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.getByAddress('address_specific');

        expect(result.addressId).toBe('address_specific');
        expect(result.title).toBe('Property at Address');
      });
    });

    describe('search', () => {
      it('should search properties by query', async () => {
        const mockProperties: Property[] = [
          {
            id: 'property_1',
            organizationId: 'org_123',
            categoryId: 'category_1',
            title: 'Beachfront Villa',
            description: 'Beautiful beachfront property',
            propertyType: PropertyType.RESIDENTIAL,
            propertySubType: PropertySubType.HOUSE,
            addressId: 'address_1',
            listingType: ListingType.SALE,
            listingStatus: ListingStatus.ACTIVE,
            salePrice: 1200000,
            salePriceCurrency: 'USD',
            rentalPriceCurrency: 'USD',
            priceNegotiable: false,
            furnished: true,
            images: [],
            isActive: true,
            isFeatured: true,
            isVerified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        const mockResponse: PaginatedResultType<Property> = {
          data: mockProperties,
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
          .get('/property-management/properties/search')
          .query({ query: 'beachfront' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.search('beachfront');

        expect(result.data).toHaveLength(1);
        expect(result.data[0].title).toContain('Beachfront');
      });

      it('should search properties with pagination', async () => {
        const mockResponse: PaginatedResultType<Property> = {
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
          .get('/property-management/properties/search')
          .query({ query: 'downtown', page: '2', pageSize: '10' })
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.search('downtown', {
          page: 2,
          pageSize: 10,
        });

        expect(result.meta.page).toBe(2);
        expect(result.meta.hasNextPage).toBe(true);
      });
    });

    describe('update', () => {
      it('should update a property', async () => {
        const updateData = {
          id: 'property_123',
          title: 'Updated Property Title',
          salePrice: 475000,
          isFeatured: true,
        };

        const mockResponse: Property = {
          id: 'property_123',
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Updated Property Title',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.APARTMENT,
          addressId: 'address_123',
          listingType: ListingType.SALE,
          listingStatus: ListingStatus.ACTIVE,
          salePrice: 475000,
          salePriceCurrency: 'USD',
          rentalPriceCurrency: 'USD',
          priceNegotiable: false,
          furnished: false,
          images: [],
          isActive: true,
          isFeatured: true,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/property-management/properties', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.update(updateData);

        expect(result.title).toBe('Updated Property Title');
        expect(result.salePrice).toBe(475000);
        expect(result.isFeatured).toBe(true);
      });

      it('should update property features', async () => {
        const updateData = {
          id: 'property_456',
          features: {
            bedrooms: 3,
            bathrooms: 2.5,
            squareFootage: 1800,
            amenities: ['pool', 'gym', 'parking'],
            utilities: [] as string[],
            lotSizeUnit: 'sqft' as const,
          },
        };

        const mockResponse: Property = {
          id: 'property_456',
          organizationId: 'org_123',
          categoryId: 'category_123',
          title: 'Property',
          propertyType: PropertyType.RESIDENTIAL,
          propertySubType: PropertySubType.HOUSE,
          addressId: 'address_456',
          listingType: ListingType.SALE,
          listingStatus: ListingStatus.ACTIVE,
          salePrice: 550000,
          salePriceCurrency: 'USD',
          rentalPriceCurrency: 'USD',
          priceNegotiable: false,
          features: {
            bedrooms: 3,
            bathrooms: 2.5,
            squareFootage: 1800,
            amenities: ['pool', 'gym', 'parking'],
            utilities: [],
            lotSizeUnit: 'sqft',
          },
          furnished: false,
          images: [],
          isActive: true,
          isFeatured: false,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        nock(BASE_URL)
          .patch('/property-management/properties', updateData)
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: mockResponse,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.update(updateData);

        expect(result.features?.bedrooms).toBe(3);
        expect(result.features?.squareFootage).toBe(1800);
      });
    });

    describe('delete', () => {
      it('should delete a property', async () => {
        nock(BASE_URL)
          .delete('/property-management/properties/property_123')
          .matchHeader('X-WIIL-API-Key', API_KEY)
          .reply(200, {
            success: true,
            data: true,
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        const result = await client.propertyConfig.delete('property_123');
        expect(result).toBe(true);
      });

      it('should throw API error when property not found', async () => {
        nock(BASE_URL)
          .delete('/property-management/properties/invalid_id')
          .reply(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Property not found' },
            metadata: { timestamp: Date.now(), version: 'v1' },
          });

        await expect(
          client.propertyConfig.delete('invalid_id')
        ).rejects.toThrow(WiilAPIError);
      });
    });
  });
});
