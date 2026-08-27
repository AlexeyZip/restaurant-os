import { Component, inject } from '@angular/core';
import { CardComponent, ButtonComponent, MoneyPipe } from '@restaurant-os/ui';
import { MenuStore } from '../../stores/menu.store';

@Component({
  selector: 'app-menu',
  imports: [CardComponent, ButtonComponent, MoneyPipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private readonly menuStore = inject(MenuStore);

  categories = this.menuStore.categories;
  loading = this.menuStore.loading;
  error = this.menuStore.error;

  constructor() {
    this.menuStore.loadCategories();
  }

  retry() {
    this.menuStore.loadCategories();
  }
}
