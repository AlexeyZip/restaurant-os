import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@restaurant-os/database';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { UpdateReservationStatusDto } from '../dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReservation(userId: string, dto: CreateReservationDto) {
    const table = await this.prisma.table.findUniqueOrThrow({
      where: { id: dto.tableId },
    });
    if (!table.active) {
      throw new BadRequestException('Table is not active');
    }
    if (table.capacity < dto.guestCount) {
      throw new BadRequestException('Table capacity is not enough');
    }
    const overlap = await this.prisma.reservation.findFirst({
      where: {
        tableId: dto.tableId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        AND: [
          { startsAt: { lt: dto.endsAt } },
          { endsAt: { gt: dto.startsAt } },
        ],
      },
    });
    if (overlap) {
      throw new BadRequestException('Table is already reserved for this time');
    }

    return this.prisma.reservation.create({
      data: {
        userId,
        tableId: dto.tableId,
        guestCount: dto.guestCount,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
        notes: dto.notes,
      },
    });
  }

  async getReservations(userId: string, roles: string[]) {
    const isAdmin = roles.includes('ADMIN');
    return this.prisma.reservation.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        table: true,
      },
    });
  }

  async getReservationById(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async updateReservationStatus(id: string, dto: UpdateReservationStatusDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: dto.status,
        cancelReason: dto.cancelReason,
      },
    });
  }
}
