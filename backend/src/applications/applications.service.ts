import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
  ) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const application = this.applicationsRepository.create({
      userId,
      type: dto.type,
      applicantName: dto.applicantName,
      purpose: dto.purpose,
    });
    return this.applicationsRepository.save(application);
  }

  async findAllForUser(userId: string) {
    return this.applicationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin-only: every document request across every citizen, most recent first
  async findAllAdmin() {
    return this.applicationsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: string, userId: string, role?: UserRole) {
    const application = await this.applicationsRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    if (role !== UserRole.ADMIN && application.userId !== userId) {
      throw new ForbiddenException('You do not have access to this application');
    }
    return application;
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const application = await this.applicationsRepository.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    application.status = dto.status;
    if (dto.remarks !== undefined) {
      application.remarks = dto.remarks;
    }
    return this.applicationsRepository.save(application);
  }
}
