import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthFormComponent,
  AuthFormValue,
  AuthStore,
} from '@restaurant-os/auth-client';

@Component({
  selector: 'app-login',
  imports: [AuthFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  get error() {
    return this.authStore.error();
  }

  onSubmit({ email, password }: AuthFormValue) {
    this.authStore.login(email, password).then(() => {
      if (this.authStore.error()) {
        return;
      }
      this.router.navigate(['/']);
    });
  }
}
