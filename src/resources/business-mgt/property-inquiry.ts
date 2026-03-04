/**
 * @fileoverview Property Inquiry resource for managing property leads and inquiries.
 * @module resources/property-inquiry
 */

import {
  PropertyInquiry,
  CreatePropertyInquiry,
  CreatePropertyInquirySchema,
  UpdatePropertyInquiry,
  UpdatePropertyInquirySchema,
  UpdatePropertyInquiryStatus,
  UpdatePropertyInquiryStatusSchema,
  PaginatedResultType,
  PaginationRequest,
} from 'wiil-core-js';
import { HttpClient } from '../../client/HttpClient';

/**
 * Resource class for managing property inquiries in the WIIL Platform.
 */
export class PropertyInquiryResource {
  private readonly http: HttpClient;
  private readonly resource_path = '/property-inquiries';

  constructor(http: HttpClient) {
    this.http = http;
  }

  public async create(data: CreatePropertyInquiry): Promise<PropertyInquiry> {
    return this.http.post<CreatePropertyInquiry, PropertyInquiry>(
      this.resource_path,
      data,
      CreatePropertyInquirySchema
    );
  }

  public async get(id: string): Promise<PropertyInquiry> {
    return this.http.get<PropertyInquiry>(`${this.resource_path}/${id}`);
  }

  public async getByProperty(
    propertyId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<PropertyInquiry>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-property/${propertyId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<PropertyInquiry>>(path);
  }

  public async getByCustomer(
    customerId: string,
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<PropertyInquiry>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}/by-customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<PropertyInquiry>>(path);
  }

  public async update(data: UpdatePropertyInquiry): Promise<PropertyInquiry> {
    return this.http.patch<UpdatePropertyInquiry, PropertyInquiry>(
      this.resource_path,
      data,
      UpdatePropertyInquirySchema
    );
  }

  public async updateStatus(id: string, data: UpdatePropertyInquiryStatus): Promise<PropertyInquiry> {
    return this.http.patch<UpdatePropertyInquiryStatus, PropertyInquiry>(
      `${this.resource_path}/${id}/status`,
      data,
      UpdatePropertyInquiryStatusSchema
    );
  }

  public async delete(id: string): Promise<boolean> {
    return this.http.delete<boolean>(`${this.resource_path}/${id}`);
  }

  public async list(
    params?: Partial<PaginationRequest>
  ): Promise<PaginatedResultType<PropertyInquiry>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const path = `${this.resource_path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.http.get<PaginatedResultType<PropertyInquiry>>(path);
  }
}
