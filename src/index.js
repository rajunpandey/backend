import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db/index.js';
import { User, Game, Score } from './models/games.js';

// Configure dotenv
dotenv.config({ path: './.env' });

const app = express();

// Corrected CORS configuration
app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3002'], // Allow specific frontend origins
        credentials: true, // Allow credentials like cookies, if needed
    })
);

app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// API: Create or retrieve user
app.post('/users', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Find or create user by username
        let user = await User.findOne({ username });

        if (!user) {
            user = new User({ username });
            await user.save();
        }

        res.status(201).json({ userId: user._id, username: user.username });
    } catch (error) {
        console.error('User creation error:', error);
        res.status(500).json({ error: 'Failed to create/retrieve user' });
    }
});

// API: Save user score
app.post('/scores', async (req, res) => {
    const { username, score } = req.body;

    if (!username || typeof score !== 'number') {
        return res.status(400).json({ error: 'Username and score are required' });
    }

    try {
        // Find or create user by username
        let user = await User.findOne({ username });

        if (!user) {
            user = new User({ username });
            await user.save();
        }

        // Find or create the default game
        let game = await Game.findOneAndUpdate(
            { name: 'Default Game' },
            { name: 'Default Game' },
            { upsert: true, new: true }
        );

        // Save the score
        const newScore = new Score({ userid: user._id, gameid: game._id, score });
        await newScore.save();

        res.status(201).json({ message: 'Score saved successfully', newScore });
    } catch (error) {
        console.error('Score save error:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
