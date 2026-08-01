import { TableService } from '../services/table.service';
import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard, Roles, RolesGuard } from '@restaurant-os/auth';
import { CreateTableDto } from '../dto/create-table.dto';
import { UpdateTableDto } from '../dto/update-table.dto';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  createTable(@Body() dto: CreateTableDto) {
    return this.tableService.createTable(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getTables() {
    return this.tableService.getTables();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getTableById(@Param('id') id: string) {
    return this.tableService.getTableById(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateTable(@Param('id') id: string, @Body() dto: UpdateTableDto) {
    return this.tableService.updateTable(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteTable(@Param('id') id: string) {
    return this.tableService.deleteTable(id);
  }
}
