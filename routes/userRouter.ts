import express from 'express'
const router= express.Router();
import upload from '../middleware/multer'
import { userSignup,verifyOtp,userLogin,writeBlog,articleBlog,categories,userArticle,userProfile,createlike,removeLike,Editarticle,updateArticle,DeleteArticle,addComment } from '../controller/userController';
import verifyLogin from '../middleware/authuser'
import { subscriptions,verifypayment } from '../controller/paymentcontroller';

router.post('/signup',userSignup)

router.post('/otp',verifyOtp)

router.post('/login',userLogin)

router.post("/write",upload.single('file'),verifyLogin, writeBlog)

router.get("/articles",articleBlog)

router.get('/category',categories)

router.put('/like/:id',verifyLogin, createlike)

router.put('removelike/:id', removeLike)

router.get('/article/:id',userArticle)

router.get('/profile',verifyLogin,userProfile)

router.get('/edit-article/:articleId',verifyLogin, Editarticle)

router.put('/update-article',upload.single('file'),verifyLogin,updateArticle)

router.put('/delete-article/:articleId',verifyLogin,DeleteArticle)

router.post('/create-subscription',verifyLogin,subscriptions)

router.post('/verifypayment',verifyLogin,verifypayment)

router.put('/comment/:id',verifyLogin,addComment)

export { router as UserRouter };
