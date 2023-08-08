import express from 'express'
const router= express.Router();
import { userSignup,verifyOtp,userLogin,writeBlog,articleBlog } from '../controller/userController';

router.post('/signup',userSignup)

router.post('/otp',verifyOtp)

router.post('/login',userLogin)

router.post("/wrirte",writeBlog)

router.get("/articles",articleBlog)

export { router as UserRouter };