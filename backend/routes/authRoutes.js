import express from 'express'
import authController from '../controllers/authController.js'
import { registerValidation,loginValidation } from '../middleware/validate.js'
import { authenticate,refreshToken,authorize } from '../middleware/auth.js';

const router=express.Router();

//public routes
router.post('/register',registerValidation(),authController.register);
router.post('/login',loginValidation(),authController.login);
router.post('/refresh',refreshToken,authController.refresh);
router.post('/logout',authController.logout);


//protected routes
router.get('/profile',authController.getProfile);
router.get('/sessions',authenticate,authController.getSessions);
router.post('/revoke-all',authenticate,authController.revokeAllSessions);

router.get('/admin-only',authenticate,authorize('admin'),(req,res)=>{
    res.json({message:'Welcome admin !'});
})
export default router;