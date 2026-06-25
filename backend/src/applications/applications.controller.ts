import {
  Body, Controller, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Document Requests')
@ApiBearerAuth()
@Controller({ path: 'applications', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new document request' })
  @ApiResponse({ status: 201, description: 'Application created with auto tracking number' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your own document requests' })
  @ApiResponse({ status: 200, description: 'Array of applications for this citizen' })
  async findAll(@CurrentUser('userId') userId: string) {
    return this.applicationsService.findAllForUser(userId);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] List every document request in the system' })
  @ApiResponse({ status: 200, description: 'All applications across all citizens' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async findAllAdmin() {
    return this.applicationsService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single document request (owner or admin)' })
  @ApiResponse({ status: 200, description: 'Application detail' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.applicationsService.findOneForUser(id, userId, role);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Update a document request status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, dto);
  }
}
