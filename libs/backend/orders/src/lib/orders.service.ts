import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@restaurant-os/database';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { KitchenGateway } from '@restaurant-os/kitchen';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kitchenGateway: KitchenGateway,
    private readonly orderGateway: OrderGateway,
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
    const order = await this.prisma.order.create({
      data: {
        userId,
        orderType: dto.orderType,
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
    this.kitchenGateway.emitOrderCreated({ id: order.id });

    return order;
  }

  private canSeeAllOrders(roles: string[]): boolean {
    return roles.some((role) => role === 'ADMIN' || role === 'KITCHEN');
  }

  async getOrders(userId: string, roles: string[]) {
    return this.prisma.order.findMany({
      where: this.canSeeAllOrders(roles) ? {} : { userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(id: string, userId: string, roles: string[]) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    // Someone else's order gets the same 404 as a missing one, so the
    // endpoint cannot be used to find out which order ids exist.
    if (!order || (order.userId !== userId && !this.canSeeAllOrders(roles))) {
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
    this.orderGateway.emitStatusChangedToOwner(updated.userId, {
      id: updated.id,
      status: updated.status,
      cancelReason: updated.cancelReason,
    });

    return updated;
  }
}
