import { Router } from 'express'
import { handleCreateUser, handleLoginUser } from '../controllers/user.controller.js';
const userRoute = Router();

userRoute.route("/create").post(handleCreateUser)
userRoute.route('/login').post(handleLoginUser)

export default userRoute