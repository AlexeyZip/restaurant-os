import { Table } from './table.model';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED';

export interface CreateReservationPayload {
  tableId: string;
  guestCount: number;
  startsAt: string;
  endsAt?: string;
  notes?: string;
}

export interface Reservation extends CreateReservationPayload {
  id: string;
  userId: string;
  status: ReservationStatus;
  cancelReason?: string;
  table?: Table;
}
