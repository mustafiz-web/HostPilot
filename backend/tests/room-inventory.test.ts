import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/database';
import { authService } from '../src/modules/auth/auth.service';

describe('Room Stock-Out, Inventory & Bed Availability System (/api/v1/rooms & /api/v1/allocations)', () => {
  const adminToken = authService.generateToken({
    userId: 'user-admin-1',
    email: 'admin@hostpilot.dev',
    role: 'ADMIN',
  });

  const studentToken = authService.generateToken({
    userId: 'user-student-1',
    email: 'tanvir@campus.edu.bd',
    role: 'STUDENT',
    studentId: 'student-id-1',
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(authService, 'getUserById').mockImplementation(async (id: string) => {
      if (id === 'user-admin-1') {
        return {
          id: 'user-admin-1',
          email: 'admin@hostpilot.dev',
          name: 'Hostel Admin',
          role: 'ADMIN',
          status: 'ACTIVE',
        } as any;
      }
      if (id === 'user-student-1') {
        return {
          id: 'user-student-1',
          email: 'tanvir@campus.edu.bd',
          name: 'তানভীর আহমেদ',
          role: 'STUDENT',
          status: 'ACTIVE',
          studentId: 'student-id-1',
        } as any;
      }
      return null;
    });
  });

  describe('1. Room & Bed Inventory Calculation', () => {
    it('should return all rooms with inventory summary, bed identifiers and occupant details', async () => {
      vi.spyOn(prisma.room, 'findMany').mockResolvedValueOnce([
        {
          id: 'room-1',
          roomNumber: '101',
          floor: 1,
          capacity: 2,
          roomType: 'DOUBLE',
          monthlyRent: 4000 as any,
          status: 'AVAILABLE',
          beds: [
            {
              id: 'bed-1',
              roomId: 'room-1',
              bedCode: 'A',
              status: 'OCCUPIED',
              allocations: [
                {
                  id: 'alloc-1',
                  status: 'ACTIVE',
                  startDate: new Date('2026-01-01'),
                  student: {
                    id: 'student-id-1',
                    studentCode: 'HP-STU-2026-001',
                    rollNumber: '045',
                    department: 'CSE',
                    user: { id: 'u-1', name: 'তানভীর আহমেদ', email: 'tanvir@campus.edu.bd' },
                  },
                },
              ],
            },
            {
              id: 'bed-2',
              roomId: 'room-1',
              bedCode: 'B',
              status: 'AVAILABLE',
              allocations: [],
            },
          ],
        } as any,
      ]);

      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);

      const room = res.body.data[0];
      expect(room.roomNumber).toBe('101');
      expect(room.capacity).toBe(2);
      expect(room.occupiedBedsCount).toBe(1);
      expect(room.availableBedsCount).toBe(1);
      // Status should be PARTIALLY_OCCUPIED
      expect(room.status).toBe('PARTIALLY_OCCUPIED');

      // Check bed identifier & occupant
      expect(room.beds[0].identifier).toBe('101-A');
      expect(room.beds[0].status).toBe('OCCUPIED');
      expect(room.beds[0].occupant.studentName).toBe('তানভীর আহমেদ');

      expect(room.beds[1].identifier).toBe('101-B');
      expect(room.beds[1].status).toBe('AVAILABLE');
      expect(room.beds[1].occupant).toBeNull();

      // Check summary meta
      expect(res.body.meta.totalRooms).toBe(1);
      expect(res.body.meta.totalBeds).toBe(2);
      expect(res.body.meta.occupiedBeds).toBe(1);
      expect(res.body.meta.availableBeds).toBe(1);
    });

    it('should accurately designate a room as FULL / STOCK OUT when all beds are occupied', async () => {
      vi.spyOn(prisma.room, 'findMany').mockResolvedValueOnce([
        {
          id: 'room-2',
          roomNumber: '102',
          floor: 1,
          capacity: 1,
          roomType: 'SINGLE',
          monthlyRent: 6000 as any,
          status: 'AVAILABLE',
          beds: [
            {
              id: 'bed-3',
              roomId: 'room-2',
              bedCode: 'A',
              status: 'OCCUPIED',
              allocations: [{ id: 'alloc-2', status: 'ACTIVE', student: { user: { name: 'Student 2' } } }],
            },
          ],
        } as any,
      ]);

      const res = await request(app)
        .get('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].status).toBe('FULL');
      expect(res.body.data[0].availableBedsCount).toBe(0);
    });
  });

  describe('2. Allocation Business Rules & Concurrency Verification', () => {
    it('should REJECT allocation if the room is in MAINTENANCE or unavailable (409 Conflict)', async () => {
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          student: { findUnique: vi.fn().mockResolvedValue({ id: 'student-id-1', status: 'ACTIVE' }) },
          roomAllocation: {
            findFirst: vi.fn().mockResolvedValue(null),
          },
          bed: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'bed-maint',
              status: 'AVAILABLE',
              roomId: 'room-maint',
              room: { capacity: 2, status: 'MAINTENANCE' },
            }),
          },
        });
      });

      const res = await request(app)
        .post('/api/v1/allocations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-id-1',
          bedId: 'bed-maint',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toContain('এই রুমটি বর্তমানে বরাদ্দযোগ্য নয়');
    });

    it('should update room status to FULL automatically when the last bed is allocated', async () => {
      const mockRoomUpdate = vi.fn();
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          student: { findUnique: vi.fn().mockResolvedValue({ id: 'student-id-1', status: 'ACTIVE' }) },
          roomAllocation: {
            findFirst: vi.fn().mockResolvedValue(null),
            count: vi.fn().mockResolvedValue(1),
            create: vi.fn().mockResolvedValue({
              id: 'alloc-new',
              studentId: 'student-id-1',
              bedId: 'bed-2',
              status: 'ACTIVE',
            }),
          },
          bed: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'bed-2',
              status: 'AVAILABLE',
              roomId: 'room-1',
              room: { capacity: 2, status: 'AVAILABLE' },
            }),
            update: vi.fn().mockResolvedValue({ id: 'bed-2', status: 'OCCUPIED' }),
            count: vi.fn().mockResolvedValue(0), // 0 available beds left
          },
          room: {
            update: mockRoomUpdate,
          },
        });
      });

      const res = await request(app)
        .post('/api/v1/allocations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'student-id-1',
          bedId: 'bed-2',
        });

      expect(res.status).toBe(201);
      expect(mockRoomUpdate).toHaveBeenCalledWith({
        where: { id: 'room-1' },
        data: { status: 'FULL' },
      });
    });

    it('should release Bed and Room to AVAILABLE when allocation is vacated', async () => {
      const mockBedUpdate = vi.fn();
      const mockRoomUpdate = vi.fn();

      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          roomAllocation: {
            findUnique: vi.fn().mockResolvedValue({
              id: 'alloc-vacate-1',
              status: 'ACTIVE',
              bedId: 'bed-vacate',
              bed: { id: 'bed-vacate', roomId: 'room-vacate' },
            }),
            update: vi.fn().mockResolvedValue({
              id: 'alloc-vacate-1',
              status: 'VACATED',
              endDate: new Date(),
            }),
          },
          bed: {
            update: mockBedUpdate,
          },
          room: {
            update: mockRoomUpdate,
          },
        });
      });

      const res = await request(app)
        .patch('/api/v1/allocations/alloc-vacate-1/vacate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          endDate: new Date(),
        });

      expect(res.status).toBe(200);
      expect(mockBedUpdate).toHaveBeenCalledWith({
        where: { id: 'bed-vacate' },
        data: { status: 'AVAILABLE' },
      });
      expect(mockRoomUpdate).toHaveBeenCalledWith({
        where: { id: 'room-vacate' },
        data: { status: 'AVAILABLE' },
      });
    });
  });

  describe('3. Room Management CRUD & Business Rules Verification', () => {
    it('should create a new room with auto-generated beds', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          room: {
            create: vi.fn().mockResolvedValue({
              id: 'new-room-1',
              roomNumber: '301',
              floor: 3,
              capacity: 2,
              roomType: 'DOUBLE',
              monthlyRent: 4500,
              status: 'AVAILABLE',
              beds: [
                { id: 'b-1', bedCode: 'A', status: 'AVAILABLE' },
                { id: 'b-2', bedCode: 'B', status: 'AVAILABLE' },
              ],
            }),
          },
        });
      });

      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roomNumber: '301',
          floor: 3,
          capacity: 2,
          roomType: 'DOUBLE',
          monthlyRent: 4500,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomNumber).toBe('301');
      expect(res.body.data.beds).toHaveLength(2);
    });

    it('should REJECT capacity reduction below current active occupancy', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue({
        id: 'room-with-occ',
        roomNumber: '201',
        floor: 2,
        capacity: 3,
        beds: [
          { id: 'bed-1', allocations: [{ id: 'a-1', status: 'ACTIVE' }] },
          { id: 'bed-2', allocations: [{ id: 'a-2', status: 'ACTIVE' }] },
          { id: 'bed-3', allocations: [] },
        ],
      } as any);

      const res = await request(app)
        .patch('/api/v1/rooms/room-with-occ')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          capacity: 1, // trying to reduce to 1 when 2 beds are actively occupied
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('ধারণক্ষমতা 2 এর চেয়ে কম নির্ধারণ করা সম্ভব নয়');
    });

    it('should REJECT room deletion when room is occupied (has active allocations)', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue({
        id: 'room-occupied',
        roomNumber: '202',
        beds: [
          {
            id: 'bed-1',
            allocations: [{ id: 'alloc-active', status: 'ACTIVE' }],
          },
        ],
      } as any);

      const res = await request(app)
        .delete('/api/v1/rooms/room-occupied')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('রুমটিতে বর্তমানে শিক্ষার্থী সক্রিয় বরাদ্দে রয়েছে');
    });

    it('should REJECT room deletion when room has historical allocations (audit protection)', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue({
        id: 'room-history',
        roomNumber: '203',
        beds: [
          {
            id: 'bed-1',
            allocations: [{ id: 'alloc-old', status: 'COMPLETED' }],
          },
        ],
      } as any);

      const res = await request(app)
        .delete('/api/v1/rooms/room-history')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('অতীত বরাদ্দের অডিট রেকর্ড সংরক্ষিত রয়েছে');
    });

    it('should ALLOW safe deletion of empty room with no allocations', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue({
        id: 'room-empty',
        roomNumber: '999',
        beds: [
          { id: 'bed-e1', allocations: [] },
        ],
      } as any);

      const mockBedDeleteMany = vi.fn().mockResolvedValue({ count: 1 });
      const mockRoomDelete = vi.fn().mockResolvedValue({ id: 'room-empty' });

      vi.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
        return callback({
          bed: { deleteMany: mockBedDeleteMany },
          room: { delete: mockRoomDelete },
        });
      });

      const res = await request(app)
        .delete('/api/v1/rooms/room-empty')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockBedDeleteMany).toHaveBeenCalledWith({ where: { roomId: 'room-empty' } });
      expect(mockRoomDelete).toHaveBeenCalledWith({ where: { id: 'room-empty' } });
    });

    it('should retrieve room allocation history for audit trail', async () => {
      vi.spyOn(prisma.room, 'findUnique').mockResolvedValue({
        id: 'room-history',
        roomNumber: '101',
        floor: 1,
        capacity: 2,
        roomType: 'DOUBLE',
      } as any);

      vi.spyOn(prisma.roomAllocation, 'findMany').mockResolvedValue([
        {
          id: 'alloc-1',
          bed: { id: 'b-1', bedCode: 'A' },
          student: {
            id: 'stu-1',
            studentCode: 'HP-STU-001',
            rollNumber: '01',
            department: 'CSE',
            user: { id: 'u-1', name: 'কামাল হোসেন', email: 'kamal@test.com' },
          },
          allocatedByUser: { id: 'adm-1', name: 'Admin User', email: 'admin@hostpilot.com' },
          startDate: new Date('2026-01-01'),
          endDate: null,
          status: 'ACTIVE',
          createdAt: new Date('2026-01-01'),
        },
      ] as any);

      const res = await request(app)
        .get('/api/v1/rooms/room-history/history')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.allocations).toHaveLength(1);
      expect(res.body.data.allocations[0].studentName).toBe('কামাল হোসেন');
      expect(res.body.data.allocations[0].bedCode).toBe('A');
    });
  });
});
