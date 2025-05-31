import { Router } from 'express'
import { createSeller, dashboardData, getAllCustomerList, getAllSellerList, getSingleCustomerDetail, getSingleCustomerDetailAdmin, handleCreateUser, handleLoginUser, updateAdminPassword, updateUserDetails } from '../controllers/user.controller.js';
import { isAdmin, verifyUserToken } from '../middleware/userVerify.middeware.js'
import { createMilkOrder, deleteMilkOrder, getMilkOrder, updateMilkOrderStatus } from '../controllers/milk.controller.js';
import { upload } from '../utils/multer.js'
const userRoute = Router();

userRoute.route("/create").post(handleCreateUser)
userRoute.route('/login').post(handleLoginUser)
userRoute.route('/getSingleCustomerDetail').get(verifyUserToken, getSingleCustomerDetail)
userRoute.route('/get-user-profile/:id').get(verifyUserToken, isAdmin, getSingleCustomerDetailAdmin)
userRoute.route('/update').put(verifyUserToken, upload.single('profilePic'), updateUserDetails)
userRoute.route('/change-password').put(verifyUserToken, isAdmin, updateAdminPassword)

// Route for managing orders
userRoute.route('/order').post(verifyUserToken, createMilkOrder).get(verifyUserToken, getMilkOrder).put(verifyUserToken, isAdmin, updateMilkOrderStatus).delete(verifyUserToken, isAdmin, deleteMilkOrder)

userRoute.route('/dashboard').get(verifyUserToken, dashboardData)
// Admin related controller
userRoute.route('/all-customers').get(verifyUserToken, isAdmin, getAllCustomerList)


// Routes for Customer Sale
userRoute.route('/create-seller').get(verifyUserToken, isAdmin, createSeller)
userRoute.route('/get-all-seller').get(verifyUserToken, isAdmin, getAllSellerList)
export default userRoute