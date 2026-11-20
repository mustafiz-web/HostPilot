import { Router } from 'express';
import { roomController } from './room.controller';
import { createRoomSchema, updateRoomSchema, addBedSchema, updateBedSchema } from './room.schema';
import { authenticate, optionalAuthenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. List All Rooms (Public, Student, Admin)
router.get('/', optionalAuthenticate, (req, res, next) => roomController.getRooms(req, res, next));

// 2. Room Details
router.get('/:id', optionalAuthenticate, (req, res, next) => roomController.getRoomById(req, res, next));

// 3. Room Allocation History (Admin Only)
router.get(
  '/:id/history',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => roomController.getRoomAllocationHistory(req, res, next)
);

// 4. Create Room (Admin Only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createRoomSchema),
  (req, res, next) => roomController.createRoom(req, res, next)
);

// 5. Update Room Details (Admin Only)
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateRoomSchema),
  (req, res, next) => roomController.updateRoom(req, res, next)
);

// 6. Delete Room (Admin Only - Safe Deletion)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => roomController.deleteRoom(req, res, next)
);

// 7. Add Bed to Room (Admin Only)
router.post(
  '/:roomId/beds',
  authenticate,
  authorize('ADMIN'),
  validate(addBedSchema),
  (req, res, next) => roomController.addBed(req, res, next)
);

// 8. Update Bed (Admin Only)
router.patch(
  '/:roomId/beds/:bedId',
  authenticate,
  authorize('ADMIN'),
  validate(updateBedSchema),
  (req, res, next) => roomController.updateBed(req, res, next)
);

// 9. Delete Bed (Admin Only - Safe Deletion)
router.delete(
  '/:roomId/beds/:bedId',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => roomController.deleteBed(req, res, next)
);

export const roomRoutes = router;
