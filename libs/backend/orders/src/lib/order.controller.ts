import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from '@restaurant-os/auth';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getOrders(@CurrentUser() user: { userId: string; roles: string[] }) {
    return this.orderService.getOrders(user.userId, user.roles);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateOrderStatus(id, dto);
  }
}
