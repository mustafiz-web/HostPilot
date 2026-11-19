import { Router } from 'express';
import { roomController } from './room.controller';
import { createRoomSchema, addBedSchema } from './room.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. List All Rooms (Authenticated: Admin or Student)
router.get('/', authenticate, (req, res, next) => roomController.getRooms(req, res, next));

// 2. Room Details
router.get('/:id', authenticate, (req, res, next) => roomController.getRoomById(req, res, next));

// 3. Create Room (Admin Only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createRoomSchema),
  (req, res, next) => roomController.createRoom(req, res, next)
);

// 4. Add Bed to Room (Admin Only)
router.post(
  '/:roomId/beds',
  authenticate,
  authorize('ADMIN'),
  validate(addBedSchema),
  (req, res, next) => roomController.addBed(req, res, next)
);

export const roomRoutes = router;
