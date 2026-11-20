export interface RegisterStudentInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
  rollNumber: string;
  session: string;
  batch: string;
  bloodGroup?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  address: string;
  preferredRoomType?: 'SINGLE' | 'DOUBLE' | 'QUAD';
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  studentId?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STUDENT';
  status: string;
  studentId?: string;
  studentCode?: string;
  department?: string;
  rollNumber?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
