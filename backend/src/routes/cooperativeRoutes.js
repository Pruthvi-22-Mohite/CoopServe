import express from 'express';
import {
  getCooperativeOverview,
  getActiveGovernancePoll,
  castCooperativeVote,
  castGovernanceVote,
  getGovernanceResults,
  getCooperativeVotes
} from '../controllers/cooperativeController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/overview', getCooperativeOverview);
router.get('/stats', getCooperativeOverview);
router.get('/votes', getCooperativeVotes);
router.post('/vote', castCooperativeVote);
router.post('/initiatives/:id/vote', castCooperativeVote);

router.get('/governance/active', optionalAuthenticate, getActiveGovernancePoll);
router.get('/governance/:pollId/results', optionalAuthenticate, getGovernanceResults);
router.post('/governance/:pollId/vote', authenticate, authorize('SERVICE_PROVIDER'), castGovernanceVote);

export default router;
