import { Router } from 'express'
import { dashboardData, getAllCustomerList, getSingleCustomerDetail, getSingleCustomerDetailAdmin, handleCreateUser, handleLoginUser, updateAdminPassword, updateUserDetails } from '../controllers/user.controller.js';
import { isAdmin, verifyUserToken } from '../middleware/userVerify.middeware.js'
import { createMilkOrder, deleteMilkOrder, getMilkOrder, updateMilkOrderStatus } from '../controllers/milk.controller.js';
const userRoute = Router();

userRoute.route("/create").post(handleCreateUser)
userRoute.route('/login').post(handleLoginUser)
userRoute.route('/getSingleCustomerDetail').get(getSingleCustomerDetail)
userRoute.route('/get-user-profile/:id').get(getSingleCustomerDetailAdmin)
userRoute.route('/update').put(verifyUserToken, updateUserDetails)
userRoute.route('/change-password').put(verifyUserToken, isAdmin, updateAdminPassword)

// Route for managing orders
userRoute.route('/order').post(verifyUserToken, createMilkOrder).get(verifyUserToken, getMilkOrder).put(verifyUserToken, isAdmin, updateMilkOrderStatus).delete(verifyUserToken, isAdmin, deleteMilkOrder)

userRoute.route('/dashboard').get(verifyUserToken, dashboardData)
// Admin related controller
userRoute.route('/all-customers').get(verifyUserToken, isAdmin, getAllCustomerList)

export default userRoute