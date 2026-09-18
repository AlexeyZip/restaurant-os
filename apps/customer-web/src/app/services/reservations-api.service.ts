import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  CreateReservationPayload,
  Reservation,
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reservations';

  createReservation(
    payload: CreateReservationPayload,
  ): Promise<Reservation> {
    return firstValueFrom(
      this.http.post<Reservation>(this.baseUrl, payload),
    );
  }

  getReservations(): Promise<Reservation[]> {
    return firstValueFrom(this.http.get<Reservation[]>(this.baseUrl));
  }

  getReservationById(id: string): Promise<Reservation> {
    return firstValueFrom(
      this.http.get<Reservation>(`${this.baseUrl}/${id}`),
    );
  }
}
