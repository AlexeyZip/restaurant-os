import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  Order,
  OrdersApiService,
  OrderStatus,
} from '@restaurant-os/orders-client';
import { ButtonComponent, CardComponent } from '@restaurant-os/ui';
import { SocketConnectionService } from '@restaurant-os/auth-client';

interface NextAction {
  status: OrderStatus;
  label: string;
}

interface OrderView {
  order: Order;
  action: NextAction | null;
}

const COLUMNS: { status: OrderStatus; title: string }[] = [
  { status: 'CREATED', title: 'New' },
  { status: 'CONFIRMED', title: 'Confirmed' },
  { status: 'IN_PROGRESS', title: 'Cooking' },
  { status: 'READY', title: 'Ready' },
];

const BOARD_STATUSES = new Set<OrderStatus>(COLUMNS.map((c) => c.status));

function nextAction(order: Order): NextAction | null {
  switch (order.status) {
    case 'CREATED':
      return { status: 'CONFIRMED', label: 'Confirm' };
    case 'CONFIRMED':
      return { status: 'IN_PROGRESS', label: 'Start cooking' };
    case 'IN_PROGRESS':
      return { status: 'READY', label: 'Mark ready' };
    case 'READY':
      return order.orderType === 'DELIVERY'
        ? { status: 'OUT_FOR_DELIVERY', label: 'Hand to courier' }
        : { status: 'COMPLETED', label: 'Handed over' };
    default:
      return null;
  }
}

@Component({
  selector: 'app-kitchen',
  imports: [ButtonComponent, CardComponent, DatePipe],
  templateUrl: './kitchen.component.html',
  styleUrl: './kitchen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KitchenComponent {
  private readonly ordersApi = inject(OrdersApiService);
  private readonly socketConnection = inject(SocketConnectionService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly live = signal(false);
  protected readonly pendingIds = signal<ReadonlySet<string>>(new Set());

  protected readonly columns = computed(() =>
    COLUMNS.map(({ status, title }) => ({
      status,
      title,
      // Oldest first: the order that has waited longest is the most urgent.
      items: this.orders()
        .filter((order) => order.status === status)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((order): OrderView => ({ order, action: nextAction(order) })),
    })),
  );

  protected readonly isEmpty = computed(() =>
    this.columns().every((column) => column.items.length === 0),
  );

  constructor() {
    this.loadOrders();
    this.connectSocket();
  }

  // `silent` refreshes in the background (after a reconnect) without
  // replacing the board with a spinner.
  protected async loadOrders(silent = false) {
    if (!silent) {
      this.loading.set(true);
      this.error.set(null);
    }
    try {
      const orders = await this.ordersApi.getOrders();
      this.orders.set(orders.filter((order) => BOARD_STATUSES.has(order.status)));
    } catch {
      if (silent) {
        this.actionError.set('Could not refresh orders.');
      } else {
        this.error.set('Failed to load orders.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected async advance(order: Order, action: NextAction) {
    this.actionError.set(null);
    this.setPending(order.id, true);
    try {
      this.upsert(await this.ordersApi.updateOrderStatus(order.id, action.status));
    } catch {
      this.actionError.set(`Could not update order #${order.id.slice(-4)}.`);
    } finally {
      this.setPending(order.id, false);
    }
  }

  protected shortId(order: Order): string {
    return order.id.slice(-4);
  }

  private connectSocket() {
    const { socket, close } = this.socketConnection.connect('/kitchen');

    socket.on('connect', () => {
      this.live.set(true);
      // Anything emitted while we were not connected is lost for good, and
      // the REST API is the source of truth - so every (re)connect resyncs.
      this.loadOrders(true);
    });
    socket.on('disconnect', () => this.live.set(false));
    socket.on('connect_error', () => this.live.set(false));

    socket.on('order.created', ({ id }: { id: string }) => this.fetchOrder(id));

    socket.on(
      'order.status.changed',
      ({ id, status }: { id: string; status: OrderStatus }) => {
        if (this.orders().some((order) => order.id === id)) {
          this.orders.update((list) =>
            list.map((order) => (order.id === id ? { ...order, status } : order)),
          );
        } else {
          this.fetchOrder(id);
        }
      },
    );

    this.destroyRef.onDestroy(close);
  }

  private async fetchOrder(id: string) {
    try {
      this.upsert(await this.ordersApi.getOrderById(id));
    } catch {
      this.actionError.set('Could not load a new order. Refresh the page.');
    }
  }

  private upsert(order: Order) {
    this.orders.update((list) =>
      list.some((existing) => existing.id === order.id)
        ? list.map((existing) => (existing.id === order.id ? order : existing))
        : [...list, order],
    );
  }

  private setPending(id: string, pending: boolean) {
    this.pendingIds.update((ids) => {
      const next = new Set(ids);
      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
