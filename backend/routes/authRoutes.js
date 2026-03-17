import express from 'express'
import authController from '../controllers/authController.js'
import { registerValidation,loginValidation } from '../middleware/validate.js'

const router=express.Router();
router.post('/register',registerValidation(),authController.register);
router.post('/login',loginValidation(),authController.login);
router.get('/profile',authController.getProfile);

export default router;