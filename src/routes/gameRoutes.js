import express from 'express';
import { createGame, getGames, getGameScores } from '../controllers/gameController.js';

const router = express.Router();

router.post('/', createGame);
router.get('/', getGames);
router.get('/:gameid/scores', getGameScores);

export default router;
