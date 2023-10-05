import express from 'express'
const router= express.Router();
import upload from '../middleware/multer'
import { userSignup,verifyOtp,userLogin,writeBlog,articleBlog,categories,userArticle,userProfile,createlike,getLike,Editarticle,updateArticle,DeleteArticle } from '../controller/userController';
import verifyLogin from '../middleware/authuser'

router.post('/signup',userSignup)

router.post('/otp',verifyOtp)

router.post('/login',userLogin)

router.post("/write",upload.single('file'),verifyLogin, writeBlog)

router.get("/articles",articleBlog)

router.get('/category',categories)

router.put('/like/:id',verifyLogin, createlike)

router.get('like/:id', getLike)

router.get('/article/:id',userArticle)

router.get('/profile',verifyLogin,userProfile)

router.get('/edit-article/:articleId',verifyLogin, Editarticle)

router.put('/update-article',upload.single('file'),verifyLogin,updateArticle)

router.put('/delete-article/:articleId',verifyLogin,DeleteArticle)

export { router as UserRouter };
