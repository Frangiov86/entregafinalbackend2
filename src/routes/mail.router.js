import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { enviarMailPrueba } from '../controllers/mail.controller.js';

const router = Router();
router.post('/test', asyncHandler(enviarMailPrueba));
export default router;
