import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@restaurant-os/database';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  async createTable(dto: CreateTableDto) {
    return this.prisma.table.create({
      data: {
        number: dto.number,
        capacity: dto.capacity,
        active: dto.active,
      },
    });
  }

  async getTables() {
    return this.prisma.table.findMany({
      where: { active: true },
    });
  }

  async getTableById(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return table;
  }

  async updateTable(id: string, dto: UpdateTableDto) {
    const table = await this.prisma.table.findUnique({
      where: { id },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return this.prisma.table.update({
      where: { id },
      data: {
        number: dto.number,
        capacity: dto.capacity,
        active: dto.active,
      },
    });
  }

  async deleteTable(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
    });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return this.prisma.table.delete({
      where: { id },
    });
  }
}
