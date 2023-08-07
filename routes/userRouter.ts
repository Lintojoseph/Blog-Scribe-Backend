import express from 'express'
const router= express.Router();
import { userSignup,verifyOtp,userLogin } from '../controller/userController';

router.post('/signup',userSignup)

router.post('/otp',verifyOtp)

router.post('/login',userLogin)

export { router as UserRouter };