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
import { JwtAuthGuard } from '@restaurant-os/auth';
import { UpdateDishDto } from './dto/update-dish.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  getCategories() {
    return this.menuService.getCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('categories')
  createCategory(@Body() body: CreateCategoryDto) {
    return this.menuService.createCategory(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.menuService.updateCategory(id, body);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('dishes')
  createDish(@Body() body: CreateDishDto) {
    return this.menuService.createDish(body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('dishes/:id')
  updateDish(@Param('id') id: string, @Body() body: UpdateDishDto) {
    return this.menuService.updateDish(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('dishes/:id')
  deleteDish(@Param('id') id: string) {
    return this.menuService.deleteDish(id);
  }
}
