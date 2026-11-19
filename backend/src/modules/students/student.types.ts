import { StudentStatus, Role } from '@prisma/client';

export interface StudentQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  department?: string;
  sortBy?: 'createdAt' | 'name' | 'studentCode' | 'rollNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateStudentInput {
  // User info
  name: string;
  email: string;
  password?: string;
  
  // Student profile
  studentCode: string;
  phone: string;
  department: string;
  rollNumber: string;
  session: string;
  batch: string;
  bloodGroup?: string;
  address: string;
  dateOfBirth?: string;

  // Primary Guardian
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  emergencyContact?: string;
}

export interface UpdateStudentInput {
  name?: string;
  phone?: string;
  department?: string;
  rollNumber?: string;
  session?: string;
  batch?: string;
  bloodGroup?: string;
  address?: string;
  dateOfBirth?: string;

  // Guardian update
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  emergencyContact?: string;
}

export interface StudentResponseData {
  id: string;
  studentCode: string;
  phone: string;
  department: string;
  rollNumber: string;
  session: string;
  batch: string;
  bloodGroup: string | null;
  address: string;
  dateOfBirth: Date | null;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: string;
  };
  guardians: Array<{
    id: string;
    name: string;
    relationship: string;
    phone: string;
    emergencyContact: string | null;
  }>;
  activeAllocation?: {
    id: string;
    startDate: Date;
    room: {
      roomNumber: string;
      floor: number;
      roomType: string;
    };
    bed: {
      bedCode: string;
    };
  } | null;
}
