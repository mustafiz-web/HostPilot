import bcrypt from 'bcryptjs';
import { Prisma, Role, StudentStatus, UserStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/app-error';
import { CreateStudentInput, StudentQueryFilters, UpdateStudentInput } from './student.types';

export class StudentService {
  /**
   * Atomic creation of Student, User credentials, and primary Guardian record
   */
  public async createStudent(input: CreateStudentInput) {
    // 1. Check for duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw AppError.conflict('এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে (Email already registered)');
    }

    // 2. Check for duplicate student code
    const existingCode = await prisma.student.findUnique({
      where: { studentCode: input.studentCode.trim() },
    });
    if (existingCode) {
      throw AppError.conflict('এই স্টুডেন্ট আইডি কোড ইতিমধ্যে ব্যবহৃত হয়েছে (Student code already in use)');
    }

    // 3. Hash password
    const rawPassword = input.password || 'Student#Dev2026!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // 4. Atomic Prisma Transaction
    const newStudent = await prisma.$transaction(async (tx) => {
      // Step A: Create User
      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email: input.email.toLowerCase().trim(),
          passwordHash,
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
        },
      });

      // Step B: Create Student Profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentCode: input.studentCode.trim(),
          phone: input.phone.trim(),
          department: input.department.trim(),
          rollNumber: input.rollNumber.trim(),
          session: input.session.trim(),
          batch: input.batch.trim(),
          bloodGroup: input.bloodGroup?.trim() || null,
          address: input.address.trim(),
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          status: StudentStatus.ACTIVE,
        },
      });

      // Step C: Create Primary Guardian
      await tx.guardian.create({
        data: {
          studentId: student.id,
          name: input.guardianName.trim(),
          relationship: input.guardianRelation.trim(),
          phone: input.guardianPhone.trim(),
          emergencyContact: input.emergencyContact?.trim() || input.guardianPhone.trim(),
        },
      });

      return student;
    });

    return this.getStudentById(newStudent.id);
  }

  /**
   * Paginated & filtered list of students (Admin only)
   */
  public async getStudents(filters: StudentQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.department) {
      where.department = { contains: filters.department };
    }

    if (filters.search) {
      const term = filters.search.trim();
      where.OR = [
        { studentCode: { contains: term } },
        { rollNumber: { contains: term } },
        { department: { contains: term } },
        { user: { name: { contains: term } } },
        { user: { email: { contains: term } } },
      ];
    }

    const orderBy: Prisma.StudentOrderByWithRelationInput = {};
    if (filters.sortBy === 'name') {
      orderBy.user = { name: filters.sortOrder || 'asc' };
    } else if (filters.sortBy === 'studentCode') {
      orderBy.studentCode = filters.sortOrder || 'asc';
    } else if (filters.sortBy === 'rollNumber') {
      orderBy.rollNumber = filters.sortOrder || 'asc';
    } else {
      orderBy.createdAt = filters.sortOrder || 'desc';
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, status: true },
          },
          guardians: {
            select: { id: true, name: true, relationship: true, phone: true, emergencyContact: true },
          },
          allocations: {
            where: { status: 'ACTIVE' },
            take: 1,
            include: {
              bed: {
                include: {
                  room: {
                    select: { roomNumber: true, floor: true, roomType: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    const formatted = students.map((s) => ({
      id: s.id,
      studentCode: s.studentCode,
      phone: s.phone,
      department: s.department,
      rollNumber: s.rollNumber,
      session: s.session,
      batch: s.batch,
      bloodGroup: s.bloodGroup,
      address: s.address,
      dateOfBirth: s.dateOfBirth,
      status: s.status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      user: s.user,
      guardians: s.guardians,
      activeAllocation: s.allocations[0]
        ? {
            id: s.allocations[0].id,
            startDate: s.allocations[0].startDate,
            room: s.allocations[0].bed.room,
            bed: { bedCode: s.allocations[0].bed.bedCode },
          }
        : null,
    }));

    return {
      items: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single student profile by studentId or userId
   */
  public async getStudentById(id: string) {
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, status: true },
        },
        guardians: {
          select: { id: true, name: true, relationship: true, phone: true, emergencyContact: true },
        },
        allocations: {
          where: { status: 'ACTIVE' },
          take: 1,
          include: {
            bed: {
              include: {
                room: {
                  select: { roomNumber: true, floor: true, roomType: true, monthlyRent: true },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw AppError.notFound('শিক্ষার্থীর রেকর্ড খুঁজে পাওয়া যায়নি (Student not found)');
    }

    return {
      id: student.id,
      studentCode: student.studentCode,
      phone: student.phone,
      department: student.department,
      rollNumber: student.rollNumber,
      session: student.session,
      batch: student.batch,
      bloodGroup: student.bloodGroup,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
      status: student.status,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      user: student.user,
      guardians: student.guardians,
      activeAllocation: student.allocations[0]
        ? {
            id: student.allocations[0].id,
            startDate: student.allocations[0].startDate,
            room: student.allocations[0].bed.room,
            bed: { bedCode: student.allocations[0].bed.bedCode },
          }
        : null,
    };
  }

  /**
   * Update student profile
   */
  public async updateStudent(id: string, input: UpdateStudentInput, isStudentSelf: boolean = false) {
    const student = await prisma.student.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { guardians: true },
    });

    if (!student) {
      throw AppError.notFound('Student record not found');
    }

    // If student is updating themselves, only permit allowed profile fields
    const dataToUpdate: Prisma.StudentUpdateInput = {};
    if (input.phone) dataToUpdate.phone = input.phone.trim();
    if (input.address) dataToUpdate.address = input.address.trim();
    if (input.bloodGroup) dataToUpdate.bloodGroup = input.bloodGroup.trim();

    // If Admin, also permit academic details update
    if (!isStudentSelf) {
      if (input.department) dataToUpdate.department = input.department.trim();
      if (input.rollNumber) dataToUpdate.rollNumber = input.rollNumber.trim();
      if (input.session) dataToUpdate.session = input.session.trim();
      if (input.batch) dataToUpdate.batch = input.batch.trim();
      if (input.dateOfBirth) dataToUpdate.dateOfBirth = new Date(input.dateOfBirth);
      if (input.name) {
        await prisma.user.update({
          where: { id: student.userId },
          data: { name: input.name.trim() },
        });
      }
    }

    // Guardian update if provided
    if (input.guardianName || input.guardianPhone || input.emergencyContact) {
      const primaryGuardian = student.guardians[0];
      if (primaryGuardian) {
        await prisma.guardian.update({
          where: { id: primaryGuardian.id },
          data: {
            name: input.guardianName?.trim() || primaryGuardian.name,
            relationship: input.guardianRelation?.trim() || primaryGuardian.relationship,
            phone: input.guardianPhone?.trim() || primaryGuardian.phone,
            emergencyContact: input.emergencyContact?.trim() || primaryGuardian.emergencyContact,
          },
        });
      }
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.student.update({
        where: { id: student.id },
        data: dataToUpdate,
      });
    }

    return this.getStudentById(student.id);
  }

  /**
   * Update student status (ACTIVE / INACTIVE / GRADUATED / EXPELLED)
   */
  public async updateStudentStatus(id: string, status: StudentStatus) {
    const student = await prisma.student.findFirst({
      where: { OR: [{ id }, { userId: id }] },
    });

    if (!student) {
      throw AppError.notFound('Student record not found');
    }

    await prisma.student.update({
      where: { id: student.id },
      data: { status },
    });

    // Also update associated user status
    const userStatus = status === 'ACTIVE' ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    await prisma.user.update({
      where: { id: student.userId },
      data: { status: userStatus },
    });

    return this.getStudentById(student.id);
  }
}

export const studentService = new StudentService();
