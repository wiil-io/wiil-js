/**
 * @fileoverview Menu Orders resource for managing customer menu orders.
 * @module resources/menu-orders
 */

import {
  MenuOrder,
  CreateMenuOrder,
  CreateMenuOrderSchema,
  UpdateMenuOrder,
  UpdateMenuOrderSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing menu orders in the WIIL Platform.
 */
export class MenuOrdersResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/menu-orders';

  constructor(http: HttpClient) {
    this.http = http;
  }

  public async create(data: CreateMenuOrder): Promise<MenuOrder> {
    return this.http.post<CreateMenuOrder, MenuOrder>(
      this.resource_path,
      data,
      CreateMenuOrderSchema
    );
  }

  public async get(id: string): Promise<MenuOrder> {
    return this.http.get<MenuOrder>(`${this.resource_path}/${id}`);
  }

  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuOrder>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuOrder>>(path);
  }

  public async update(data: UpdateMenuOrder): Promise<MenuOrder> {
    return this.http.patch<UpdateMenuOrder, MenuOrder>(
      this.resource_path,
      data,
      UpdateMenuOrderSchema
    );
  }

  public async updateStatus(id: string, data: { status: string }): Promise<MenuOrder> {
    return this.http.patch<{ status: string }, MenuOrder>(
      `${this.resource_path}/${id}/status`,
      data
    );
  }

  public async cancel(id: string, data: { reason?: string }): Promise<MenuOrder> {
    return this.http.post<{ reason?: string }, MenuOrder>(
      `${this.resource_path}/${id}/cancel`,
      data
    );
  }

  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<MenuOrder>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<MenuOrder>>(path);
  }
}
