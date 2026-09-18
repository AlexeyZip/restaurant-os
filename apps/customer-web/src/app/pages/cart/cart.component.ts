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
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule,
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
    // No dine-in option: booking a table is a Reservation concern, not Order.
    orderType: new FormControl<OrderType>('TAKEAWAY', { nonNullable: true }),
    deliveryAddress: new FormControl({ value: '', disabled: true }),
    notes: new FormControl(''),
    // Unchecking this is what makes scheduledFor required - see applyAsapRules().
    asap: new FormControl<boolean>(true, { nonNullable: true }),
    scheduledFor: new FormControl<Date | null>({ value: null, disabled: true }),
  });

  readonly minScheduledDate = new Date();

  totalPrice = this.cartStore.totalPrice;

  constructor() {
    this.menuStore.loadCategories();

    this.form.controls.orderType.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((orderType) => this.applyOrderTypeRules(orderType));
    this.applyOrderTypeRules(this.form.controls.orderType.value);

    this.form.controls.asap.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((asap) => this.applyAsapRules(asap));
    this.applyAsapRules(this.form.controls.asap.value);
  }

  private applyOrderTypeRules(orderType: OrderType) {
    const deliveryAddress = this.form.controls.deliveryAddress;

    if (orderType === 'DELIVERY') {
      deliveryAddress.enable({ emitEvent: false });
      deliveryAddress.setValidators(Validators.required);
    } else {
      deliveryAddress.disable({ emitEvent: false });
      deliveryAddress.reset('', { emitEvent: false });
      deliveryAddress.clearValidators();
    }

    deliveryAddress.updateValueAndValidity({ emitEvent: false });
  }

  private applyAsapRules(asap: boolean) {
    const scheduledFor = this.form.controls.scheduledFor;

    if (asap) {
      scheduledFor.disable({ emitEvent: false });
      scheduledFor.reset(null, { emitEvent: false });
      scheduledFor.clearValidators();
    } else {
      scheduledFor.enable({ emitEvent: false });
      scheduledFor.setValidators(Validators.required);
    }

    scheduledFor.updateValueAndValidity({ emitEvent: false });
  }

  async onSubmit() {
    if (this.form.invalid || this.cartStore.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    // /cart has no authGuard on purpose - the auth check happens here, at
    // the moment of placing the order, not when landing on the page.
    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // form.value only includes ENABLED controls - deliveryAddress is
    // omitted entirely for TAKEAWAY, scheduledFor is omitted entirely when
    // asap is checked. That's exactly the shape the backend expects.
    const { orderType, deliveryAddress, notes, scheduledFor } =
      this.form.value;

    const payload: CreateOrderPayload = {
      orderType: orderType as OrderType,
      deliveryAddress: deliveryAddress || undefined,
      notes: notes || undefined,
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
