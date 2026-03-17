import express from 'express';
import healthController from '../controllers/healthController.js';

const router=express.Router();

router.get('/',healthController.checkHealth);
router.get('/ping',healthController.ping);

export default router;