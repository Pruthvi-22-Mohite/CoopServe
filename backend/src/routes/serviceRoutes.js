import express from 'express';
import { getCategories, getServices, getServiceById } from '../controllers/serviceController.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getServiceById);

export default router;
