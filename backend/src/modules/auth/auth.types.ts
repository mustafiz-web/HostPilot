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
