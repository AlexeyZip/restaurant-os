import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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
} from '@restaurant-os/ui';
import {
  CreateReservationPayload,
  Reservation,
} from '../../models/reservation.model';
import { Table } from '../../models/table.model';
import { ReservationsApiService } from '../../services/reservations-api.service';
import { TablesApiService } from '../../services/tables-api.service';

// Fixed duration for every booking - endsAt is always derived from startsAt
// on submit. A duration picker is an easy follow-up if 2h ever isn't enough.
const RESERVATION_DURATION_MS = 2 * 60 * 60 * 1000;

@Component({
  selector: 'app-reservations',
  imports: [
    CardComponent,
    DatePipe,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    DatetimePickerComponent,
  ],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent {
  private readonly reservationsApi = inject(ReservationsApiService);
  private readonly tablesApi = inject(TablesApiService);

  reservations = signal<Reservation[]>([]);
  reservationsLoading = signal(true);
  reservationsError = signal<string | null>(null);

  tables = signal<Table[]>([]);

  submitting = signal(false);
  submitError = signal<string | null>(null);

  readonly minStartDate = new Date();

  form = new FormGroup({
    guestCount: new FormControl(2, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    tableId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startsAt: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
    notes: new FormControl(''),
  });

  constructor() {
    this.loadReservations();
    this.loadTables();

    // Drop the selected table if it can no longer seat the party size.
    this.form.controls.guestCount.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const selectedId = this.form.controls.tableId.value;
        const stillFits = this.availableTables().some(
          (table) => table.id === selectedId,
        );
        if (selectedId && !stillFits) {
          this.form.controls.tableId.reset('');
        }
      });
  }

  // Plain method, not computed(): it reads FormControl.value (not a signal),
  // so computed() would never know to re-run. Fine since this component
  // isn't OnPush - it re-evaluates on every change-detection pass anyway.
  availableTables(): Table[] {
    const guestCount = this.form.controls.guestCount.value ?? 0;
    return this.tables().filter((table) => table.capacity >= guestCount);
  }

  async loadReservations() {
    this.reservationsLoading.set(true);
    this.reservationsError.set(null);

    try {
      this.reservations.set(await this.reservationsApi.getReservations());
    } catch (error: unknown) {
      this.reservationsError.set(this.extractErrorMessage(error));
    } finally {
      this.reservationsLoading.set(false);
    }
  }

  async loadTables() {
    try {
      this.tables.set(await this.tablesApi.getTables());
    } catch {
      // A failed table list shouldn't block the whole page - the <select>
      // just stays empty.
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { guestCount, tableId, startsAt, notes } = this.form.getRawValue();
    // form.invalid already guarantees this, but TS can't see that.
    if (!startsAt) {
      return;
    }
    const endsAt = new Date(startsAt.getTime() + RESERVATION_DURATION_MS);

    const payload: CreateReservationPayload = {
      tableId,
      guestCount,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      notes: notes || undefined,
    };

    this.submitting.set(true);
    this.submitError.set(null);

    try {
      const reservation = await this.reservationsApi.createReservation(payload);
      this.reservations.set([reservation, ...this.reservations()]);
      this.form.reset({
        guestCount: 2,
        tableId: '',
        startsAt: null,
        notes: '',
      });
    } catch (error: unknown) {
      this.submitError.set(this.extractErrorMessage(error));
    } finally {
      this.submitting.set(false);
    }
  }

  private extractErrorMessage(error: unknown): string {
    // The backend's validation/conflict message lives on `.error.message`,
    // not on HttpErrorResponse's own generic `.message`.
    return error instanceof HttpErrorResponse &&
      typeof error.error?.message === 'string'
      ? error.error.message
      : 'Something went wrong. Please try again.';
  }
}
