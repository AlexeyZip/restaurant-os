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

@Component({
  selector: 'ui-input',
  imports: [MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // No NG_VALUE_ACCESSOR provider here - see the constructor. Registering
  // both that provider AND self-injecting NgControl is a well-known Angular
  // footgun (circular dependency). We only need one, and self-injecting
  // NgControl is the one that also lets us read the control's
  // invalid/touched state, which the provider-only approach can't do.
})
export class InputComponent implements ControlValueAccessor {
  // optional: true - this component works standalone too (e.g. without any
  // formControlName), it just won't have validity info to show then.
  // self: true - only look at the FormControlName/NgModel directive sitting
  // on this exact host element, not some unrelated ancestor form.
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly destroyRef = inject(DestroyRef);

  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  hint = input<string>('');

  // Signals, not plain fields: writeValue()/setDisabledState() are called
  // *externally* by the Forms module (e.g. when a sibling FormControl's
  // valueChanges handler calls .disable()/.enable() on this one), not from
  // an event inside this component's own template. Under OnPush, a plain
  // field mutated from outside doesn't trigger a re-render - Angular has no
  // way to know it changed. Signals are the one primitive that correctly
  // notifies OnPush views regardless of where they were written from.
  protected readonly value = signal('');
  protected readonly isDisabled = signal(false);

  // AbstractControl's invalid/touched are plain getters, not signals - this
  // counter is the bridge. `control.events` emits on markAsTouched(),
  // markAllAsTouched(), status changes, etc.; every emission bumps this
  // signal, which `showError`/`errorMessage` below depend on, so Angular
  // knows to recompute (and re-render, even under OnPush) at exactly the
  // right times - e.g. when CartComponent.onSubmit() calls
  // form.markAllAsTouched() on an invalid form.
  private readonly formStateVersion = signal(0);

  protected readonly showError = computed(() => {
    this.formStateVersion();
    const control = this.ngControl?.control;
    return !!control && control.invalid && (control.touched || control.dirty);
  });

  protected readonly errorMessage = computed(() => {
    this.formStateVersion();
    const errors = this.ngControl?.control?.errors;
    if (!errors) {
      return '';
    }
    if (errors['required']) {
      return 'This field is required.';
    }
    if (errors['email']) {
      return 'Enter a valid email address.';
    }
    return 'Invalid value.';
  });

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    // Why afterNextRender and not just subscribing here directly: the
    // FormControlName directive sitting on the same host element hasn't
    // necessarily run its own ngOnChanges yet at this point in time (hook
    // order between two directives on the same element isn't something
    // Angular guarantees), so `ngControl.control` can still be undefined
    // right now. afterNextRender fires once, after the whole tree has
    // finished its first render, by which point that wiring is guaranteed
    // to be done - a safe point to grab the (stable, long-lived) `events`
    // observable off the real FormControl.
    afterNextRender(() => {
      this.ngControl?.control?.events
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.formStateVersion.update((version) => version + 1));
    });
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
