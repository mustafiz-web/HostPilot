import { Router } from 'express';
import { noticeController } from './notice.controller';
import { createNoticeSchema, updateNoticeSchema } from './notice.schema';
import { authenticate, optionalAuthenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// 1. List Notices (Public / Student: Published & Active; Admin: All)
router.get('/', optionalAuthenticate, (req, res, next) => noticeController.getNotices(req, res, next));

// 2. View Notice Details
router.get('/:id', optionalAuthenticate, (req, res, next) => noticeController.getNoticeById(req, res, next));

// 3. Create Notice (Admin Only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createNoticeSchema),
  (req, res, next) => noticeController.createNotice(req, res, next)
);

// 4. Update Notice (Admin Only)
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateNoticeSchema),
  (req, res, next) => noticeController.updateNotice(req, res, next)
);

// 5. Toggle Publish Status (Admin Only)
router.patch(
  '/:id/toggle-publish',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => noticeController.togglePublish(req, res, next)
);

// 6. Delete Notice (Admin Only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  (req, res, next) => noticeController.deleteNotice(req, res, next)
);

export const noticeRoutes = router;
