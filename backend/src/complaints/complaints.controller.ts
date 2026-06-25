import {
  Body, Controller, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Complaints')
@ApiBearerAuth()
@Controller({ path: 'complaints', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'File a new complaint' })
  @ApiResponse({ status: 201, description: 'Complaint created with auto tracking number' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateComplaintDto,
  ) {
    return this.complaintsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your own complaints' })
  @ApiResponse({ status: 200, description: 'Array of complaints for this citizen' })
  async findAll(@CurrentUser('userId') userId: string) {
    return this.complaintsService.findAllForUser(userId);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] List every complaint in the system' })
  @ApiResponse({ status: 200, description: 'All complaints across all citizens' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async findAllAdmin() {
    return this.complaintsService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single complaint (owner or admin)' })
  @ApiResponse({ status: 200, description: 'Complaint detail' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.complaintsService.findOneForUser(id, userId, role);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '[Admin] Update a complaint status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateStatus(id, dto);
  }
}
