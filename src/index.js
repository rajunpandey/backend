import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors'; // Import cors
import connectDB from './db/index.js';
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';

// Configure dotenv
dotenv.config({ path: './.env' });

// Initialize app
const app = express();

// Use middlewares
app.use(cors()); // Use CORS after initializing `app`
app.use(bodyParser.json());

// Connect to the database
connectDB();

// Define routes
app.use('/users', userRoutes);
app.use('/games', gameRoutes);
app.use('/scores', scoreRoutes);

// Start the server
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
