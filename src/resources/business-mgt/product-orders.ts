/**
 * @fileoverview Product Orders resource for managing customer product orders.
 * @module resources/product-orders
 */

import {
  ProductOrder,
  CreateProductOrder,
  CreateProductOrderSchema,
  UpdateProductOrder,
  UpdateProductOrderSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing product orders in the WIIL Platform.
 */
export class ProductOrdersResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/product-orders';

  constructor(http: HttpClient) {
    this.http = http;
  }

  public async create(data: CreateProductOrder): Promise<ProductOrder> {
    return this.http.post<CreateProductOrder, ProductOrder>(
      this.resource_path,
      data,
      CreateProductOrderSchema
    );
  }

  public async get(id: string): Promise<ProductOrder> {
    return this.http.get<ProductOrder>(`${this.resource_path}/${id}`);
  }

  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductOrder>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductOrder>>(path);
  }

  public async update(data: UpdateProductOrder): Promise<ProductOrder> {
    return this.http.patch<UpdateProductOrder, ProductOrder>(
      this.resource_path,
      data,
      UpdateProductOrderSchema
    );
  }

  public async updateStatus(id: string, data: { status: string }): Promise<ProductOrder> {
    return this.http.patch<{ status: string }, ProductOrder>(
      `${this.resource_path}/${id}/status`,
      data
    );
  }

  public async cancel(id: string, data: { reason?: string }): Promise<ProductOrder> {
    return this.http.post<{ reason?: string }, ProductOrder>(
      `${this.resource_path}/${id}/cancel`,
      data
    );
  }

  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<ProductOrder>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<ProductOrder>>(path);
  }
}
