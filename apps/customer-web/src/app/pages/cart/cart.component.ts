import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ButtonComponent,
  CardComponent,
  DatetimePickerComponent,
  InputComponent,
  MoneyPipe,
} from '@restaurant-os/ui';
import { CartStore } from '../../stores/cart.store';
import { MenuStore } from '../../stores/menu.store';
import { AuthStore } from '../../stores/auth.store';
import { CreateOrderPayload, OrderType } from '../../models/order.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cart',
  imports: [
    CardComponent,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    MoneyPipe,
    DatetimePickerComponent,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private readonly menuStore = inject(MenuStore);
  private readonly cartStore = inject(CartStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  itemsWithDetails = this.cartStore.itemsWithDetails;
  submitting = this.cartStore.submitting;
  error = this.cartStore.error;
  isEmpty = computed(() => this.itemsWithDetails().length === 0);

  form = new FormGroup({
    orderType: new FormControl<OrderType>('DINE_IN', { nonNullable: true }),
    tableNumber: new FormControl('', [Validators.required]),
    deliveryAddress: new FormControl({ value: '', disabled: true }),
    notes: new FormControl(''),
    // Optional - null means "as soon as possible", the default for most
    // orders. min prevents picking a moment that's already in the past
    // (the backend also re-validates this - never trust the client alone).
    scheduledFor: new FormControl<Date | null>(null),
  });

  readonly minScheduledDate = new Date();

  totalPrice = this.cartStore.totalPrice;

  constructor() {
    this.menuStore.loadCategories();
    this.form.controls.orderType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((orderType) => this.applyOrderTypeRules(orderType));

    this.applyOrderTypeRules(this.form.controls.orderType.value);
  }

  private applyOrderTypeRules(orderType: OrderType) {
    const tableNumber = this.form.controls.tableNumber;
    const deliveryAddress = this.form.controls.deliveryAddress;

    if (orderType === 'DINE_IN') {
      tableNumber.enable({ emitEvent: false });
      tableNumber.setValidators(Validators.required);
      deliveryAddress.disable({ emitEvent: false });
      deliveryAddress.reset('', { emitEvent: false });
      deliveryAddress.clearValidators();
    } else if (orderType === 'DELIVERY') {
      tableNumber.disable({ emitEvent: false });
      tableNumber.reset('', { emitEvent: false });
      tableNumber.clearValidators();
      deliveryAddress.enable({ emitEvent: false });
      deliveryAddress.setValidators(Validators.required);
    } else {
      // TAKEAWAY - picked up at the counter, neither field applies.
      tableNumber.disable({ emitEvent: false });
      tableNumber.reset('', { emitEvent: false });
      tableNumber.clearValidators();
      deliveryAddress.disable({ emitEvent: false });
      deliveryAddress.reset('', { emitEvent: false });
      deliveryAddress.clearValidators();
    }

    tableNumber.updateValueAndValidity({ emitEvent: false });
    deliveryAddress.updateValueAndValidity({ emitEvent: false });
  }

  async onSubmit() {
    if (this.form.invalid || this.cartStore.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    // The cart itself is browsable without being logged in (that's a
    // deliberate choice - see /cart route with no authGuard), but the
    // backend's POST /orders requires a JWT either way. So the auth check
    // happens right here, at the moment of actually placing the order, not
    // when landing on the page.
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const { orderType, tableNumber, deliveryAddress, notes, scheduledFor } =
      this.form.value;

    const payload: CreateOrderPayload = {
      orderType: orderType as OrderType,
      tableNumber: tableNumber ? Number(tableNumber) : undefined,
      deliveryAddress: deliveryAddress || undefined,
      notes: notes || undefined,
      // Date -> ISO string: HttpClient JSON-serializes the payload, and a
      // raw Date would just get silently stringified via .toString() by
      // JSON.stringify's default behavior for Date is actually toISOString()
      // already - but being explicit here documents the wire format and
      // matches what the backend's @Type(() => Date) expects to parse.
      scheduledFor: scheduledFor ? scheduledFor.toISOString() : undefined,
      items: this.cartStore.items().map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
      })),
    };

    await this.cartStore.submitOrder(payload);

    if (!this.cartStore.error()) {
      this.router.navigate(['/orders']);
    }
  }

  incrementQuantity(dishId: string, quantity: number) {
    this.cartStore.setQuantity(dishId, quantity + 1);
  }

  decrementQuantity(dishId: string, quantity: number) {
    this.cartStore.setQuantity(dishId, quantity - 1);
  }

  removeItem(dishId: string) {
    this.cartStore.removeItem(dishId);
  }
}
