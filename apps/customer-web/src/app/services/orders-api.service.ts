import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CreateOrderPayload, Order, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/orders';

  createOrder(payload: CreateOrderPayload): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(this.baseUrl, payload));
  }

  getOrders(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(this.baseUrl));
  }

  getOrderById(id: string): Promise<Order> {
    return firstValueFrom(this.http.get<Order>(`${this.baseUrl}/${id}`));
  }

  updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return firstValueFrom(
      this.http.patch<Order>(`${this.baseUrl}/${id}/status`, { status }),
    );
  }
}
