/**
 * @fileoverview Property Configuration resource for managing property listings.
 * @module resources/property-config
 */

import {
  PropertyCategory,
  CreatePropertyCategory,
  CreatePropertyCategorySchema,
  UpdatePropertyCategory,
  UpdatePropertyCategorySchema,
  PropertyAddress,
  CreatePropertyAddress,
  CreatePropertyAddressSchema,
  UpdatePropertyAddress,
  UpdatePropertyAddressSchema,
  Property,
  CreateProperty,
  CreatePropertySchema,
  UpdateProperty,
  UpdatePropertySchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing property configurations in the WIIL Platform.
 */
export class PropertyConfigResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/property-management';

  constructor(http: HttpClient) {
    this.http = http;
  }

  // =============== Property Category Methods ===============

  public async createCategory(data: CreatePropertyCategory): Promise<PropertyCategory> {
    return this.http.post<CreatePropertyCategory, PropertyCategory>(
      `${this.resource_path}/categories`,
      data,
      CreatePropertyCategorySchema
    );
  }

  public async getCategory(id: string): Promise<PropertyCategory> {
    return this.http.get<PropertyCategory>(`${this.resource_path}/categories/${id}`);
  }

  public async listCategories(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<PropertyCategory>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<PropertyCategory>>(path);
  }

  public async updateCategory(data: UpdatePropertyCategory): Promise<PropertyCategory> {
    return this.http.patch<UpdatePropertyCategory, PropertyCategory>(
      `${this.resource_path}/categories`,
      data,
      UpdatePropertyCategorySchema
    );
  }

  public async deleteCategory(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/categories/${id}`);
  }

  // =============== Property Address Methods ===============

  public async createAddress(data: CreatePropertyAddress): Promise<PropertyAddress> {
    return this.http.post<CreatePropertyAddress, PropertyAddress>(
      `${this.resource_path}/addresses`,
      data,
      CreatePropertyAddressSchema
    );
  }

  public async getAddress(id: string): Promise<PropertyAddress> {
    return this.http.get<PropertyAddress>(`${this.resource_path}/addresses/${id}`);
  }

  public async listAddresses(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<PropertyAddress>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/addresses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<PropertyAddress>>(path);
  }

  public async updateAddress(data: UpdatePropertyAddress): Promise<PropertyAddress> {
    return this.http.patch<UpdatePropertyAddress, PropertyAddress>(
      `${this.resource_path}/addresses`,
      data,
      UpdatePropertyAddressSchema
    );
  }

  public async deleteAddress(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/addresses/${id}`);
  }

  public async verifyAddress(id: string): Promise<PropertyAddress> {
    return this.http.post<Record<string, never>, PropertyAddress>(
      `${this.resource_path}/addresses/${id}/verify`,
      {}
    );
  }

  // =============== Property Methods ===============

  public async create(data: CreateProperty): Promise<Property> {
    return this.http.post<CreateProperty, Property>(
      `${this.resource_path}/properties`,
      data,
      CreatePropertySchema
    );
  }

  public async get(id: string): Promise<Property> {
    return this.http.get<Property>(`${this.resource_path}/properties/${id}`);
  }

  public async list(
    params?: Partial<PaginationRequest & { includeDeleted?: boolean }>
  ): Promise<PaginatedResultType<Property>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.includeDeleted !== undefined) queryParams.append('includeDeleted', params.includeDeleted.toString());

    const path = `${this.resource_path}/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Property>>(path);
  }

  public async getByCategory(
    categoryId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Property>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/properties/by-category/${categoryId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<Property>>(path);
  }

  public async getByAddress(addressId: string): Promise<Property> {
    return this.http.get<Property>(`${this.resource_path}/properties/by-address/${addressId}`);
  }

  public async search(
    query: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<Property>> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/properties/search?${queryParams.toString()}`;

    return this.http.get<PaginatedResultType<Property>>(path);
  }

  public async update(data: UpdateProperty): Promise<Property> {
    return this.http.patch<UpdateProperty, Property>(
      `${this.resource_path}/properties`,
      data,
      UpdatePropertySchema
    );
  }

  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/properties/${id}`);
  }
}
