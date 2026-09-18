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
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { getControlErrorMessage } from '../forms/control-error-message';

@Component({
  selector: 'ui-input',
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // No NG_VALUE_ACCESSOR provider - self-injecting NgControl below covers
  // registration AND lets us read validity state; combining both is a
  // known circular-dependency footgun.
})
export class InputComponent implements ControlValueAccessor {
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  hint = input<string>('');

  // Signals, not plain fields: writeValue()/setDisabledState() are called
  // externally by the Forms module, and under OnPush a plain field mutated
  // from outside never triggers a re-render.
  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);

  // Bridges AbstractControl's plain invalid/touched getters into the signal
  // graph - control.events emits on markAsTouched()/markAllAsTouched(),
  // each emission bumps this so showError/errorMessage below recompute.
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

  onChange: (value: string | number | null) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    // afterNextRender, not subscribing directly here: FormControlName's own
    // ngOnChanges isn't guaranteed to have run yet, so ngControl.control can
    // still be undefined at this point.
    afterNextRender(() => {
      this.ngControl?.control?.events
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.formStateVersion.update((version) => version + 1));
    });
  }

  writeValue(value: string | number | null): void {
    // Numeric FormControls (e.g. form.reset({ guestCount: 2 })) hand us a
    // real number - stringify it, since [value] on the native <input> is a
    // string regardless of `type`.
    this.value.set(value === null || value === undefined ? '' : String(value));
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    // .value is always a string regardless of `type` - fine for display,
    // but a number input must hand onChange a real number (valueAsNumber),
    // otherwise the FormControl holds "6" and fails the backend's @IsInt().
    this.value.set(inputEl.value);

    if (this.type() === 'number') {
      this.onChange(inputEl.value === '' ? null : inputEl.valueAsNumber);
    } else {
      this.onChange(inputEl.value);
    }
  }
}
