import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db/index.js';
import { User, Game, Score } from './models/games.js';

// Initialize environment variables
dotenv.config({ path: './.env' });

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5500'],
    credentials: true
}));
app.use(bodyParser.json());


// Database Connection
connectDB();

// API Endpoints
// ==============

// 1. User Management
app.post('/users', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });

        const user = await User.findOneAndUpdate(
            { username },
            {},
            { upsert: true, new: true }
        );

        res.status(201).json({ userId: user._id, username: user.username });
    } catch (error) {
        console.error('User error:', error);
        res.status(500).json({ error: 'User operation failed' });
    }
});

// 2. Score Submission
app.post('/scores', async (req, res) => {
    try {
        const { username, score, game } = req.body;
        if (!username || !game || typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid score data' });
        }

        // Game Handling
        const gameDoc = await Game.findOneAndUpdate(
            { name: game },
            { name: game },
            { upsert: true, new: true }
        );

        // User Handling
        const user = await User.findOneAndUpdate(
            { username },
            {},
            { upsert: true, new: true }
        );

        // Score Creation
        const newScore = new Score({
            userid: user._id,
            gameid: gameDoc._id,
            score
        });
        await newScore.save();

        res.status(201).json({ 
            message: 'Score saved',
            game: gameDoc.name,
            username,
            score
        });
    } catch (error) {
        console.error('Score error:', error);
        res.status(500).json({ error: 'Score save failed' });
    }
});

// 3. Leaderboard System
app.get('/leaderboard', async (req, res) => {
    try {
        const { game } = req.query;
        if (!game) return res.status(400).json({ error: 'Game name required' });

        const gameDoc = await Game.findOne({ name: game });
        if (!gameDoc) return res.status(404).json({ error: 'Game not found' });

        const scores = await Score.find({ gameid: gameDoc._id })
            .populate('userid', 'username')
            .sort({ score: -1 })
            .limit(10)
            .lean();

        res.status(200).json({
            game: gameDoc.name,
            scores: scores.map(score => ({
                username: score.userid?.username || 'Anonymous',
                score: score.score
            }))
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Leaderboard fetch failed' });
    }
});

// 4. Combined Leaderboards
app.get('/all-leaderboards', async (req, res) => {
    try {
        const games = await Game.find().lean();
        const leaderboards = await Promise.all(games.map(async game => {
            const scores = await Score.find({ gameid: game._id })
                .populate('userid', 'username')
                .sort({ score: -1 })
                .limit(3)  // Top 3 per game
                .lean();

            return {
                game: game.name,
                scores: scores.map(score => ({
                    username: score.userid?.username || 'Anonymous',
                    score: score.score
                }))
            };
        }));

        res.status(200).json(leaderboards);
    } catch (error) {
        console.error('All leaderboards error:', error);
        res.status(500).json({ error: 'Combined leaderboard fetch failed' });
    }
});




// 5. Personal Leaderboard
app.get('/scores/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { game } = req.query;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const query = { userid: user._id };
        if (game) {
            const gameDoc = await Game.findOne({ name: game });
            if (gameDoc) query.gameid = gameDoc._id;
        }

        const scores = await Score.find(query)
            .populate('gameid', 'name')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            username,
            scores: scores.map(score => ({
                game: score.gameid?.name || 'Unknown',
                score: score.score,
                date: score.createdAt
            }))
        });
    } catch (error) {
        console.error('Personal scores error:', error);
        res.status(500).json({ error: 'Failed to fetch personal scores' });
    }
});



app.get('/search', async (req, res) => {
    try {
        const { game, username } = req.query;
        const gameDoc = await Game.findOne({ name: game });
        
        const query = { gameid: gameDoc._id };
        if (username) {
            const users = await User.find({ 
                username: new RegExp(username, 'i') 
            });
            query.userid = { $in: users.map(u => u._id) };
        }

        const scores = await Score.find(query)
            .populate('userid', 'username')
            .sort({ score: -1 })
            .lean();

        res.json({
            game,
            scores: scores.map(entry => ({
                username: entry.userid?.username,
                score: entry.score
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});
// Server Initialization
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));