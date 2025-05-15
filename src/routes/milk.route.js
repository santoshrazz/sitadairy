import { Router } from 'express'
import { createMilkEntry } from '../controllers/milk.controller.js';
import { isAdmin, verifyUserToken } from '../middleware/userVerify.middeware.js';

const milkRouter = Router();

milkRouter.post('/create', verifyUserToken, isAdmin, createMilkEntry);
// milkRouter.post('/create', verifyUserToken, isAdmin, createMilkEntry);

export { milkRouter }