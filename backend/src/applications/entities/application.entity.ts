import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ApplicationType {
  BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
  DOMICILE_CERTIFICATE = 'DOMICILE_CERTIFICATE',
  CHARACTER_CERTIFICATE = 'CHARACTER_CERTIFICATE',
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'tracking_no', unique: true, length: 20 })
  trackingNo: string;

  @Column({ type: 'enum', enum: ApplicationType })
  type: ApplicationType;

  @Column({ name: 'applicant_name', length: 150 })
  applicantName: string;

  @Column({ nullable: true, type: 'text' })
  purpose: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @Column({ nullable: true, type: 'text' })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
