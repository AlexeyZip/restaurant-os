import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthFormComponent,
  AuthFormValue,
  AuthStore,
} from '@restaurant-os/auth-client';

@Component({
  selector: 'app-register',
  imports: [AuthFormComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  get error() {
    return this.authStore.error();
  }

  onSubmit({ email, password }: AuthFormValue) {
    this.authStore.register(email, password).then(() => {
      if (this.authStore.error()) {
        return;
      }
      this.router.navigate(['/']);
    });
  }
}
