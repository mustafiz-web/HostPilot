import { AdmissionStatus, Gender, RoomType } from '@prisma/client';

export interface CreateAdmissionInput {
  applicantName: string;
  email: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string | Date;
  bloodGroup?: string;
  address: string;
  preferredRoomType: RoomType;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
}

export interface UpdateAdmissionStatusInput {
  status: AdmissionStatus;
  decisionNote?: string;
}

export interface AdmissionQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdmissionStatus;
  preferredRoomType?: RoomType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
