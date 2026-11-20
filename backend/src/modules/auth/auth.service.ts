import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../utils/app-error';
import { AuthenticatedUser, JwtPayload, RegisterStudentInput } from './auth.types';

export class AuthService {
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  public verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw AppError.unauthorized('Invalid or expired authentication token');
    }
  }

  public async authenticateUser(email: string, password: string): Promise<{ user: AuthenticatedUser; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        student: true,
      },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw AppError.forbidden(
        'Your account is currently inactive or suspended. Please contact administration. (আপনার অ্যাকাউন্টটি বর্তমানে অনুমোদনের অপেক্ষায় অথবা নিষ্ক্রিয় রয়েছে)'
      );
    }

    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student?.id,
    };

    const token = this.generateToken(payload);

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      studentId: user.student?.id,
      studentCode: user.student?.studentCode,
      department: user.student?.department,
      rollNumber: user.student?.rollNumber,
    };

    return { user: authenticatedUser, token };
  }

  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User account not found');
    }

    const isMatch = await this.comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw AppError.badRequest('বর্তমান পাসওয়ার্ডটি সঠিক নয় (Incorrect current password)');
    }

    const newHash = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  public async getUserById(userId: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
      },
    });

    if (!user) {
      throw AppError.notFound('User account not found');
    }

    if (user.status !== 'ACTIVE') {
      throw AppError.forbidden('Your account is currently inactive or suspended.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      studentId: user.student?.id,
      studentCode: user.student?.studentCode,
      department: user.student?.department,
      rollNumber: user.student?.rollNumber,
    };
  }

  /**
   * Public student registration workflow:
   * 1. Checks duplicate email
   * 2. Hashes password securely
   * 3. Atomically creates User, Student profile, Guardian, and Admission record
   * 4. Account receives PENDING / INACTIVE status until Admin approves
   */
  public async registerStudent(input: RegisterStudentInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });

    if (existing) {
      throw AppError.conflict(
        'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে (Email already registered)'
      );
    }

    const passwordHash = await this.hashPassword(input.password);
    const count = await prisma.student.count();
    const admCount = await prisma.admission.count();
    const year = new Date().getFullYear();
    const studentCode = `HP-STU-${year}-${String(count + 1).padStart(3, '0')}`;
    const applicationNumber = `HP-ADM-${year}-${String(admCount + 1).padStart(4, '0')}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. User credentials (status: INACTIVE = Pending Admin Approval)
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: input.email.toLowerCase().trim(),
          passwordHash,
          role: 'STUDENT',
          status: 'INACTIVE',
        },
      });

      // 2. Student profile (status: INACTIVE = Pending Admin Approval)
      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentCode,
          phone: input.phone.trim(),
          department: input.department?.trim() || 'General',
          rollNumber: input.rollNumber?.trim() || studentCode,
          session: input.session?.trim() || String(year),
          batch: input.batch?.trim() || String(year).slice(-2),
          bloodGroup: input.bloodGroup?.trim() || null,
          address: input.address?.trim() || 'Hostel Applicant',
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          status: 'INACTIVE',
        },
      });

      // 3. Primary Guardian
      await tx.guardian.create({
        data: {
          studentId: student.id,
          name: input.guardianName?.trim() || 'Guardian',
          relationship: input.guardianRelation?.trim() || 'Parent',
          phone: input.guardianPhone?.trim() || input.phone.trim(),
          emergencyContact: input.guardianPhone?.trim() || input.phone.trim(),
        },
      });

      // 4. Admission record (status: PENDING)
      const admission = await tx.admission.create({
        data: {
          applicationNumber,
          applicantName: input.name.trim(),
          email: input.email.toLowerCase().trim(),
          phone: input.phone.trim(),
          gender: input.gender || 'MALE',
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : new Date(),
          bloodGroup: input.bloodGroup?.trim() || null,
          address: input.address?.trim() || 'Hostel Applicant',
          preferredRoomType: input.preferredRoomType || 'DOUBLE',
          guardianName: input.guardianName?.trim() || 'Guardian',
          guardianRelation: input.guardianRelation?.trim() || 'Parent',
          guardianPhone: input.guardianPhone?.trim() || input.phone.trim(),
          status: 'PENDING',
          studentId: student.id,
        },
      });

      return {
        userId: user.id,
        studentId: student.id,
        studentCode,
        applicationNumber,
        name: user.name,
        email: user.email,
        status: 'PENDING',
      };
    });

    return result;
  }
}

export const authService = new AuthService();
