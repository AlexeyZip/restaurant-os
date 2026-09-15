import { ValidationErrors } from '@angular/forms';

/**
 * Turns Angular's raw validation errors object into a single user-facing
 * message. Shared between ui-input and ui-datetime-picker (and any future
 * Material-form-field wrapper) so error copy stays consistent in one place
 * instead of being copy-pasted per component.
 */
export function getControlErrorMessage(
  errors: ValidationErrors | null | undefined,
): string {
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
}
