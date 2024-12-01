import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './db/index.js';
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';

dotenv.config({ path: './.env' });

const app = express();
app.use(bodyParser.json());

connectDB();

app.use('/users', userRoutes);
app.use('/games', gameRoutes);
app.use('/scores', scoreRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
