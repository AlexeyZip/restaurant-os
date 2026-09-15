import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { getControlErrorMessage } from '../forms/control-error-message';

/**
 * Wrapper over `mat-datepicker` + `mat-timepicker` ("two in one"): shows a
 * date field and a time field side by side, but combines them into a single
 * `Date` value for the outside world via `ControlValueAccessor`.
 *
 * `provideNativeDateAdapter()` is registered here (component-level, not in
 * `app.config.ts`) so this component is self-contained - anything that
 * imports `ui-datetime-picker` gets a working date adapter for free, same
 * way `ui-input`/`ui-button` don't require any app-wide setup.
 *
 * Validation display mirrors ui-input's InputComponent exactly - same
 * NgControl self-injection + afterNextRender + formStateVersion trick, for
 * the same reason: mat-form-field only projects mat-error/mat-hint based on
 * its own internal `_control.errorState`, which is derived from the
 * NgControl on the *native* input - and since our real formControlName
 * lives on this wrapper, not on either inner <input>, that never lines up.
 * See input.component.html's comment for the full explanation.
 */
@Component({
  selector: 'ui-datetime-picker',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  templateUrl: './datetime-picker.component.html',
  styleUrl: './datetime-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export class DatetimePickerComponent implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  label = input<string>('');
  /** Interval between selectable time options, e.g. '15m', '30m', '1h'. */
  interval = input<string>('15m');
  /** Earliest selectable date (time part is ignored). */
  min = input<Date | null>(null);

  // Signals, not plain fields - see the identical comment in
  // ui-input's InputComponent for why this matters under OnPush:
  // writeValue()/setDisabledState() are called externally by the Forms
  // module, and a plain field mutated from outside an OnPush component
  // doesn't trigger a re-render.
  protected readonly datePart = signal<Date | null>(null);
  protected readonly timePart = signal<Date | null>(null);
  protected readonly isDisabled = signal(false);

  private readonly formStateVersion = signal(0);

  protected readonly showError = computed(() => {
    this.formStateVersion();
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  });

  protected readonly errorMessage = computed(() => {
    this.formStateVersion();
    return getControlErrorMessage(this.ngControl?.control?.errors);
  });

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    afterNextRender(() => {
      this.ngControl?.control?.events
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.formStateVersion.update((version) => version + 1));
    });
  }

  writeValue(value: Date | null): void {
    // A single incoming Date has to feed both sub-fields: the date picker
    // only looks at year/month/day, the time picker only at hours/minutes.
    this.datePart.set(value);
    this.timePart.set(value);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onDateChange(date: Date | null): void {
    this.datePart.set(date);
    this.emitCombinedValue();
  }

  onTimeChange(time: Date | null): void {
    this.timePart.set(time);
    this.emitCombinedValue();
  }

  private emitCombinedValue(): void {
    this.onTouched();

    const datePart = this.datePart();
    const timePart = this.timePart();

    if (!datePart || !timePart) {
      this.onChange(null);
      return;
    }

    // Merge: take the calendar day from datePart, the clock time from
    // timePart, and produce the single Date the rest of the app works with.
    const combined = new Date(datePart);
    combined.setHours(timePart.getHours(), timePart.getMinutes(), 0, 0);
    this.onChange(combined);
  }
}
