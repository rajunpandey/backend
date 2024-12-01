import express from 'express';
import { createUser, getUsers, getUserScores, getUserStats } from '../controllers/userController.js';

const router = express.Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:userId/scores', getUserScores);
router.get('/:userId/stats', getUserStats);

export default router;
