import { Router } from 'express';
import { noticeController } from './notice.controller';
import { createNoticeSchema, updateNoticeSchema } from './notice.schema';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authorize } from '../../middlewares/authorize.middleware';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

// Optional authentication: public can view published notices, authenticated users also can
router.get('/', (req, res, next) => noticeController.getNotices(req, res, next));
router.get('/:id', (req, res, next) => noticeController.getNoticeById(req, res, next));

// Admin Protected Actions
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createNoticeSchema),
  (req, res, next) => noticeController.createNotice(req, res, next)
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateNoticeSchema),
  (req, res, next) => noticeController.updateNotice(req, res, next)
);

export const noticeRoutes = router;
