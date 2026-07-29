import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MenuService } from './menu.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@restaurant-os/auth';
import { UpdateDishDto } from './dto/update-dish.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  getCategories() {
    return this.menuService.getCategories();
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('categories')
  createCategory(@Body() body: CreateCategoryDto) {
    return this.menuService.createCategory(body);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.menuService.updateCategory(id, body);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.menuService.deleteCategory(id);
  }

  @Get('dishes')
  getDishes(@Query('categoryId') categoryId?: string) {
    return this.menuService.getDishes(categoryId);
  }

  @Get('dishes/:id')
  getDishById(@Param('id') id: string) {
    return this.menuService.getDishById(id);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('dishes')
  createDish(@Body() body: CreateDishDto) {
    return this.menuService.createDish(body);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('dishes/:id')
  updateDish(@Param('id') id: string, @Body() body: UpdateDishDto) {
    return this.menuService.updateDish(id, body);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('dishes/:id')
  deleteDish(@Param('id') id: string) {
    return this.menuService.deleteDish(id);
  }
}
