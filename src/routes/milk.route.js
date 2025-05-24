import { Router } from 'express'
import { createMilkEntry, deleteMilkEntry, getMilkEntriesByUser, updateMilkEntry, createMilkOrder, getMilkOrder } from '../controllers/milk.controller.js';
import { isAdmin, verifyUserToken } from '../middleware/userVerify.middeware.js';

const milkRouter = Router();

// Route for Admins
milkRouter.post('/create', verifyUserToken, isAdmin, createMilkEntry);
milkRouter.put('/update/:id', verifyUserToken, isAdmin, updateMilkEntry);
milkRouter.delete('/delete/:id', verifyUserToken, isAdmin, deleteMilkEntry);

// Route for User 
milkRouter.get('/get', verifyUserToken, getMilkEntriesByUser);
milkRouter.post('/order', verifyUserToken, createMilkOrder)
milkRouter.get('/order', verifyUserToken, getMilkOrder)

export { milkRouter }