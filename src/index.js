import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db/index.js';
import { User, Game, Score } from './models/games.js';

dotenv.config({ path: './.env' });

const app = express();

app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5500'],
        credentials: true,
    })
);

app.use(bodyParser.json());

connectDB();

// API: Create or retrieve user
app.post('/users', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
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
        let user = await User.findOne({ username });

        if (!user) {
            user = new User({ username });
            await user.save();
        }

        let game = await Game.findOneAndUpdate(
            { name: 'Default Game' },
            { name: 'Default Game' },
            { upsert: true, new: true }
        );

        const newScore = new Score({ userid: user._id, gameid: game._id, score });
        await newScore.save();

        res.status(201).json({ message: 'Score saved successfully', newScore });
    } catch (error) {
        console.error('Score save error:', error);
        res.status(500).json({ error: 'Failed to save score' });
    }
});

// API: Get leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find()
            .populate({
                path: 'userid',
                select: 'username' 
            })
            .sort({ score: -1 })
            .limit(10)
            .lean();

        // If no scores exist, return a message
        if (scores.length === 0) {
            return res.status(200).json({ message: 'No scores submitted yet!' });
        }

        // Map scores to include username and score
        const leaderboard = scores.map(score => ({
            username: score.userid?.username || 'Unknown', // Fallback to 'Unknown' if username is missing
            score: score.score,
        }));

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));