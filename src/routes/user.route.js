import { Router } from 'express'
import { getAllCustomerList, getSingleCustomerDetail, handleCreateUser, handleLoginUser, updateAdminPassword, updateUserDetails } from '../controllers/user.controller.js';
import { isAdmin, verifyUserToken } from '../middleware/userVerify.middeware.js'
const userRoute = Router();

userRoute.route("/create").post(handleCreateUser)
userRoute.route('/login').post(handleLoginUser)
userRoute.route('/getSingleCustomerDetail/:id').get(getSingleCustomerDetail)
userRoute.route('/update').put(verifyUserToken, updateUserDetails)
userRoute.route('/change-password').put(verifyUserToken, isAdmin, updateAdminPassword)

// Admin related controller
userRoute.route('/all-customers').get(verifyUserToken, isAdmin, getAllCustomerList)

export default userRoute