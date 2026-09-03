import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@restaurant-os/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { KitchenGateway } from '@restaurant-os/kitchen';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    let totalPrice = 0;
    const itemsData = [];

    for (const item of dto.items) {
      const dish = await this.prisma.dish.findUniqueOrThrow({
        where: { id: item.dishId },
      });
      totalPrice += dish.basicPrice * item.quantity;
      itemsData.push({
        dishId: item.dishId,
        dishName: dish.name, // snapshot
        unitPrice: dish.basicPrice, // snapshot
        quantity: item.quantity,
      });
    }
    return this.prisma.order.create({
      data: {
        userId,
        orderType: dto.orderType,
        tableNumber: dto.tableNumber,
        deliveryAddress: dto.deliveryAddress,
        notes: dto.notes,
        scheduledFor: dto.scheduledFor,
        totalPrice,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });
  }

  async getOrders(userId: string, roles: string[]) {
    const isAdmin = roles.includes('ADMIN');

    return this.prisma.order.findMany({
      where: isAdmin ? {} : { userId },
      include: {
        items: true,
      },
    });
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: { ...dto },
    });
    this.kitchenGateway.emitOrderStatusChanged({
      id: updated.id,
      status: updated.status,
    });

    return updated;
  }
}
