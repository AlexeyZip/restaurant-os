import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthStore } from '../../stores/auth.store';
import { InputComponent, ButtonComponent } from '@restaurant-os/ui';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (!this.loginForm.value.email || !this.loginForm.value.password) {
      return;
    }

    this.authStore
      .login(this.loginForm.value.email, this.loginForm.value.password)
      .then(() => {
        if (this.authStore.error()) {
          return;
        }
        this.router.navigate(['/']);
      });
  }

  get error() {
    return this.authStore.error();
  }
}
