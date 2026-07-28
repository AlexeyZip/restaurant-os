import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@restaurant-os/database';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.menuCategory.findMany({
      orderBy: { order: 'asc' },
      include: { dishes: true },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.menuCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }
    return this.prisma.menuCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return this.prisma.menuCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return this.prisma.menuCategory.delete({ where: { id } });
  }

  async getDishes(categoryId?: string) {
    return this.prisma.dish.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDishById(id: string) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!dish) {
      throw new NotFoundException(`Dish ${id} not found`);
    }
    return dish;
  }

  async createDish(dto: CreateDishDto) {
    const category = await this.prisma.menuCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category ${dto.categoryId} not found`);
    }
    return this.prisma.dish.create({ data: dto });
  }

  async updateDish(id: string, dto: UpdateDishDto) {
    const dish = await this.prisma.dish.findUnique({ where: { id } });
    if (!dish) {
      throw new NotFoundException(`Dish ${id} not found`);
    }
    return this.prisma.dish.update({ where: { id }, data: dto });
  }

  async deleteDish(id: string) {
    const dish = await this.prisma.dish.findUnique({ where: { id } });
    if (!dish) {
      throw new NotFoundException(`Dish ${id} not found`);
    }
    return this.prisma.dish.delete({ where: { id } });
  }
}
