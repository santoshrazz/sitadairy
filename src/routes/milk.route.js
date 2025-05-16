import { Router } from 'express'
import { createMilkEntry, deleteMilkEntry, getMilkEntriesByUser, updateMilkEntry } from '../controllers/milk.controller.js';
import { isAdmin, verifyUserToken } from '../middleware/userVerify.middeware.js';

const milkRouter = Router();

milkRouter.post('/create', verifyUserToken, isAdmin, createMilkEntry);
milkRouter.put('/update/:id', verifyUserToken, isAdmin, updateMilkEntry);
milkRouter.get('/get', verifyUserToken, isAdmin, getMilkEntriesByUser);
milkRouter.delete('/delete/:id', verifyUserToken, isAdmin, deleteMilkEntry);

export { milkRouter }