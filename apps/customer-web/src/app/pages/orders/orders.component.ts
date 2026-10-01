import { Component, inject, signal } from '@angular/core';
import { MenuStore } from '../../stores/menu.store';
import { OrdersApiService } from '../../services/orders-api.service';
import { Order, OrderStatus } from '../../models/order.model';
import { CardComponent, MoneyPipe, TooltipDirective } from '@restaurant-os/ui';
import { DatePipe } from '@angular/common';

const ORDER_STATUS_TOOLTIPS: Record<OrderStatus, string> = {
  CREATED: 'Placed — waiting for the restaurant to confirm.',
  CONFIRMED: 'Confirmed — the kitchen will start preparing it soon.',
  IN_PROGRESS: 'Your food is being prepared right now.',
  READY: 'Ready — waiting for pickup or the courier.',
  OUT_FOR_DELIVERY: 'On its way to you.',
  COMPLETED: 'Delivered or picked up. Order complete.',
  CANCELLED: 'This order was cancelled.',
};

@Component({
  selector: 'app-orders',
  imports: [CardComponent, MoneyPipe, DatePipe, TooltipDirective],
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

  statusTooltip(status: OrderStatus): string {
    return ORDER_STATUS_TOOLTIPS[status];
  }
}
