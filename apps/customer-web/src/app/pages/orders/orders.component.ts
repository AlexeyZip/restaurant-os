import { Component, inject, signal } from '@angular/core';
import { MenuStore } from '../../stores/menu.store';
import { OrdersApiService } from '../../services/orders-api.service';
import { Order } from '../../models/order.model';
import { CardComponent, MoneyPipe } from '@restaurant-os/ui';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-orders',
  imports: [CardComponent, MoneyPipe, DatePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  private readonly ordersApiService = inject(OrdersApiService);

  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.ordersApiService
      .getOrders()
      .then((orders: Order[]) => {
        this.orders.set(orders);
        this.loading.set(false);
      })
      .catch((error) => {
        this.error.set(error.message);
      });
  }
}
