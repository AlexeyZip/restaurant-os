import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'warn';

@Component({
  selector: 'ui-button',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  type = input<'button' | 'submit'>('button');
  clicked = output<void>();
}
