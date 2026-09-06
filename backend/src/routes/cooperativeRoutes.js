import express from 'express';
import {
  getCooperativeOverview,
  castCooperativeVote,
  getCooperativeVotes
} from '../controllers/cooperativeController.js';

const router = express.Router();

router.get('/overview', getCooperativeOverview);
router.get('/stats', getCooperativeOverview);
router.get('/votes', getCooperativeVotes);
router.post('/vote', castCooperativeVote);
router.post('/initiatives/:id/vote', castCooperativeVote);

export default router;
