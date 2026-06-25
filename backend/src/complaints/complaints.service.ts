import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintsRepository: Repository<Complaint>,
  ) {}

  async create(userId: string, dto: CreateComplaintDto) {
    const complaint = this.complaintsRepository.create({
      userId,
      title: dto.title,
      category: dto.category,
      description: dto.description,
    });
    return this.complaintsRepository.save(complaint);
  }

  async findAllForUser(userId: string) {
    return this.complaintsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Admin-only: every complaint across every citizen, most recent first
  async findAllAdmin() {
    return this.complaintsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: string, userId: string, role?: UserRole) {
    const complaint = await this.complaintsRepository.findOne({ where: { id } });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }
    // Admins can view any complaint; citizens only their own
    if (role !== UserRole.ADMIN && complaint.userId !== userId) {
      throw new ForbiddenException('You do not have access to this complaint');
    }
    return complaint;
  }

  async updateStatus(id: string, dto: UpdateComplaintStatusDto) {
    const complaint = await this.complaintsRepository.findOne({ where: { id } });
    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }
    complaint.status = dto.status;
    if (dto.remarks !== undefined) {
      complaint.remarks = dto.remarks;
    }
    return this.complaintsRepository.save(complaint);
  }
}
