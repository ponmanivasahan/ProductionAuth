import express from 'express';
import oauthController from '../controllers/oauthController.js';
import {authenticate} from '../middleware/auth.js';
const router=express.Router();

router.get('/google',oauthController.googleAuth);
router.get('/google/callback',oauthController.googleCallback);

router.get('/hackclub',oauthController.hackclubAuth);
router.get('/hackclub/callback',oauthController.hackclubCallback);

router.get('/accounts',authenticate,oauthController.getConnectedAccounts);
router.delete('/accounts/:provider',authenticate,oauthController.disconnectAccount);
router.post('/link/:provider',authenticate,oauthController.linkAccount);

export default router;