import express from 'express';
import { saveScore } from '../controllers/scoreController.js';

const router = express.Router();

router.post('/', saveScore);

export default router;
