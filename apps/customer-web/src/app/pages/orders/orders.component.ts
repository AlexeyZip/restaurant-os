import { Component, DestroyRef, inject, signal } from '@angular/core';
import { SocketConnectionService } from '@restaurant-os/auth-client';
import {
  OrdersApiService,
  Order,
  OrderStatus,
} from '@restaurant-os/orders-client';
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
  private readonly socketConnection = inject(SocketConnectionService);
  private readonly destroyRef = inject(DestroyRef);

  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadOrders();
    this.connectSocket();
  }

  // `silent` refreshes in the background (after a reconnect) without
  // replacing the list with a loading message.
  async loadOrders(silent = false) {
    if (!silent) {
      this.loading.set(true);
      this.error.set(null);
    }
    try {
      this.orders.set(await this.ordersApiService.getOrders());
    } catch (error) {
      if (!silent) {
        this.error.set(error instanceof Error ? error.message : 'Failed to load orders');
      }
    } finally {
      this.loading.set(false);
    }
  }

  private connectSocket() {
    const { socket, close } = this.socketConnection.connect('/orders');

    // Events missed while offline are gone; REST is the source of truth, so
    // every (re)connect resyncs the list.
    socket.on('connect', () => this.loadOrders(true));

    socket.on(
      'order.status.changed',
      (update: { id: string; status: OrderStatus; cancelReason: string | null }) => {
        this.orders.update((orders) =>
          orders.map((order) =>
            order.id === update.id
              ? {
                  ...order,
                  status: update.status,
                  cancelReason: update.cancelReason ?? undefined,
                }
              : order,
          ),
        );
      },
    );

    this.destroyRef.onDestroy(close);
  }

  statusTooltip(status: OrderStatus): string {
    return ORDER_STATUS_TOOLTIPS[status];
  }
}
