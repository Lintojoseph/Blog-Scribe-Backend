import express from 'express'
const router=express.Router()
import verifyAdminLogin from '../middleware/authadmin';
import {adminLogin,getdetailsDashboard,getusers,blockusers,unblockusers,getAllArticles,getstatics} from '../controller/adminController'
import Pagination from '../middleware/pagination';

router.post('/login',adminLogin)
// router.get('/isAdminAuth',verifyAdminLogin,authAdmin)

router.get('/dashboard',getdetailsDashboard)

router.get('/users',getusers)

router.get('/block-user/:userId',blockusers)

router.get('/unblock-user/:userId',unblockusers)

router.get('/articles',Pagination(), getAllArticles)

router.get('/statics',getstatics)
export { router as AdminRouter };