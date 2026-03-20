import express from 'express'
import authController from '../controllers/authController.js'
import validate, { registerValidation,loginValidation } from '../middleware/validate.js'
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
router.post('/forgot-password',validate({required:['email'],email:true}),authController.forgotPassword);
router.get('/reset-password',authController.resetPasswordFromLink);
router.post('/reset-password',validate({required:['token','newPassword'],password:true}),authController.resetPassword);
router.post('/send-verification',validate({required:['email'],email:true}),authController.sendVerificationEmail);
router.get('/verify-email',authController.verifyEmailFromLink);
router.post('/verify-email',validate({required:['token']}),authController.verifyEmail);
router.get('/verification-status',authenticate,authController.checkVerificationStatus);

router.get('/admin-only',authenticate,authorize('admin'),(req,res)=>{
    res.json({message:'Welcome admin !'});
})
export default router;