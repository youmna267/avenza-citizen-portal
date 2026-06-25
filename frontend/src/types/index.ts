export type UserRole = 'CITIZEN' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  cnic?: string;
  address?: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
}

export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED';

export interface Complaint {
  id: string;
  trackingNo: string;
  title: string;
  category: string;
  description: string;
  status: ComplaintStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationType =
  | 'BIRTH_CERTIFICATE'
  | 'DOMICILE_CERTIFICATE'
  | 'CHARACTER_CERTIFICATE';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export interface Application {
  id: string;
  trackingNo: string;
  type: ApplicationType;
  applicantName: string;
  purpose?: string;
  status: ApplicationStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}
