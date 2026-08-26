import { Component, input, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent, ButtonComponent } from '@restaurant-os/ui';

export interface AuthFormValue {
  email: string;
  password: string;
}

@Component({
  selector: 'app-auth-form',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.scss',
})
export class AuthFormComponent {
  submitLabel = input('Submit');
  errorMessage = input<string | null>(null);

  formSubmit = output<AuthFormValue>();

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    if (!email || !password) {
      return;
    }

    this.formSubmit.emit({ email, password });
  }
}
