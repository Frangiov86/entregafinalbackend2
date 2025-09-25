import { Router } from 'express';
import { realizarCompra } from '../controllers/purchase.controller.js';
import { passportCall } from '../middlewares/tokensvalidacion.js';
import { requireRole } from '../middlewares/rolesusuarios.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.post('/:cid/purchase',
  passportCall('current'),
  requireRole('user'),
  asyncHandler(realizarCompra)
);

export default router;
