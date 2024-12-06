import express from 'express';
import { saveScore, getGameScores, getUserGameScores } from '../controllers/scoreController.js';

const router = express.Router();

router.post('/', saveScore);
router.get('/game/:gameId', getGameScores);
router.get('/game/:gameId/user/:userId', getUserGameScores);

export default router;
