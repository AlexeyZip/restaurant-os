import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Table } from '../models/table.model';

@Injectable({ providedIn: 'root' })
export class TablesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tables';

  getTables(): Promise<Table[]> {
    return firstValueFrom(this.http.get<Table[]>(this.baseUrl));
  }
}
