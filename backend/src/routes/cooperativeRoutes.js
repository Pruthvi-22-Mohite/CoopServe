import express from 'express';
import { getCooperativeOverview } from '../controllers/cooperativeController.js';

const router = express.Router();

router.get('/overview', getCooperativeOverview);
router.get('/stats', getCooperativeOverview);

export default router;
