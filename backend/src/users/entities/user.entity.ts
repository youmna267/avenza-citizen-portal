import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Complaint } from '../../complaints/entities/complaint.entity';
import { Application } from '../../applications/entities/application.entity';

export enum UserRole {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, unique: true, length: 20 })
  cnic: string;

  @Column({ name: 'password_hash', type: 'text' })
  @Exclude() // Never serialize the hash back to clients
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CITIZEN })
  role: UserRole;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaints: Complaint[];

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];
}
