import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MenuCategory } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/menu';

  getCategories(): Promise<MenuCategory[]> {
    return firstValueFrom(
      this.http.get<MenuCategory[]>(`${this.baseUrl}/categories`),
    );
  }
}
